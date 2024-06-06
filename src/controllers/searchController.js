import LocationService from "../services/locationService.js";


class SearchController {
  // Handle search requests
  async search(req, res) {
    try{
    const { locationDataSource } = req.db;

    // Fetch search results from the service
    const results = await new LocationService().searchLocations(req.query, locationDataSource);
    res.json({ suggestions: results });
    }catch(error){
      res.json({message: "Something went wrong"});
    }
  }
}

export default new SearchController();
