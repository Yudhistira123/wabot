const axios = require("axios");

//const apiKey = "44747099862079d031d937f5cd84a57e"; // API Key OWM

async function getWeather(lat, lon, apiKey) {
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

// Fungsi format output cuaca
function formatWeather(weather) {
  return (
    `🌍 *Informasi Cuaca Lengkap*\n\n` +
    `🌤️ Cuaca: ${weather.weather[0].main} - ${weather.weather[0].description}\n` +
    `🌡️ Suhu: ${weather.main.temp}°C\n` +
    `🤒 Terasa: ${weather.main.feels_like}°C\n` +
    `🌡️ Suhu Min: ${weather.main.temp_min}°C\n` +
    `🌡️ Suhu Max: ${weather.main.temp_max}°C\n` +
    `💧 Kelembapan: ${weather.main.humidity}%\n` +
    `🌬️ Tekanan: ${weather.main.pressure} hPa\n` +
    `🌊 Tekanan Laut: ${weather.main.sea_level ?? "-"} hPa\n` +
    `🏞️ Tekanan Darat: ${weather.main.grnd_level ?? "-"} hPa\n\n` +
    `👀 Jarak Pandang: ${weather.visibility} m\n` +
    `💨 Angin: ${weather.wind.speed} m/s, Arah ${weather.wind.deg}°, Gust ${
      weather.wind.gust ?? "-"
    } m/s\n` +
    `☁️ Awan: ${weather.clouds.all}%\n\n` +
    `🌅 Sunrise: ${new Date(weather.sys.sunrise * 1000).toLocaleTimeString(
      "id-ID"
    )}\n` +
    `🌇 Sunset: ${new Date(weather.sys.sunset * 1000).toLocaleTimeString(
      "id-ID"
    )}\n\n` +
    `🕒 Zona Waktu: UTC${weather.timezone / 3600}\n` +
    `🆔 City ID: ${weather.id}\n` +
    `📡 Source: ${weather.base}\n` +
    `⏱️ Data Timestamp: ${new Date(weather.dt * 1000).toLocaleString("id-ID")}`
  );
}

module.exports = { getWeather, formatWeather };
