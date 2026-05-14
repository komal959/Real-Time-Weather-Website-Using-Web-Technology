const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

function requireWeatherKey() {
  if (!OPENWEATHER_API_KEY) {
    const error = new Error("OPENWEATHER_API_KEY is missing in your .env file.");
    error.status = 500;
    throw error;
  }
}

async function fetchOpenWeather(url) {
  requireWeatherKey();

  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || "OpenWeather request failed.");
    error.status = response.status;
    error.details = data;
    throw error;
  }

  return data;
}

function weatherUrl(endpoint, params) {
  const url = new URL(`https://api.openweathermap.org/${endpoint}`);
  url.searchParams.set("appid", OPENWEATHER_API_KEY);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, value);
    }
  });

  return url;
}

async function getCurrentWeatherByCity(city) {
  return fetchOpenWeather(
    weatherUrl("data/2.5/weather", {
      q: city,
      units: "metric",
    })
  );
}

async function getForecastByCity(city) {
  return fetchOpenWeather(
    weatherUrl("data/2.5/forecast", {
      q: city,
      units: "metric",
    })
  );
}

async function getLocationsByCoordinates(lat, lon) {
  return fetchOpenWeather(
    weatherUrl("geo/1.0/reverse", {
      lat,
      lon,
      limit: 1,
    })
  );
}

async function getHourlyForecastByCoordinates(lat, lon) {
  return fetchOpenWeather(
    weatherUrl("data/3.0/onecall", {
      lat,
      lon,
      units: "metric",
      exclude: "minutely,daily,alerts",
    })
  );
}

module.exports = {
  getCurrentWeatherByCity,
  getForecastByCity,
  getHourlyForecastByCoordinates,
  getLocationsByCoordinates,
};
