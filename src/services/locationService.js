import checkEmptyString from "../utils/checkEmptyString.js";
class LocationService {
  async searchLocations(query, collection) {
   
    let { name, longitude, latitude } = query;
    let location = [];

    name = checkEmptyString(name);
    longitude = checkEmptyString(longitude);
    latitude = checkEmptyString(latitude);


    if (longitude && latitude) {
      const myquery = name ? { name: new RegExp(name, "i") } : {};

       // Perform aggregation pipeline to find, project, and sort locations
      location = await collection
        .aggregate([
          {
            $geoNear: {
              near: {
                type: "Point",
                coordinates: [parseFloat(longitude), parseFloat(latitude)],
              },
              key: "location",
              distanceField: "distance",
              spherical: true,
              query: myquery,
            },
          },

          {
            $project: {
              _id: 0,
              name: 1,
              longitude: { $arrayElemAt: ["$location.coordinates", 0] },
              latitude: { $arrayElemAt: ["$location.coordinates", 1] },
              distance: 1,
            },
          },
          {
            $sort: { distance: 1 }, // Sort by score in descending order
          },
          { $limit: 10 },
        ])
        .toArray();

      const distances = location.map((l) => {
        return l.distance;
      });

      const final_distances = location.map((l) => {
        return {
          ...l,
          score: parseFloat(
            this.calculateConfidenceScore(l.distance, distances).toFixed(1)
          ),
        };
      });

      return final_distances;
    } else if (name) {
      location = await collection
        .aggregate([
          { $match: { $text: { $search: name } } },

          { $addFields: { score: { $meta: "textScore" } } },
          {
            $project: {
              _id: 0,
              name: 1,
              longitude: { $arrayElemAt: ["$location.coordinates", 0] },
              latitude: { $arrayElemAt: ["$location.coordinates", 1] },
              score: { $round: ["$score", 2] },
            },
          },
          {
            $sort: { score: -1 }, // Sort by score in descending order
          },
          { $limit: 5 },
        ])
        .toArray();
    }

    return location;
  }

  // Search locations in the database based on query
  calculateMeanAndStandardDeviation(numbers) {
    const mean =
      numbers.reduce((sum, value) => sum + value, 0) / numbers.length;
    const variance =
      numbers.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) /
      numbers.length;
    const standardDeviation = Math.sqrt(variance);
    return { mean, standardDeviation };
  }

  normalize(value, min, max) {
    return (value - min) / (max - min);
  }

  calculateZScore(value, mean, standardDeviation) {
    return (value - mean) / standardDeviation;
  }
  calculateConfidenceScore(distance, distances) {
    const { mean, standardDeviation } =
      this.calculateMeanAndStandardDeviation(distances);
    const minDistance = Math.max(0, mean - 3 * standardDeviation); // Set a minimum threshold
    const maxDistance = mean + 3 * standardDeviation; // Set a maximum threshold

    const normalizedDistance = this.normalize(
      distance,
      minDistance,
      maxDistance
    );

    // Invert normalized distance to get a confidence score between 0 and 1
    const confidenceScore = 1 - Math.min(Math.max(normalizedDistance, 0), 1);

    return confidenceScore;
  }
}

export default new LocationService();
