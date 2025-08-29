const qrcode = require("qrcode-terminal");
const axios = require("axios");
const mqtt = require("mqtt");
const https = require("https");
const port = process.env.PORT || 3000;
const { LocalAuth, Client, MessageMedia } = require("whatsapp-web.js");
const {
  getAirQuality,
  interpretAQI,
  formatAirQuality,
} = require("./utils/airQualityService");
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
const { getWeather, formatWeather } = require("./utils/weather");

axios.defaults.httpsAgent = new https.Agent({ family: 4 });

// =============== MQTT SETUP =================
// const mqttBroker = "mqtt://103.27.206.14:1883";  // or your own broker
// const mqttTopics = ["R1.JC.05", "R1.JC.06"];
// const mqttClient = mqtt.connect(mqttBroker);

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
initMQTT(client);

client.on("qr", (qr) => {
  console.log("QR RECEIVED", qr);
  qrcode.generate(qr, { small: true });
});
client.on("authenticated", () => {
  console.log("Client is authenticated");
});
client.on("ready", async () => {
  console.log("Client is ready!");
  // Ambil semua chat
  const chats = await client.getChats();
  const groups = chats.filter((chat) => chat.isGroup);

  console.log("\n=== LIST GROUP ===");
  groups.forEach((group, index) => {
    console.log(`${index + 1}. ${group.name} => ${group.id._serialized}`);
  });
});
let knowledgeBase = [];
loadKnowledgeBase("template_chatbot.csv").then((kb) => {
  knowledgeBase = kb;
  //============
  client.on("message", async (message) => {
    // message group
    if (message.from.endsWith("@g.us")) {
      // <- cek kalau pengirim dari grup
      console.log(`📩 Pesan dari Grup: ${message.body}`);
      // Ambil info group
      const chat = await message.getChat();
      console.log(`👥 Nama Grup: ${chat.name}`);
      // Ambil info pengirim
      const sender = message._data.notifyName || message.from;
      console.log(`👤 Pengirim: ${sender}`);

      if (message.body.toLowerCase().includes("sg4")) {
        // Change to your admin number
        const adminNumber = "628122132341";
        for (const participant of chat.participants) {
          const contact = await client.getContactById(
            participant.id._serialized
          );
          const name = contact.pushname || contact.number;
          const avatarUrl = await contact.getProfilePicUrl();
          await sendAvatar(client, participant, adminNumber, name, avatarUrl);
          //   await message.reply("✅ All avatars are being sent to admin.");
        }
      } else if (message.body.toLowerCase().startsWith("jadwal sholat")) {
        const namaKota = message.body
          .toLowerCase()
          .replace("jadwal sholat", "")
          .trim();
        console.log(`🔍 Mencari kode kota untuk: ${namaKota}`);
        if (!namaKota) {
          await chat.sendMessage(
            "⚠️ Tolong sebutkan nama kota. Contoh: *jadwal sholat bandung*"
          );
          return;
        }
        console.log(`🔍 Mencari kode kota untuk: ${namaKota}`);
        const idKotaArray = await getKodeKota(namaKota);
        if (idKotaArray.length === 0) {
          await chat.sendMessage(
            `⚠️ Tidak ditemukan kota dengan nama ${namaKota}.`
          );
          return;
        }
        for (const idKota of idKotaArray) {
          const sholatData = await getSholatByLocation(idKota);
          if (sholatData && sholatData.data) {
            const jadwal = sholatData.data.jadwal;
            let replyMsg =
              `🕌 *Jadwal Sholat ${sholatData.data.lokasi}*\n` +
              `📅 Hari,Tgl: ${jadwal.tanggal}\n\n` +
              `🌅 Imsak     : ${jadwal.imsak} WIB\n` +
              `🌄 Subuh     : ${jadwal.subuh} WIB\n` +
              `🌤️ Terbit    : ${jadwal.terbit} WIB\n` +
              `🌞 Dhuha     : ${jadwal.dhuha} WIB\n` +
              `☀️ Dzuhur    : ${jadwal.dzuhur} WIB\n` +
              `🌇 Ashar     : ${jadwal.ashar} WIB\n` +
              `🌆 Maghrib   : ${jadwal.maghrib} WIB\n` +
              `🌙 Isya      : ${jadwal.isya} WIB`;

            await chat.sendMessage(replyMsg);
          } else {
            await chat.sendMessage("⚠️ Gagal mengambil jadwal sholat.");
          }
        }
      } else if (message.body.toLowerCase().startsWith("doa hari ini")) {
        const doa = await getDoaAcak();
        const text = formatDoa(doa);
        await chat.sendMessage(text);
      } else if (message.type === "location") {
        //const chat = await message.getChat();
        const { latitude, longitude, description } = message.location; // ✅ lowercase 'location'

        console.log(
          `📍 Lokasi diterima: ${latitude}, ${longitude} (${
            description || "tanpa deskripsi"
          })`
        );

        const apiKey = "44747099862079d031d937f5cd84a57e"; // <- pakai key kamu
        const data = await getAirQuality(latitude, longitude, apiKey);
        const replyMsg1 = formatAirQuality(description, data);
        const weather = await getWeather(apiKey, latitude, longitude);
        const replyMsg2 = formatWeather(weather);
        const chat = await message.getChat();
        await chat.sendMessage(replyMsg1 + "\n\n" + replyMsg2);
        console.log(`✅ Sent weather info to group: ${chat.name}`);
      } else if (message.body.toLowerCase() === "hasil club lari") {
        const CLUB_ID = "728531"; // ID Club Laris
        const clubInfo = await getClubInfo(CLUB_ID);
        const activities = await getClubActivities(CLUB_ID);
        if (!clubInfo) {
          message.reply("❌ Gagal ambil info club.");
          return;
        }
        if (clubInfo.cover_photo_small) {
          try {
            const media = await MessageMedia.fromUrl(
              clubInfo.cover_photo_small
            );
            await client.sendMessage(message.from, media, {
              caption: `🏃 *${clubInfo.name}*`,
            });
          } catch (err) {
            console.error("❌ Error sending cover photo:", err.message);
          }
        }

        // Build text reply
        let reply =
          `🌍 Lokasi: ${clubInfo.city}, ${clubInfo.state}, ${clubInfo.country}\n` +
          `👥 Member: ${clubInfo.member_count}\n\n` +
          `ℹ️ ${clubInfo.description || "No description"}\n\n` +
          `=== 10 Aktivitas Terbaru ===\n\n`;

        activities.forEach((act, i) => {
          const distanceKm = act.distance / 1000;
          const movingMinutes = (act.moving_time / 60).toFixed(0);

          // pace in seconds/km
          const paceSecPerKm = act.moving_time / distanceKm;
          const paceMin = Math.floor(paceSecPerKm / 60);
          const paceSec = Math.round(paceSecPerKm % 60);
          const paceFormatted = `${paceMin}:${paceSec
            .toString()
            .padStart(2, "0")} /km`;
          reply +=
            `${i + 1}. ${act.athlete.firstname} ${act.athlete.lastname}\n` +
            `📌 ${act.name}\n` +
            `📏 ${distanceKm.toFixed(2)} km\n` +
            `⏱️ ${movingMinutes} menit\n` +
            `🏃 Pace: ${paceFormatted}\n` +
            `⛰️ Elevasi: ${act.total_elevation_gain} m\n\n`;
        });

        const chat = await message.getChat();
        await chat.sendMessage(reply);
        //  message.reply(reply);
      } else if (message.body.toLowerCase().startsWith("kal")) {
        const parts = message.body.split(" ");
        const year = parts[1];
        const month = parts[2];

        if (!year || !month) {
          await message.reply("⚠️ Format salah.\nContoh: *kalendar 2025 9*");
          return;
        }
        const yearNum = parseInt(year, 10);
        const currentYear = new Date().getFullYear();
        console.log("Current Year:", currentYear);
        if (yearNum > currentYear) {
          await message.reply(`⚠️ Maximum year is *${currentYear}*`);
          return;
        }

        const data = await getCalendar(year, month);
        const caption = formatCalendar(data, year, month);

        if (yearNum < currentYear) {
          // 🔹 Tahun lampau → hanya caption tanpa media
          await message.reply(caption);
          return;
        }
        // --- Kirim gambar kalender + caption libur ---
        const calUrl = `https://amdktirta.my.id/cal${year}/${month}.jpg`;
        const media = await MessageMedia.fromUrl(calUrl);

        //s const media = await getResizedCalendar(year, month);
        const chat = await message.getChat();
        await chat.sendMessage(media, { caption });
      }
    } else {
      if (message.body.startsWith("ambil ")) {
        //console.log('Fetching data for noPasien:', noPasien);
        try {
          const noPasien = message.body.split(" ")[1].trim();
          // 🔹 Call your webservice
          const response = await axios.get(
            `https://harry.jurnalisproperti.com/find_ImagePasienWG.php?kode=${noPasien}`
          );
          let base64String = response.data.gambar;
          let nama = response.data.nama;
          let dlahir = response.data.dlahir;
          let jekel = response.data.jekel;
          let alamat = response.data.alamat;
          let tlp = response.data.tlp;
          let alergi = response.data.alergi;
          console.log(
            `https://harry.jurnalisproperti.com/find_ImagePasienWG.php?kode=${noPasien}`
          );
          // 🔹 Clean base64 if it has prefix
          base64String = base64String.replace(/^data:image\/\w+;base64,/, "");

          const media = new MessageMedia(
            "image/png",
            base64String,
            "myImage.png"
          );
          //await client.sendMessage("628122132341@c.us", media,{caption: `🧾 Data pasien ${noPasien}\nNama: ${nama}\nJK: ${jekel}\nAlamat: ${alamat}\nTlp: ${tlp}\nTgl Lahir: ${dlahir}\nAlergi: ${alergi}`});
          await client.sendMessage("628122132341@c.us", media, {
            caption: `🧾 Data pasien ${noPasien}
              👤 Nama: ${nama}
              🚻 JK: ${jekel}
              🏠 Alamat: ${alamat}
              📞 Tlp: ${tlp}
              🎂 Tgl Lahir: ${dlahir}
              ⚠️ Alergi: ${alergi}`,
          });
        } catch (error) {
          console.error("Error calling API:", error.message);
          await message.reply("❌ Failed to fetch data from API");
        }
      } else if (message.body.startsWith("test url")) {
        // const number = "628122132341"; // ganti ke nomor tujuan
        // const chatId = number + "@c.us";
        const newsUrl = message.body.replace("test url", "").trim();
        await sendNewsMessage(client, newsUrl);
      } else if (message.body.startsWith("ekyd:")) {
        const text = message.body.replace("ekyd:", "").trim();
        console.log("Received for chatbot:", text);
        // console.log("Knowledge Base:", knowledgeBase);
        console.log("Searching for:", text);

        // const found = knowledgeBase.find((item) =>
        //   text.includes(item.question)
        // );

        const fuse = new Fuse(knowledgeBase, {
          keys: ["question"],
          threshold: 0.4,
        });

        const results = fuse.search(text);
        if (results.length > 0) {
          const found = results[0].item;
          await message.reply(found.answer);
        } else {
          await message.reply(
            "⚠️ Maaf, saya belum punya jawaban untuk pertanyaan itu."
          );
        }

        // if (found) {
        //   await sendNewsMessage(client, newsUrl);
        //   // await msg.reply(found.answer);
        // } else {
        //   await message.reply(
        //     "⚠️ Maaf, saya belum punya jawaban untuk pertanyaan itu."
        //   );
        // }
      } else {
        await message.reply("I am not sure how to respond to that.");
      }
    }
  });

  client.initialize();
  //=== end of loadKnowledgeBase.then((kb) => { ...
});
