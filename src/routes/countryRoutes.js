import { Router } from "express";
import CountryController from "../controllers/countryController.js";


const router = Router();

// Define the search endpoint
router.post("/", async (req, res) => new CountryController().add(req, res));

export default router;
