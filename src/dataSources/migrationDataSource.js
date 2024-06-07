import fs from "fs";
import csvParser from "csv-parser";
import { pipeline, Transform } from "stream";
import { promisify } from "util";

const asyncPipeline = promisify(pipeline);

class MigrationDataSource {
  constructor(collection) {
    this.collection = collection;
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
}
export default MigrationDataSource;
