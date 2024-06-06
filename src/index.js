import express from "express";
import helmet from "helmet";
import searchRoutes from "./routes/searchRoutes.js";
import migrationRoutes from "./routes/migrationRoutes.js";
import { config } from "./config.js";
import db from "../src/utils/db.js";

let locationDataSource;

export const app = express();

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
app.use("/api/search", searchRoutes);
app.use("/api/migrate", migrationRoutes);

// Start the server
app.listen(config.port, async () => {
  try {
    const database = await db.connect();
    locationDataSource = database.collection("locations");
    await locationDataSource.createIndex({ location: "2dsphere" });
    await locationDataSource.createIndex({ name: "text" });
    console.log(`Server is running on http://localhost:${config.port}`);
  } catch (error) {
    console.error("Failed to connect to server", error);
    await db.close();
  }
});
