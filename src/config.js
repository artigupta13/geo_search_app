// Load environment variables from .env file
import dotenv from 'dotenv';

dotenv.config();

// Export the configuration object
export const config = {
    dbURI: process.env.DB_URI || 'mongodb://localhost:27017/',
    dbName: process.env.DB_NAME || 'geo_search',
    port: process.env.PORT || 8000
};
