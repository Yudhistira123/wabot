const express = require("express");
const qrcode = require("qrcode-terminal");
const { LocalAuth, Client } = require("whatsapp-web.js");
const { initMQTT } = require("./utils/mqtt");
const { sendAvatar } = require("./utils/avatar");
const { getSholatByLocation, getKodeKota } = require("./utils/sholat");
const { getWeather, formatWeatherMessage } = require("./utils/weather");

const app = express();
const port = process.env.PORT || 3000;

// WhatsApp Client
const client = new Client({
  authStrategy: new LocalAuth({ clientId: "session-yudhi-boot" }),
  puppeteer: { headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] }
});

// MQTT Setup
const mqttBroker = "mqtt://103.27.206.14:1883";
const mqttTopics = ["R1.JC.05", "R1.JC.06"];
initMQTT(mqttBroker, mqttTopics, sendMessages);

client.on("qr", (qr) => qrcode.generate(qr, { small: true }));
client.on("ready", () => console.log("Client is ready!"));

// Handler Pesan
client.on("message", async (message) => {
  if (message.type === "location") {
    const { latitude, longitude } = message.location;
    const weather = await getWeather(latitude, longitude);
    if (weather) {
      const replyMsg = formatWeatherMessage(weather);
      const chat = await message.getChat();
      await chat.sendMessage(replyMsg);
    }
  }
  // ... tambahkan handler lain (jadwal sholat, avatar, dsb.)
});

client.initialize();
app.listen(port, () => console.log(`Server running at ${port}`));
