import { Router } from "express";
import migrationController from "../controllers/migrationController.js";

const router = Router();

// Define the migration endpoint
router.post("/migrate", (req, res) => migrationController.migrate(req, res));

export default router;
