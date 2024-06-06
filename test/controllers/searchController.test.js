import SearchController from "../../src/controllers/searchController";
import LocationService from "../../src/services/locationService";

// Mock the locationService
jest.mock("../../src/services/locationService");

describe("SearchController", () => {
  let req, res, next;

  const searchLocationsSpy = jest
    .spyOn(LocationService.prototype, "searchLocations")
    .mockResolvedValueOnce({ suggestions: [] })
    .mockRejectedValueOnce(new Error("Something wrong"));

  beforeEach(() => {
    req = {
      db: {
        locationDataSource: "mockedDataSource",
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
    const mockedResults = { suggestions: [] };
    // locationService.searchLocations.mockResolvedValue(mockedResults);

    // Call the search method
    await SearchController.search(req, res, next);

    // Verify that locationService.searchLocations was called with the correct arguments
    expect(searchLocationsSpy).toHaveBeenCalledWith(
      req.query,
      req.db.locationDataSource
    );

    // Verify that res.json was called with the correct response
    expect(res.json).toHaveBeenCalledWith({ suggestions: mockedResults });

    // Verify that next was not called
    expect(next).not.toHaveBeenCalled();
  });

  it("should handle errors", async () => {
    // Call the search method
    await SearchController.search(req, res, next);

    // Verify that locationService.searchLocations was called with the correct arguments
    expect(searchLocationsSpy).toHaveBeenCalledWith(
      req.query,
      req.db.locationDataSource
    );

    // Verify that res.json was called with the correct response
    expect(res.json).toHaveBeenCalledWith({ message: "Something went wrong. Error: Something wrong" });
  });
});
