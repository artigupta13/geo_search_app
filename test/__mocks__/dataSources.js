export const locationDataSource = {
  searchLocations: jest.fn(),
  calculateMeanAndStandardDeviation: jest.fn(),
  normalize: jest.fn(),
  calculateConfidenceScore: jest.fn(),
};

export const stateDataSource = {
  getState: jest.fn(),
  checkCountryExists: jest.fn(),
  addCountries: jest.fn(),
};

export const migrationDataSource = {
    migrateCsvToDb : jest.fn(),
    processCsvRow : jest.fn(),
}
