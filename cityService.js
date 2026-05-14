const db = require("../db");
const { getCurrentWeatherByCity } = require("./weatherService");

async function saveCityFromWeather(weather) {
  const result = await db.query(
    `INSERT INTO saved_cities (
       name,
       country,
       latitude,
       longitude,
       temperature,
       weather_main,
       weather_description,
       weather_updated_at
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
     ON CONFLICT (LOWER(name), COALESCE(LOWER(state), ''), COALESCE(LOWER(country), ''))
     DO UPDATE SET
       latitude = EXCLUDED.latitude,
       longitude = EXCLUDED.longitude,
       temperature = EXCLUDED.temperature,
       weather_main = EXCLUDED.weather_main,
       weather_description = EXCLUDED.weather_description,
       weather_updated_at = NOW(),
       updated_at = NOW()
     RETURNING
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
       created_at`,
    [
      weather.name,
      weather.sys.country,
      weather.coord.lat,
      weather.coord.lon,
      weather.main.temp,
      weather.weather[0].main,
      weather.weather[0].description,
    ]
  );

  return result.rows[0];
}

async function saveCityByName(cityName) {
  const weather = await getCurrentWeatherByCity(cityName.trim());
  const city = await saveCityFromWeather(weather);

  return {
    city,
    weather,
  };
}

module.exports = {
  saveCityByName,
};
