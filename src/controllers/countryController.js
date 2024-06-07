class CountryController {
  // Handle search requests
  async add(req, res) {
    try {
      const { stateDataSource } = req.dataSources;
      stateDataSource.addCountries().then((message)=>{
        console.log(message);
      })
      return res
        .status(200)
        .json({ message: "Country state and city migration are initiated" });
    } catch (error) {
      return res.json({
        message: `Something went wrong. Error: ${error.message}`,
      });
    }
  }
}

export default CountryController;
