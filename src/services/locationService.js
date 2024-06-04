import db from "../utils/db.js";

class LocationService {
  // Search locations in the database based on query
  async searchLocations(query) {
    const database = await db.connect();
    const collection = database.collection("locations");

    // Perform aggregation pipeline to find, project, and sort locations
    const location = await collection
      .aggregate([
        {
          $match: {
            name: new RegExp(query, "i"),
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
                args: ["$name", query],
                lang: "js",
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            name: 1,
            latitude: 1,
            longitude: 1,
            score: 1,
          },
        },
        {
          $sort: { score: -1 }, // Sort by score in descending order
        },
      ])
      .toArray();

    return location;
  }

}

export default new LocationService();
    