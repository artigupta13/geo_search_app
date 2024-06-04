import { MongoClient } from "mongodb";
import { config } from "../config.js";

class Database {
  constructor() {
    this.client = null;
    this.database = null;
  }

  // Connect to the database
  async connect() {
    if (this.database) {
      // Return the existing database connection if it already exists
      return this.database;
    }

    try {
      this.client = new MongoClient(config.dbURI);

      // Connect to the MongoDB cluster
      await this.client.connect();

      // Set the database connection
      this.database = this.client.db(config.dbName);
      console.log("Connected to MongoDB");

      return this.database;
    } catch (err) {
      console.error("Failed to connect to MongoDB", err);
    }
  }

  async close() {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.database = null;
      console.log("Closed MongoDB connection");
    }
  }
}

const instance = new Database();

export default instance;
