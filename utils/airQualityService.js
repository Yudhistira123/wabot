//const axios = require("axios");
import axios from "axios";

async function getAirQuality(lat, lon, apiKey) {
  const url = `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;
  const res = await axios.get(url);
  return res.data;
}

function interpretAQI(aqi) {
  switch (aqi) {
    case 1:
      return "🟢 Baik";
    case 2:
      return "🟡 Cukup";
    case 3:
      return "🟠 Sedang";
    case 4:
      return "🔴 Buruk";
    case 5:
      return "🟣 Sangat Buruk";
    default:
      return "❓ Tidak diketahui";
  }
}

async function getWeather(apiKey, lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=id`;
  const res = await axios.get(url);
  return res.data;
}

// Fungsi format output AQI
export function formatAirQuality(description, data) {
  const aqi = data.list[0].main.aqi;
  const comp = data.list[0].components;
  return (
    `📍 Lokasi: ${description}\n\n` +
    `🌍 *Air Quality Info*\n` +
    `🌫️ AQI: ${aqi} → ${interpretAQI(aqi)}\n` +
    `💨 Komponen:\n` +
    `- CO: ${comp.co} μg/m³\n` +
    `- NO: ${comp.no} μg/m³\n` +
    `- NO₂: ${comp.no2} μg/m³\n` +
    `- O₃: ${comp.o3} μg/m³\n` +
    `- SO₂: ${comp.so2} μg/m³\n` +
    `- PM2.5: ${comp.pm2_5} μg/m³\n` +
    `- PM10: ${comp.pm10} μg/m³\n` +
    `- NH₃: ${comp.nh3} μg/m³`
  );
}

exports = {
  getAirQuality,
  interpretAQI,
  getWeather,
  formatAirQuality,
};
