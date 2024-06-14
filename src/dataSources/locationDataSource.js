import { getCachedData, setCachedData } from "../utils/cacheUtils.js";
import checkEmptyString from "../utils/checkEmptyString.js";
import fs from "fs";
import csvParser from "csv-parser";
import { pipeline, Transform } from "stream";
import { promisify } from "util";

const asyncPipeline = promisify(pipeline);

class LocationDataSource {
  constructor(collection) {
    this.collection = collection;
  }

  static async createIndexes(collection) {
    this.collection = collection;

    await this.collection.createIndex({ location: "2dsphere" });
    await this.collection.createIndex({ name: "text" });
  }

  async searchLocations(query) {
    let { name, longitude, latitude, page = 1, limit = 10 } = query;

    // Calculate the number of documents to skip
    const skip = (page - 1) * limit;

    const cachekey = name + longitude + latitude + page + limit;
    let response = [];
    let pipeline, count;
    const cachedData = await getCachedData(cachekey);

    if (cachedData) {
      return cachedData;
    }

    name = checkEmptyString(name);
    longitude = parseFloat(longitude);
    latitude = parseFloat(latitude);
    page = parseInt(page);
    limit = parseInt(limit);

    if (longitude && latitude) {
      const myquery = name ? { name: new RegExp(name, "i") } : {};

      pipeline = [
        {
          $geoNear: {
            near: {
              type: "Point",
              coordinates: [longitude, latitude],
            },
            key: "location",
            distanceField: "distance",
            spherical: true,
            query: myquery,
          },
        },
        {
          $facet: {
            data: [
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
                $sort: { distance: 1 }, // Sort by score in asceending order
              },
              {
                $skip: skip,
              },
              { $limit: limit },
            ],
            totalCount: [
              {
                $count: "count",
              },
            ],
          },
        },
        {
          $project: {
            data: 1,
            totalCount: { $arrayElemAt: ["$totalCount.count", 0] },
          },
        },
      ];

      // Perform aggregation pipeline to find, project, and sort locations
      let location = await this.collection.aggregate(pipeline).toArray();

      if (location[0]?.data) {
        const distances = location[0].data.map((l) => {
          return l.distance;
        });

        location[0].data = location[0]?.data.map((l) => {
          return {
            ...l,
            score: parseFloat(
              this.calculateConfidenceScore(l.distance, distances).toFixed(1)
            ),
          };
        });
      }
      response = location;
    } else if (name) {
      pipeline = [
        { $match: { $text: { $search: name } } },

        { $addFields: { score: { $meta: "textScore" } } },
        {
          $facet: {
            data: [
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
              {
                $skip: skip,
              },
              { $limit: limit },
            ],
            totalCount: [
              {
                $count: "count",
              },
            ],
          },
        },
        {
          $project: {
            data: 1,
            totalCount: { $arrayElemAt: ["$totalCount.count", 0] },
          },
        },
      ];

      response = await this.collection.aggregate(pipeline).toArray();
    }

    const totalCount = response[0].totalCount || 0; // Total number of records
    const totalPages = Math.ceil(totalCount / limit); // Total number of pages
    const currentPage = parseInt(page, 10); // Current page number

    response = {
      totalCount,
      totalPages,
      currentPage,
      suggestions: response[0]?.data || [],
    };
    if (response) await setCachedData(cachekey, response);

    return response;
  }

  async migrateCsvToDb(filePath, stateDataSource) {
    try {
      // Create a transform stream to handle each row
      const transformStream = new Transform({
        objectMode: true,
        transform: async (row, encoding, callback) => {
          try {
            await this.processCsvRow(row, stateDataSource);
            callback();
          } catch (err) {
            callback(err);
          }
        },
        flush(callback) {
          // This function is called when the stream is ending

          // Perform finalization tasks here
          console.log("End of file reached. Performing finalization tasks...");

          fs.unlinkSync(filePath);

          // Call the callback when done
          callback();
        },
      });

      // Handle backpressure
      transformStream._transform = promisify(transformStream._transform);

      // Create a read stream from the CSV file
      const readStream = fs.createReadStream(filePath).pipe(csvParser());

      // Pipeline to handle backpressure
      await asyncPipeline(readStream, transformStream);

      console.log(
        "CSV file processed and data written to MongoDB successfully"
      );
    } catch (err) {
      console.error("Error processing CSV file:", err);
    }
  }

  async processCsvRow(row, stateDataSource) {
    const updatedOn = new Date();
    const addressComponents = [];
    try {
      const stateCode = await stateDataSource.getState(row.country, row.city);
      // Check if each field exists and add it to the array

      if (row.city) addressComponents.push(row.city);
      if (stateCode) addressComponents.push(stateCode);
      if (row.county) addressComponents.push(row.county);
      if (row.country) addressComponents.push(row.country);

      // Concatenate address components into a single string
      const address = addressComponents.join(", ");

      // parse longitude and latitude value
      const longitude = parseFloat(row.longitude);
      const latitude = parseFloat(row.latitude);

      const location = {
        type: "Point",
        coordinates: [longitude, latitude],
      };

      await this.collection.updateOne(
        {
          name: address,
          location,
        },
        {
          $set: {
            name: address,
            location,
            updatedOn,
          },
        },
        { upsert: true }
      );
    } catch (error) {
      console.error(
        "Failed to save CSV data to the database. This may be due to an incorrect data type.",
        `Error Details: ${error.message}`
      );
    }
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

export default LocationDataSource;
