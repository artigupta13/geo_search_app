import { Country, State, City } from "country-state-city";

class StateDataSource {
  collection = null;

  constructor(collection) {
    this.collection = collection;
  }

  static async createIndexes(collection) {
    this.collection = collection;

    await this.collection.createIndex({ country: 1 });
  }
  async getState(countryName, cityName) {
    try {
      const pipeline = [
        {
          $match: {
            "country.name": countryName,
            "states.cities": cityName,
          },
        },
        {
          $unwind: "$states",
        },
        {
          $match: {
            "states.cities": cityName,
          },
        },
        {
          $project: {
            _id: 0,
            state: "$states.isoCode",
          },
        },
      ];

      const result = await this.collection.aggregate(pipeline).toArray();

      if (result.length > 0) {
        return result[0].state;
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error finding state by city:");
    }
  }

  async checkCountryExists(country) {
    try {
      const result = await this.collection.findOne({ country });
      return result !== null;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  addCountries() {
    return new Promise(async (resolve, reject) => {
      try {
        const countries = Country.getAllCountries();

        for (const country of countries) {
          const states = State.getStatesOfCountry(country.isoCode);
          const statesData = [];

          for (const state of states) {
            const cities = City.getCitiesOfState(
              country.isoCode,
              state.isoCode
            );
            const citiesData = cities.map((city) => city.name);

            statesData.push({
              name: state.name,
              isoCode: state.isoCode,
              cities: citiesData,
            });
          }

          const data = {
            country: {
              name: country.name,
              isoCode: country.isoCode,
            },
            states: statesData,
          };

          await this.collection.updateOne(
            { "country.name": country.name },
            { $set: { ...data } },
            { upsert: true }
          );
        }
        resolve("Country details migrated successfully");
      } catch (error) {
        console.log("Unable to save country data:", error);
        reject(error);
      }
    });
  }
}

export default StateDataSource;
