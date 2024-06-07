class MigrationController {
  async migrate(req, res) {
    const { migrationDataSource, stateDataSource } = req.dataSources;

    try {
      const filepath = req.file.path;
      migrationDataSource.migrateCsvToDb(filepath, stateDataSource);
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
