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
          // if (row.street) addressComponents.push(row.street);
          if (row.city) addressComponents.push(row.city);
          if (row.county) addressComponents.push(row.county);
          if (row.country) addressComponents.push(row.country);
          // if(row.zip_code) addressComponents.push(row.zip_code);

          // Concatenate address components into a single string
          const address = addressComponents.join(" ");

          // parse longitude and latitude value
          const longitude = parseFloat(row.longitude);
          const latitude = parseFloat(row.latitude);

          const location = {
            type: "Point",
            coordinates: [longitude, latitude],
          };

          await collection.updateOne(
            {
              name: address,
              location,
            },
            {
              $set: {
                name: address,
                location,
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
      })
      .on("error", (error) => {
        console.error("Error reading file:", error.message);
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
