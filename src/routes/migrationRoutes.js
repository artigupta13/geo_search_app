import { Router } from "express";
import MigrationController from "../controllers/migrationController.js";

const router = Router();

// Define the migration endpoint
router.post("/migrate", (req, res) => new MigrationController().migrate(req, res));

export default router;
