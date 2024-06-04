import migrateCsvToDb from "../utils/csvToDb.js";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class MigrationController {
  async migrate(req, res) {
    try {
      const filepath = path.join(__dirname, "../data/geolocation_data.csv");
      await migrateCsvToDb(filepath);
      res
        .status(200)
        .json({
          message: "CSV file successfully processed and data saved to MongoDB",
        });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: "Error processing CSV file" });
    }
  }
}

export default new MigrationController();
