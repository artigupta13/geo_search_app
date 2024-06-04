import express from "express";
import helmet from "helmet";
import searchRoutes from "./routes/searchRoutes.js";
import migrationRoutes from "./routes/migrationRoutes.js";
import { config } from "./config.js";
import db from "../src/utils/db.js";

const app = express();

// Middleware for parsing JSON and securing the app
app.use(express.json());

app.use(helmet());

// Middleware to parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));

// Register routes
app.use("/", searchRoutes);
app.use("/", migrationRoutes);

// Start the server
app.listen(config.port, () => {
  console.log(`Server is running on http://localhost:${config.port}`);
});

process.on("SIGINT", async () => {
  console.log("Received SIGINT. Closing MongoDB connection...");
  await db.close();
  process.exit(0);
});
