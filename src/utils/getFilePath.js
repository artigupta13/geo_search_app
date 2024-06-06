import path from "path";
import { fileURLToPath } from "url";

const getFilePath = () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const filepath = path.join(__dirname, "../data/geolocation_data.csv");
  return filepath;
};

export default getFilePath;
