import fs from "fs";
import csv from "csv-parser";
import db from "./db.js";

const migrateCsvToDb = async (filePath) => {
  try {
    const database = await db.connect();
    const collection = database.collection("locations");

    // Clear the collection to prevent duplicates
    await collection.deleteMany({});
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", async (row) => {
        // Use upsert to avoid duplicating data

        // Create an array to hold address components
        const addressComponents = [];

        // Check if each field exists and add it to the array
        if (row.city) addressComponents.push(row.city);
        if (row.county) addressComponents.push(row.county);
        if (row.country) addressComponents.push(row.country);

        // Concatenate address components into a single string
        const name = addressComponents.join(" ");
        console.log(name);
        await collection.updateOne(
          {
            name: name,
            street: row.street,
            city: row.city,
            zip_code: row.zip_code,
            county: row.county,
            country: row.country,
            time_zone: row.time_zone,
          },
          {
            $set: {
              name: name,
              street: row.street,
              city: row.city,
              zip_code: row.zip_code,
              county: row.county,
              latitude: row.latitude,
              country: row.country,
              longitude: row.longitude,
              time_zone: row.time_zone,
            },
          },
          { upsert: true }
        );
      })
      .on("end", () => {
        console.log(
          "CSV file successfully processed and data saved to MongoDB"
        );
      });
  } catch (err) {
    console.error("Error processing CSV file", err);
  }
};

export default migrateCsvToDb;
