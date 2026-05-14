require("dotenv").config();

const path = require("path");
const express = require("express");
const cors = require("cors");
const db = require("./db");
const { initDatabase } = require("./db/init");
const {
  getCurrentWeatherByCity,
  getForecastByCity,
  getHourlyForecastByCoordinates,
  getLocationsByCoordinates,
} = require("./services/weatherService");
const { saveCityByName } = require("./services/cityService");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/weather/current", async (req, res, next) => {
  try {
    const { city } = req.query;

    if (!city) {
      return res.status(400).json({ message: "City is required." });
    }

    const data = await getCurrentWeatherByCity(city);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

app.get("/api/weather/forecast", async (req, res, next) => {
  try {
    const { city } = req.query;

    if (!city) {
      return res.status(400).json({ message: "City is required." });
    }

    const data = await getForecastByCity(city);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

app.get("/api/weather/location", async (req, res, next) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({ message: "Latitude and longitude are required." });
    }

    const locations = await getLocationsByCoordinates(lat, lon);

    if (!locations.length) {
      return res.status(404).json({ message: "Location was not found." });
    }

    const forecast = await getForecastByCity(locations[0].name);
    res.json(forecast);
  } catch (error) {
    next(error);
  }
});

app.get("/api/weather/hourly", async (req, res, next) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({ message: "Latitude and longitude are required." });
    }

    const data = await getHourlyForecastByCoordinates(lat, lon);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

app.get("/api/cities", async (_req, res, next) => {
  try {
    const result = await db.query(
      `SELECT
         id,
         name,
         state,
         country,
         latitude,
         longitude,
         temperature,
         weather_main,
         weather_description,
         weather_updated_at,
         created_at
       FROM saved_cities
       ORDER BY created_at DESC`
    );

    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

app.post("/api/cities", async (req, res, next) => {
  try {
    const { city } = req.body;

    if (!city || !city.trim()) {
      return res.status(400).json({ message: "City is required." });
    }

    const result = await saveCityByName(city.trim());

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

app.post("/api/cities/bulk", async (req, res, next) => {
  try {
    const { cities } = req.body;

    if (!Array.isArray(cities) || !cities.length) {
      return res.status(400).json({ message: "Cities array is required." });
    }

    const saved = [];
    const failed = [];

    for (const city of cities) {
      try {
        const result = await saveCityByName(city);
        saved.push(result.city);
      } catch (error) {
        failed.push({
          city,
          message: error.message,
        });
      }
    }

    res.status(201).json({
      saved,
      failed,
    });
  } catch (error) {
    next(error);
  }
});

app.delete("/api/cities/:id", async (req, res, next) => {
  try {
    const result = await db.query("DELETE FROM saved_cities WHERE id = $1 RETURNING id", [
      req.params.id,
    ]);

    if (!result.rowCount) {
      return res.status(404).json({ message: "Saved city was not found." });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(error.status || 500).json({
    message: error.message || "Something went wrong.",
    details: error.details,
  });
});

async function startServer() {
  await initDatabase();

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Weather app server running at http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error(error);
  process.exit(1);
});
