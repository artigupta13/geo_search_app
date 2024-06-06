import { Router } from "express";
import searchController from "../controllers/searchController.js";

const router = Router();

// Define the search endpoint
router.get("/", (req, res) => searchController.search(req, res));

export default router;
