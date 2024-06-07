import express from "express";
import helmet from "helmet";
import searchRoutes from "./routes/searchRoutes.js";
import migrationRoutes from "./routes/migrationRoutes.js";
import counryRoutes from "./routes/countryRoutes.js";
import { config } from "./config.js";
import db from "../src/utils/db.js";
import StateService from "./services/stateService.js";
import LocationService from "./services/locationService.js";
import MigrationService from "./services/migrationService.js";

let locationDataSource;
let stateDataSource;
let migrationDataSource;

export const app = express();

// Middleware for parsing JSON and securing the app
app.use(express.json());

app.use(helmet());

// Middleware to parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));

// Middleware to attach db connection to request
app.use(async (req, res, next) => {
  try {
    req.dataSources = { locationDataSource, stateDataSource, migrationDataSource };
    next();
  } catch (error) {
    console.error("Failed to connect to database", error);
    res.status(500).send("Internal Server Error");
  }
});

// Register routes
app.use("/api/search", searchRoutes);
app.use("/api/migrate", migrationRoutes);
app.use("/api/migrate-country", counryRoutes);

// Start the server
app.listen(config.port, async () => {
  try {
    const database = await db.connect();

    const locationCollection = database.collection("locations");
    const stateCollection = database.collection("country-state-city");

    await StateService.createIndexes(stateCollection);
    await LocationService.createIndexes(locationCollection);

    stateDataSource = new StateService(stateCollection);
    locationDataSource = new LocationService(locationCollection);
    migrationDataSource = new MigrationService(locationCollection);

    console.log(`Server is running on http://localhost:${config.port}`);
  } catch (error) {
    console.error("Failed to connect to server", error);
    await db.close();
  }
});
