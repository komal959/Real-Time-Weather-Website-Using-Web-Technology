const API_BASE_URL = ["localhost", "127.0.0.1"].includes(window.location.hostname)
  ? "http://localhost:3001"
  : "";

function weatherIcon(condition) {
  switch ((condition || "").toLowerCase()) {
    case "rain":
      return "img/rain.png";
    case "clear":
      return "img/sun.png";
    case "snow":
      return "img/snow.png";
    case "clouds":
    case "smoke":
      return "img/cloud.png";
    case "mist":
    case "fog":
      return "img/mist.png";
    case "haze":
      return "img/haze.png";
    case "thunderstorm":
      return "img/thunderstorm.png";
    default:
      return "img/sun.png";
  }
}

function displayCurrentWeather(data) {
  const current = data.list[0];
  const cityMain = document.getElementById("city-name");
  const cityTemp = document.getElementById("metric");
  const weatherMain = document.querySelectorAll("#weather-main");
  const mainHumidity = document.getElementById("humidity");
  const mainFeel = document.getElementById("feels-like");
  const weatherImg = document.querySelector(".weather-icon");
  const weatherImgs = document.querySelector(".weather-icons");
  const tempMinWeather = document.getElementById("temp-min-today");
  const tempMaxWeather = document.getElementById("temp-max-today");
  const icon = weatherIcon(current.weather[0].main);

  cityMain.innerHTML = data.city.name;
  cityTemp.innerHTML = `${Math.floor(current.main.temp)}\u00B0`;
  weatherMain[0].innerHTML = current.weather[0].description;
  weatherMain[1].innerHTML = current.weather[0].description;
  mainHumidity.innerHTML = Math.floor(current.main.humidity);
  mainFeel.innerHTML = Math.floor(current.main.feels_like);
  tempMinWeather.innerHTML = `${Math.floor(current.main.temp_min)}\u00B0`;
  tempMaxWeather.innerHTML = `${Math.floor(current.main.temp_max)}\u00B0`;
  weatherImg.src = icon;
  weatherImgs.src = icon;
  displayLifestyleTips(current);
}

function displayForecast(data) {
  const dailyForecasts = {};
  const forecast = document.getElementById("future-forecast-box");
  let forecastbox = "";

  data.list.forEach((item) => {
    const date = item.dt_txt.split(" ")[0];
    const dayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const day = new Date(date).getDay();

    if (!dailyForecasts[date]) {
      dailyForecasts[date] = {
        day_today: dayName[day],
        temperature: `${Math.floor(item.main.temp)}\u00B0`,
        description: item.weather[0].description,
        weatherImg: weatherIcon(item.weather[0].main),
      };
    }
  });

  Object.keys(dailyForecasts).forEach((date) => {
    forecastbox += `
      <div class="weather-forecast-box">
        <div class="day-weather">
          <span>${dailyForecasts[date].day_today}</span>
        </div>
        <div class="weather-icon-forecast">
          <img src="${dailyForecasts[date].weatherImg}" />
        </div>
        <div class="temp-weather">
          <span>${dailyForecasts[date].temperature}</span>
        </div>
        <div class="weather-main-forecast">${dailyForecasts[date].description}</div>
      </div>`;
  });

  forecast.innerHTML = forecastbox;
}

function getForecastDate(item) {
  if (item.dt_txt) {
    return item.dt_txt.split(" ")[0];
  }

  return new Date(item.dt * 1000).toISOString().split("T")[0];
}

