import express from "express";
import helmet from "helmet";
import searchRoutes from "./routes/searchRoutes.js";
import migrationRoutes from "./routes/migrationRoutes.js";
import { config } from "./config.js";
import db from "../src/utils/db.js";

let locationDataSource;

const app = express();

// Middleware for parsing JSON and securing the app
app.use(express.json());

app.use(helmet());

// Middleware to parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));

// Middleware to attach db connection to request
app.use(async (req, res, next) => {
  try {
    req.db = { locationDataSource };
    next();
  } catch (error) {
    console.error("Failed to connect to database", error);
    res.status(500).send("Internal Server Error");
  }
});

// Register routes
app.use("/api", searchRoutes);
app.use("/", migrationRoutes);

// Start the server
app.listen(config.port, async () => {
  try {
    const database = await db.connect();
    locationDataSource = database.collection("locations");
    await locationDataSource.createIndex({ location: "2dsphere" });
    console.log(`Server is running on http://localhost:${config.port}`);
  } catch (error) {
    console.error("Failed to connect to server", error);
    await db.close();
    process.exit(0);
  }
});

process.on("SIGINT", async () => {
  console.log("Received SIGINT. Closing MongoDB connection...");
  await db.close();
  process.exit(0);
});
