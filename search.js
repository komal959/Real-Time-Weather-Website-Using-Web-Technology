const searchinput = document.querySelector(".searchinput");
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

async function search(city) {
  const response = await fetch(`${API_BASE_URL}/api/weather/current?city=${encodeURIComponent(city)}`);

  if (response.ok) {
    const data = await response.json();

    document.querySelector(".return").style.display = "block";
    document.querySelector(".message").style.display = "none";
    document.querySelector(".error-message").style.display = "none";

    document.querySelector(".weather-img").src = weatherIcon(data.weather[0].main);
    document.querySelector(".city-name").innerHTML = data.name;
    document.querySelector(".weather-temp").innerHTML = `${Math.floor(data.main.temp)}\u00B0`;
    document.querySelector(".wind").innerHTML = `${Math.floor(data.wind.speed)} m/s`;
    document.querySelector(".pressure").innerHTML = `${Math.floor(data.main.pressure)} hPa`;
    document.querySelector(".humidity").innerHTML = `${Math.floor(data.main.humidity)}%`;
    document.querySelector(".sunrise").innerHTML = new Date(data.sys.sunrise * 1000).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    document.querySelector(".sunset").innerHTML = new Date(data.sys.sunset * 1000).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } else {
    document.querySelector(".return").style.display = "none";
    document.querySelector(".message").style.display = "none";
    document.querySelector(".error-message").style.display = "block";
  }
}

searchinput.addEventListener("keydown", function (event) {
  if (event.key === "Enter" && searchinput.value.trim()) {
    search(searchinput.value.trim());
  }
});
