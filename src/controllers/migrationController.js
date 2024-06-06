import migrateCsvToDb from "../utils/csvToDb.js";

class MigrationController {
  async migrate(req, res) {
    const { locationDataSource } = req.db;
    try {
      const filepath = req.file.path;
      migrateCsvToDb(filepath, locationDataSource);
      res.status(200).json({
        message: "CSV file processing initiated",
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: "Error processing CSV file" });
    }
  }
}

export default MigrationController;
