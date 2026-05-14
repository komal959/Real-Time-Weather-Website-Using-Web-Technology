CREATE TABLE IF NOT EXISTS saved_cities (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  state VARCHAR(120),
  country VARCHAR(120),
  latitude NUMERIC(9, 6),
  longitude NUMERIC(9, 6),
  temperature NUMERIC(6, 2),
  weather_main VARCHAR(80),
  weather_description VARCHAR(160),
  weather_updated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS saved_cities_unique_location
  ON saved_cities (LOWER(name), COALESCE(LOWER(state), ''), COALESCE(LOWER(country), ''));
