// Load environment variables from .env file
import dotenv from 'dotenv';

dotenv.config();

// Export the configuration object
export const config = {
    dbURI: process.env.DB_URI,
    dbName: process.env.DB_NAME,
    port: process.env.PORT
};
