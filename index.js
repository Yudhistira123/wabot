const qrcode = require("qrcode-terminal");
const axios = require("axios");
const mqtt = require("mqtt");
const https = require("https");
const port = process.env.PORT || 3000;
const { LocalAuth, Client, MessageMedia } = require("whatsapp-web.js");
const {
  getSholatByLocation,
  getKodeKota,
  getDoaAcak,
  formatDoa,
} = require("./utils/sholat");
const { sendAvatar, sendNewsMessage } = require("./utils/avatar");
const { getClubInfo, getClubActivities } = require("./utils/stravaService");
const { getCalendar, formatCalendar } = require("./utils/calendarService");
const { sendMessages } = require("./utils/mqttService");
const puppeteer = require("puppeteer");
const { initMQTT } = require("./services/mqttServices");
const { loadKnowledgeBase } = require("./utils/knowledgeBase");
const Fuse = require("fuse.js");
const { getWeather, formatWeather } = require("./utils/weather.cjs");
const {
  getAirQuality,
  interpretAQI,
  formatAirQuality,
} = require("./utils/airQualityService.cjs");

axios.defaults.httpsAgent = new https.Agent({ family: 4 });

const client = new Client({
  authStrategy: new LocalAuth({ clientId: "session-yudhi-boot" }),
  puppeteer: {
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--no-first-run",
      "--no-zygote",
      "--single-process",
      "--disable-gpu",
    ],
  },
});

client.on("authenticated", () => {
  console.log("✅ Client is authenticated");
});

client.on("auth_failure", (msg) => {
  console.error("❌ AUTHENTICATION FAILURE", msg);
});

client.on("ready", async () => {
  console.log("🎉 Client is ready!");
  const chats = await client.getChats();
  console.log(`📂 You have ${chats.length} chats open.`);
  const groups = chats.filter((chat) => chat.isGroup);
  console.log(`👥 You have ${groups.length} group chats open.`);

  console.log("\n=== LIST GROUP ===");
  groups.forEach((group, index) => {
    console.log(`${index + 1}. ${group.name} => ${group.id._serialized}`);
  });
});

client.on("disconnected", (reason) => {
  console.log("❌ Client was logged out:", reason);
});
client.initialize();
