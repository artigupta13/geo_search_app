import checkEmptyString from "../utils/checkEmptyString.js";
class LocationService {
  // Search locations in the database based on query
  async searchLocations(query, collection) {
    // Perform aggregation pipeline to find, project, and sort locations
    console.log("Query........", query);
    let { name, longitude, latitude } = query;
    name = checkEmptyString(name);
    longitude = checkEmptyString(longitude);
    latitude = checkEmptyString(latitude);
    let location;
    if (longitude && latitude) {

      const myquery = name ? { name: new RegExp(name, "i") } : {};

      location = await collection
        .aggregate([
          {
            $geoNear: {
              near: {
                type: "Point",
                coordinates: [parseFloat(longitude), parseFloat(latitude)],
              },
              key: "location",
              distanceField: "score",
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
              score: 1,
            },
          },
          { $limit: 5 },
        ])
        .toArray();
      console.log(location);
    } else if (name) {
      console.log("1");
      location = await collection
        .aggregate([
          {
            $match: {
              name: new RegExp(name, "i"),
            },
          },
          {
            $addFields: {
              score: {
                $function: {
                  body: `function (name, query) {
                    let score = 0;
                    if (name.toLowerCase().includes(query.toLowerCase())) {
                      score = query.length / name.length;
                    }
                    return score;
                }`,
                  args: ["$name", name],
                  lang: "js",
                },
              },
            },
          },
          {
            $project: {
              _id: 0,
              name: 1,
              longitude: { $arrayElemAt: ["$location.coordinates", 0] },
              latitude: { $arrayElemAt: ["$location.coordinates", 1] },
              score: 1,
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
}

export default new LocationService();
