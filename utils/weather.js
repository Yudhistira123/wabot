//const axios = require("axios");
import axios from "axios";
import { getElevation } from "./googleApi.js";

//const apiKey = "44747099862079d031d937f5cd84a57e"; // API Key OWM

export async function getWeather(lat, lon, apiKey) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=ID`;
  console.log("Fetching weather from:", url);
  try {
    const res = await axios.get(url);
    console.log("Yudhistira", res.data);
    return res.data;
  } catch (err) {
    console.error("❌ Error getWeather:", err.message);
    return null;
  }
}

// Fungsi format output cuasca
export async function formatWeather(weather) {
  const elevation = await getElevation(weather.coord.lat, weather.coord.lon);
  return (
    `🌍 *Informasi Cuaca Lengkap*\n` +
    `*(${weather.coord.lat},${weather.coord.lon})*\n\n` +
    `🌤️ Cuaca: ${weather.weather[0].main} - ${weather.weather[0].description}\n` +
    `🌡️ Suhu: ${weather.main.temp}°C\n` +
    `🤒 Terasa: ${weather.main.feels_like}°C\n` +
    `🌡️ Suhu Min: ${weather.main.temp_min}°C\n` +
    `🌡️ Suhu Max: ${weather.main.temp_max}°C\n` +
    `💧 Kelembapan: ${weather.main.humidity}%\n` +
    `🌬️ Tekanan: ${weather.main.pressure} hPa\n` +
    `🌊 Tekanan Laut: ${weather.main.sea_level ?? "-"} hPa\n` +
    `🏞️ Tekanan Darat: ${weather.main.grnd_level ?? "-"} hPa\n` +
    // `🗻 Altitude: ${calculateAltitude(
    //   weather.main.sea_level,
    //   weather.main.grnd_level
    // ).toFixed(2)} m\n` +
    `🗻 Altitude: ${elevation} m\n` +
    `👀 Jarak Pandang: ${weather.visibility} m\n` +
    `💨 Angin: ${weather.wind.speed} m/s, Arah ${weather.wind.deg}°, Gust ${
      weather.wind.gust ?? "-"
    } m/s\n` +
    `☁️ Awan: ${weather.clouds.all}%\n` +
    `🌅 Sunrise: ${new Date(weather.sys.sunrise * 1000).toLocaleTimeString(
      "id-ID"
    )}\n` +
    `🌇 Sunset: ${new Date(weather.sys.sunset * 1000).toLocaleTimeString(
      "id-ID"
    )}\n` +
    `🕒 Zona Waktu: UTC${weather.timezone / 3600}\n` +
    `🆔 City ID: ${weather.id},${weather.name}\n` +
    `📡 Source: ${weather.base}\n` +
    `⏱️ Data Timestamp: ${new Date(weather.dt * 1000).toLocaleString("id-ID")}`
  );
}

const elevation = await getElevation(lat, lon);
console.log(`🌍 Elevation for (${lat}, ${lon}) is: ${elevation} mdpl`);
function calculateAltitude(seaLevel, groundLevel) {
  // Constants
  const P0 = seaLevel; // sea level pressure (hPa) from API
  const P = groundLevel; // ground level pressure (hPa) from API

  // Barometric formula
  const altitude = 44330 * (1 - Math.pow(P / P0, 0.1903));

  return altitude; // in meters
}

//module.exports = { getWeather, formatWeather };
