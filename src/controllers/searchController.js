import locationService from '../services/locationService.js';

class SearchController {
    // Handle search requests
    async search(req, res) {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({ error: 'Query parameter is required' });
        }

        // Fetch search results from the service
        const results = await locationService.searchLocations(q);
        res.json({ suggestions: results });
    }
}

export default new SearchController();
