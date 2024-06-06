// LocationService.test.js
import LocationService from "../../src/services/locationService";
import { getCachedData, setCachedData } from "../../src/utils/cacheUtils";
import checkEmptyString from "../../src/utils/checkEmptyString";

// Mock the dependencies
const collectionMock = {
  aggregate: jest.fn().mockReturnThis(),
  toArray: jest.fn(),
};

jest.mock("../../src/utils/checkEmptyString");
jest.mock("../../src/utils/cacheUtils");
jest.mock("ioredis");

describe("LocationService", () => {
  let locationService;

  beforeEach(async () => {
    locationService = new LocationService();
    jest.clearAllMocks();
  });

  afterEach(async () => {
    jest.clearAllTimers();
    jest.clearAllMocks();
  });

  describe("searchLocations", () => {
    it("should return cached data if available", async () => {
      // Mock the query object
      const query = {
        name: "test",
        longitude: "10",
        latitude: "20",
      };

      // Mock the result for  search api final response
      const expectedResult = [
        {
          name: "Location1",
          longitude: 10,
          latitude: 20,
          distance: 5,
          score: 0.7,
        },
        {
          name: "Location1",
          longitude: 11,
          latitude: 20,
          distance: 6,
          score: 0.3,
        },
      ];
      const cacheKey = "test1020";
      const cachedData = expectedResult;

      getCachedData.mockResolvedValueOnce(cachedData);

      // Call the searchLocations method
      const result = await locationService.searchLocations(
        query,
        collectionMock
      );

      // Assertions
      expect(result).toEqual(cachedData);
      expect(getCachedData).toHaveBeenCalledWith(cacheKey);
      expect(collectionMock.aggregate).not.toHaveBeenCalled();
    });

    it("should search locations by coordinates and cache the result", async () => {
      const query = { name: "test", longitude: "10", latitude: "20" };
      const cacheKey = "test1020";

      const dbResult = [
        { name: "Location1", longitude: 10, latitude: 20, distance: 5 },
        { name: "Location2", longitude: 11, latitude: 20, distance: 6 },
      ];

      collectionMock.toArray.mockResolvedValueOnce(dbResult);
      checkEmptyString.mockImplementation((val) => val);

      const expectedResult = [
        {
          name: "Location1",
          longitude: 10,
          latitude: 20,
          distance: 5,
          score: 0.7,
        },
        {
          name: "Location2",
          longitude: 11,
          latitude: 20,
          distance: 6,
          score: 0.3,
        },
      ];

      const result = await locationService.searchLocations(
        query,
        collectionMock
      );

      expect(result).toEqual(expectedResult);
      expect(getCachedData).toHaveBeenCalledWith(cacheKey);
      expect(collectionMock.aggregate).toHaveBeenCalledTimes(1);
      expect(collectionMock.toArray).toHaveBeenCalledTimes(1);
      expect(setCachedData).toHaveBeenCalledWith(cacheKey, expectedResult);
    });

    it("should search locations by name and cache the result", async () => {
      const query = { name: "test" };
      const cacheKey = "testundefinedundefined";

      const dbResult = [
        { name: "Location1", longitude: 10, latitude: 20, score: 0.75 },
      ];

      collectionMock.toArray.mockResolvedValueOnce(dbResult);
      checkEmptyString.mockImplementation((val) => val);

      const result = await locationService.searchLocations(
        query,
        collectionMock
      );

      expect(result).toEqual(dbResult);
      expect(getCachedData).toHaveBeenCalledWith(cacheKey);
      expect(collectionMock.aggregate).toHaveBeenCalledTimes(1);
      expect(collectionMock.toArray).toHaveBeenCalledTimes(1);
      expect(setCachedData).toHaveBeenCalledWith(cacheKey, dbResult);
    });

    // Write more test cases for other scenarios
  });

  describe("calculateMeanAndStandardDeviation", () => {
    // Write tests for calculateMeanAndStandardDeviation method
  });

  describe("normalize", () => {
    // Write tests for normalize method
  });


  describe("calculateConfidenceScore", () => {
    // Write tests for calculateConfidenceScore method
  });
});
