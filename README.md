# Node.js Application README

## Introduction
This is a Node.js application designed to perform data migration and search operations. It utilizes MongoDB for data storage and retrieval, and Redis for caching purposes.

## Prerequisites
Before running the application, make sure you have the following installed:
- MongoDB
- Redis
- Node.js (v20.12.2)
- npm (v10.5.0)

## Setup
1. Start MongoDB:

2. Start Redis:
- For Mac users:
  ```
  brew services start redis
  ```
- For other platforms, please refer to the official Redis documentation for installation instructions.

3. Install dependencies:
 ```
  npm install
  ```



## Running the Application
To start the application, run the following command:
 ```
  npm run start
  ```


By default, the application runs on port 8000.

## API Endpoints
1. **Data Migration API:**
   - Endpoint: `/api/migrate`
   - HTTP request: POST
   - Description: This API endpoint is used to migrate data from CSV files to MongoDB.

   ![alt text](docs/migrate.png)

2. **Search API:**
   - Endpoint: `/api/search`
    - HTTP request: GET
   - Description: This API endpoint is used to search data stored in MongoDB.

   ![alt text](docs/search.png)

## Additional Notes
- Make sure MongoDB and Redis are running in the background before starting the application.
