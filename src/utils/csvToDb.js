import fs from "fs";
import csv from "csv-parser";

const migrateCsvToDb = async (filePath, collection) => {
  try {
    // Clear the collection to prevent duplicates
    await collection.deleteMany({});
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", async (row) => {
        // Use upsert to avoid duplicating data

        // Create an array to hold address components
        const addressComponents = [];
        try {
          // Check if each field exists and add it to the array
          if (row.city) addressComponents.push(row.city);
          if (row.county) addressComponents.push(row.county);
          if (row.country) addressComponents.push(row.country);

          // Concatenate address components into a single string
          const address = addressComponents.join(" ");
          const longitude = parseFloat(row.longitude);
          const latitude = parseFloat(row.latitude);

          await collection.updateOne(
            {
              name: address,
              location: {
                type: "Point",
                coordinates: [parseFloat(longitude), parseFloat(latitude)],
              },
            },
            {
              $set: {
                name: address,
                location: {
                  type: "Point",
                  coordinates: [longitude, latitude],
                },
              },
            },
            { upsert: true }
          );
        } catch (error) {
          console.error(
            "unable to save csv data to DB due to wrong type",
            error.message
          );
        }
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
