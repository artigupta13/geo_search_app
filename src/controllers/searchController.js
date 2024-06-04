import locationService from "../services/locationService.js";

class SearchController {
  // Handle search requests
  async search(req, res) {
    const { locationDataSource } = req.db;

    // Fetch search results from the service
    const results = await locationService.searchLocations(req.query, locationDataSource);
    res.json({ suggestions: results });
  }
}

export default new SearchController();
