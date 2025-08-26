const axios = require("axios");

async function getAirQuality(lat, lon, apiKey) {
  const url = `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;
  const res = await axios.get(url);
  return res.data;
}

function interpretAQI(aqi) {
  switch (aqi) {
    case 1: return "🟢 Baik";
    case 2: return "🟡 Cukup";
    case 3: return "🟠 Sedang";
    case 4: return "🔴 Buruk";
    case 5: return "🟣 Sangat Buruk";
    default: return "❓ Tidak diketahui";
  }
}

async function getWeather(apiKey, lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=id`;
  const res = await axios.get(url);
  return res.data;
}

module.exports = { getAirQuality, interpretAQI };