function getForecastTime(item) {
  if (item.dt_txt) {
    return new Date(item.dt_txt).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return new Date(item.dt * 1000).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getForecastTemp(item) {
  return item.main ? item.main.temp : item.temp;
}

function displayHourlyForecast(data) {
  const dayTabs = document.getElementById("day-tabs");
  const hourlyBox = document.getElementById("hourly-forecast-box");
  const dayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const groupedForecasts = {};
  const items = data.hourly || data.list || [];

  items.forEach((item) => {
    const date = getForecastDate(item);
    if (!groupedForecasts[date]) {
      groupedForecasts[date] = [];
    }
    groupedForecasts[date].push(item);
  });

  const dates = Object.keys(groupedForecasts);

  function renderHours(date) {
    hourlyBox.innerHTML = groupedForecasts[date]
      .map((item) => {
        return `
          <div class="hourly-card">
            <div class="hourly-time">${getForecastTime(item)}</div>
            <img src="${weatherIcon(item.weather[0].main)}" alt="" />
            <div class="hourly-temp">${Math.floor(getForecastTemp(item))}\u00B0</div>
            <div class="hourly-desc">${item.weather[0].description}</div>
          </div>`;
      })
      .join("");

    document.querySelectorAll(".day-tab").forEach((button) => {
      button.classList.toggle("active-day", button.dataset.date === date);
    });
  }

  dayTabs.innerHTML = dates
    .map((date, index) => {
      const day = dayName[new Date(date).getDay()];
      return `<button class="day-tab ${index === 0 ? "active-day" : ""}" data-date="${date}">${day}</button>`;
    })
    .join("");

  dayTabs.querySelectorAll(".day-tab").forEach((button) => {
    button.addEventListener("click", () => renderHours(button.dataset.date));
  });

  if (dates.length) {
    renderHours(dates[0]);
  }
}

function displayLifestyleTips(current) {
  const tipsBox = document.getElementById("lifestyle-tips");
  const temp = current.main.temp;
  const humidity = current.main.humidity;
  const wind = current.wind.speed;
  const condition = current.weather[0].main.toLowerCase();
  const tips = [];

  if (temp >= 32) {
    tips.push({ icon: "fa-bottle-water", text: "Drink extra water and avoid long direct sunlight." });
  } else if (temp <= 15) {
    tips.push({ icon: "fa-shirt", text: "Wear warm layers before going outside." });
  } else {
    tips.push({ icon: "fa-person-walking", text: "Good weather for a short walk or outdoor work." });
  }

  if (condition.includes("rain") || condition.includes("thunderstorm")) {
    tips.push({ icon: "fa-umbrella", text: "Carry an umbrella and avoid waterlogged roads." });
  } else if (condition.includes("haze") || condition.includes("smoke") || condition.includes("mist")) {
    tips.push({ icon: "fa-mask-face", text: "Air may feel heavy; use a mask if you are sensitive." });
  } else {
    tips.push({ icon: "fa-sun", text: "Use sunscreen if you will stay outside for long." });
  }

  if (humidity >= 75) {
    tips.push({ icon: "fa-droplet", text: "Humidity is high; choose light breathable clothes." });
  }

  if (wind >= 8) {
    tips.push({ icon: "fa-wind", text: "Wind is strong; secure loose items outdoors." });
  }

  tipsBox.innerHTML = tips
    .map((tip) => `<div class="tip-box"><i class="fa-solid ${tip.icon}"></i><span>${tip.text}</span></div>`)
    .join("");
}

navigator.geolocation.getCurrentPosition(
  async function (position) {
    try {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      const response = await fetch(`${API_BASE_URL}/api/weather/location?lat=${lat}&lon=${lon}`);

      if (!response.ok) {
        throw new Error("Unable to load weather for your location.");
      }

      const data = await response.json();
      displayCurrentWeather(data);
      displayForecast(data);

      try {
        const hourlyResponse = await fetch(`${API_BASE_URL}/api/weather/hourly?lat=${lat}&lon=${lon}`);

        if (!hourlyResponse.ok) {
          throw new Error("Hourly forecast is not available.");
        }

        const hourlyData = await hourlyResponse.json();
        displayHourlyForecast(hourlyData);
      } catch (error) {
        console.warn("Using 3-hour forecast fallback:", error);
        displayHourlyForecast(data);
      }
    } catch (error) {
      console.error("An error occurred:", error);
      alert("Unable to load weather. Please try again later.");
    }
  },
  () => {
    alert("Please turn on your location and refresh the page");
  }
);
