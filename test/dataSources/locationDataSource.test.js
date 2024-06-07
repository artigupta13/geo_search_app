import { getCachedData, setCachedData } from "../../src/utils/cacheUtils.js";
import checkEmptyString from "../../src/utils/checkEmptyString.js";
import LocationDataSource from "../../src/dataSources/locationDataSource.js";

// Mock the dependencies
jest.mock("../../src/utils/cacheUtils.js");
jest.mock("../../src/utils/checkEmptyString.js");

describe("LocationDataSource", () => {
  let collectionMock;
  let locationDataSource;

  beforeEach(() => {
    collectionMock = {
      createIndex: jest.fn(),
      aggregate: jest.fn().mockReturnThis(),
      toArray: jest.fn(),
    };

    locationDataSource = new LocationDataSource(collectionMock);
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createIndexes", () => {
    it("should create indexes for location and name", async () => {
      await LocationDataSource.createIndexes(collectionMock);

      expect(collectionMock.createIndex).toHaveBeenCalledWith({
        location: "2dsphere",
      });
      expect(collectionMock.createIndex).toHaveBeenCalledWith({ name: "text" });
    });
  });

  describe("searchLocations", () => {
    it("should return cached data if available", async () => {
      const query = { name: "test", longitude: "0", latitude: "0" };
      const cachedData = [{ name: "cached location" }];
      getCachedData.mockResolvedValue(cachedData);

      const result = await locationDataSource.searchLocations(query);

      expect(getCachedData).toHaveBeenCalledWith("test00");
      expect(result).toEqual(cachedData);
    });

    it("should search locations by coordinates if provided", async () => {
      const query = { name: "test", longitude: "0", latitude: "0" };
      getCachedData.mockResolvedValue(null);
      checkEmptyString.mockImplementation((val) => val);

      const locationData = [
        {
          name: "location1",
          location: { coordinates: [0, 0] },
          distance: 100,
        },
      ];
      collectionMock.toArray.mockResolvedValue(locationData);

      const result = await locationDataSource.searchLocations(query);

      expect(collectionMock.aggregate).toHaveBeenCalled();
      expect(setCachedData).toHaveBeenCalledWith("test00", expect.any(Array));
      expect(result).toEqual(
        expect.arrayContaining([expect.objectContaining({ name: "location1" })])
      );
    });

    it("should search locations by name if coordinates are not provided", async () => {
      const query = { name: "test" };
      getCachedData.mockResolvedValue(null);
      checkEmptyString.mockImplementation((val) => val);

      const locationData = [
        {
          name: "location1",
          latitude: 0,
          longitude: 0,
          score: 1,
        },
      ];
      collectionMock.toArray.mockResolvedValue(locationData);
      const result = await locationDataSource.searchLocations(query);
      // expect(collectionMock.aggregate).toHaveBeenCalled();
      expect(setCachedData).toHaveBeenCalledWith(
        "testundefinedundefined",
        locationData
      );
      expect(result).toEqual(locationData);
    });
  });

  describe("calculateMeanAndStandardDeviation", () => {
    it("should calculate mean and standard deviation", () => {
      const numbers = [1, 2, 3, 4, 5];
      const { mean, standardDeviation } =
        locationDataSource.calculateMeanAndStandardDeviation(numbers);

      expect(mean).toBeCloseTo(3);
      expect(standardDeviation).toBeCloseTo(1.4142);
    });
  });

  describe("normalize", () => {
    it("should normalize value within range", () => {
      const value = 5;
      const min = 0;
      const max = 10;
      const normalizedValue = locationDataSource.normalize(value, min, max);

      expect(normalizedValue).toBeCloseTo(0.5);
    });
  });

  describe("calculateConfidenceScore", () => {
    it("should calculate confidence score based on distance and distances array", () => {
      const distance = 100;
      const distances = [50, 100, 150];
      const confidenceScore = locationDataSource.calculateConfidenceScore(
        distance,
        distances
      );

      expect(confidenceScore).toBeGreaterThan(0);
      expect(confidenceScore).toBeLessThanOrEqual(1);
    });
  });
});
