class SearchController {
  // Handle search requests
  async search(req, res) {
    try {
      const { locationDataSource } = req.dataSources;

      // Fetch search results from the service
      const results = await locationDataSource.searchLocations(req.query);
      res.json({ suggestions: results });
    } catch (error) {
      res.json({ message: `Something went wrong. Error: ${error.message}` });
    }
  }
}

export default new SearchController();
