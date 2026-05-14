const searchinput = document.querySelector(".searchinput");
const API_BASE_URL = ["localhost", "127.0.0.1"].includes(window.location.hostname)
  ? "http://localhost:3001"
  : "";
const normalMessage = document.querySelector(".normal-message");
const errorMessage = document.querySelector(".error-message");
const addedMessage = document.querySelector(".added-message");
const cityBox = document.querySelector(".city-box");

const months_name = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const today = new Date();
document.querySelector(".date").innerHTML = `${months_name[today.getMonth()]} ${today.getDate()}, ${today.getFullYear()}`;

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

function getOrCreateBox() {
  let box = document.querySelector(".box");

  if (!box) {
    box = document.createElement("div");
    box.className = "box";
    cityBox.appendChild(box);
  }

  return box;
}

function renderCityWeather(data, prepend = false) {
  const box = getOrCreateBox();
  const weatherBox = document.createElement("div");
  weatherBox.className = "weather-box";

  weatherBox.innerHTML = `
    <div class="name">
      <div class="city-name city">${data.name}</div>
      <div class="weather-temp temp">${Math.floor(data.main.temp)}\u00B0</div>
    </div>
    <div class="weather-icon">
      <img class="weather" src="${weatherIcon(data.weather[0].main)}" />
    </div>
  `;

  if (prepend) {
    box.prepend(weatherBox);
  } else {
    box.appendChild(weatherBox);
  }
}

function renderSavedCity(city, prepend = false) {
  const box = getOrCreateBox();
  const weatherBox = document.createElement("div");
  weatherBox.className = "weather-box";
  const temperature = city.temperature === null ? "--" : Math.floor(Number(city.temperature));

  weatherBox.innerHTML = `
    <div class="name">
      <div class="city-name city">${city.name}</div>
      <div class="weather-temp temp">${temperature}\u00B0</div>
    </div>
    <div class="weather-icon">
      <img class="weather" src="${weatherIcon(city.weather_main)}" />
    </div>
  `;

  if (prepend) {
    box.prepend(weatherBox);
  } else {
    box.appendChild(weatherBox);
  }
}

async function fetchWeather(cityName, prepend = false) {
  const response = await fetch(`${API_BASE_URL}/api/weather/current?city=${encodeURIComponent(cityName)}`);

  if (!response.ok) {
    return false;
  }

  const data = await response.json();
  renderCityWeather(data, prepend);
  return true;
}

async function loadSavedCities() {
  const response = await fetch(`${API_BASE_URL}/api/cities`);

  if (!response.ok) {
    await Promise.all(["London", "Paris", "New York", "Mumbai", "Tokyo"].map((name) => fetchWeather(name)));
    return;
  }

  const cities = await response.json();

  if (!cities.length) {
    await Promise.all(["London", "Paris", "New York", "Mumbai", "Tokyo"].map((name) => fetchWeather(name)));
    return;
  }

  cities.forEach((city) => renderSavedCity(city));
}

const section = document.querySelector(".add-section");
const navBtn = document.querySelector(".button");
const navIcon = document.querySelector(".btn-icon");

navBtn.addEventListener("click", () => {
  if (section.style.top === "-60rem") {
    section.style.top = "100px";
    navIcon.className = "fa-solid fa-circle-xmark";
  } else {
    section.style.top = "-60rem";
    navIcon.className = "fa-solid fa-circle-plus";
  }
});

searchinput.addEventListener("keydown", async function (event) {
  if (event.key !== "Enter" || !searchinput.value.trim()) {
    return;
  }

  const response = await fetch(`${API_BASE_URL}/api/cities`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ city: searchinput.value.trim() }),
  });

  if (response.ok) {
    const data = await response.json();
    renderCityWeather(data.weather, true);
    searchinput.value = "";
    normalMessage.style.display = "none";
    errorMessage.style.display = "none";
    addedMessage.style.display = "block";
  } else {
    normalMessage.style.display = "none";
    errorMessage.style.display = "block";
    addedMessage.style.display = "none";
  }
});

loadSavedCities();
