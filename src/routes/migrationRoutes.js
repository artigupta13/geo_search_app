import { Router } from "express";
import MigrationController from "../controllers/migrationController.js";
import multer from "multer";
const router = Router();
const upload = multer({ dest: "uploads/" });

// Define the migration endpoint
router.post("/", upload.single("file"), (req, res) =>
  new MigrationController().migrate(req, res)
);

export default router;
