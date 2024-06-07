import SearchController from "../../src/controllers/searchController";
import {
  locationDataSource,
  migrationDataSource,
  stateDataSource,
} from "../__mocks__/dataSources";

// // Mock the locationService
// jest.mock("../../src/services/locationDataSource");

describe("SearchController", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      dataSources: {
        locationDataSource,
        migrationDataSource,
        stateDataSource,
      },
      query: {
        name: "london",
        longitude: "50",
        latitude: "60",
      }, // You can add query parameters if needed
    };

    res = {
      json: jest.fn(),
    };

    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should search locations and return suggestions", async () => {
    // Mock the results returned by locationService.searchLocations
    const mockedResults = [];
    locationDataSource.searchLocations.mockResolvedValueOnce(mockedResults);

    // Call the search method
    await SearchController.search(req, res, next);

    // Verify that locationService.searchLocations was called with the correct arguments
    expect(locationDataSource.searchLocations).toHaveBeenCalledWith(req.query);

    // Verify that res.json was called with the correct response
    expect(res.json).toHaveBeenCalledWith({ suggestions: mockedResults });

    // Verify that next was not called
    expect(next).not.toHaveBeenCalled();
  });

  it("should handle errors", async () => {
    locationDataSource.searchLocations.mockRejectedValueOnce(
      new Error("Some error")
    );

    // Call the search method
    await SearchController.search(req, res, next);

    // Verify that locationService.searchLocations was called with the correct arguments
    expect(locationDataSource.searchLocations).toHaveBeenCalledWith(req.query);

    // Verify that res.json was called with the correct response
    expect(res.json).toHaveBeenCalledWith({
      message: "Something went wrong. Error: Some error",
    });
  });
});
