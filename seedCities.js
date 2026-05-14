require("dotenv").config();

const cities = require("../data/cities.json");
const { saveCityByName } = require("../services/cityService");

async function seedCities() {
  const summary = {
    added: 0,
    failed: 0,
  };

  for (const city of cities) {
    try {
      const result = await saveCityByName(city);
      summary.added += 1;
      console.log(`Saved ${result.city.name}, ${result.city.country}`);
    } catch (error) {
      summary.failed += 1;
      console.log(`Skipped ${city}: ${error.message}`);
    }
  }

  console.log(`Done. Saved: ${summary.added}. Failed: ${summary.failed}.`);
  process.exit(summary.failed ? 1 : 0);
}

seedCities();
