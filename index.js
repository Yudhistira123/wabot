const express = require('express');
const qrcode = require('qrcode-terminal');
const axios = require('axios');
const app = express();
const mqtt = require('mqtt');
const sharp = require("sharp");
const port = process.env.PORT || 3000;
const { LocalAuth, Client, MessageMedia } = require('whatsapp-web.js');
const { getAirQuality, interpretAQI, getWeather } = require("./utils/airQualityService");
const { getSholatByLocation, getKodeKota } = require('./utils/sholat');
const puppeteer = require("puppeteer");

// =============== MQTT SETUP =================
const mqttBroker = "mqtt://103.27.206.14:1883";  // or your own broker
const mqttTopics = ["R1.JC.05", "R1.JC.06"];
const mqttClient = mqtt.connect(mqttBroker);

const client = new Client({
  authStrategy: new LocalAuth({ clientId: "session-yudhi-boot" }),
  puppeteer: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-gpu'
    ]
  }
});
mqttClient.on("connect", () => {
  console.log("✅ Connected to MQTT broker");
  mqttClient.subscribe(mqttTopics, (err) => {
    if (!err) {
      console.log(`📡 Subscribed to topics: ${mqttTopics.join(", ")}`);
    } else {
      console.error("❌ MQTT subscribe error:", err);
    }
  });
});
mqttClient.on("message", (topic, message) => {
  console.log(`📩 MQTT message from [${topic}]: ${message.toString()}`);
  sendMessages(topic, message);
});
client.on('qr', (qr) => {
  console.log('QR RECEIVED', qr);
  qrcode.generate(qr, { small: true });
});
client.on('authenticated', () => {
  console.log('Client is authenticated');
});
client.on('ready',async () => {
  console.log('Client is ready!');
  // Ambil semua chat
  const chats = await client.getChats();
  const groups = chats.filter(chat => chat.isGroup);

  console.log("\n=== LIST GROUP ===");
  groups.forEach((group, index) => {
    console.log(`${index + 1}. ${group.name} => ${group.id._serialized}`);
  });

  // // Kirim pesan ke grup berdasarkan ID langsung
  // const groupId = "120363043622833009@g.us"; // ganti sesuai hasil console
  // await client.sendMessage(groupId, "Hello 👋 ini pesan otomatis dari bot!");

  // // Kirim pesan ke grup berdasarkan nama
  // sendToGroupByName("Family Group", "Halo semua! 😎");

});
client.on('message', async (message) => {
  // message group
  if (message.from.endsWith('@g.us')) {  // <- cek kalau pengirim dari grup
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
        const contact = await client.getContactById(participant.id._serialized);
        const name = contact.pushname || contact.number;
        const avatarUrl = await contact.getProfilePicUrl();
        await sendAvatar(participant, adminNumber, name, avatarUrl);
        //   await message.reply("✅ All avatars are being sent to admin.");
      }
    } else if (message.body.toLowerCase().includes("jadwal sholat")) {
      const namaKota = message.body.toLowerCase().replace("jadwal sholat", "").trim();
      if (!namaKota) {
        await chat.sendMessage("⚠️ Tolong sebutkan nama kota. Contoh: *jadwal sholat bandung*");
        return;
      }
      const idKotaArray = await getKodeKota(namaKota);
      if (idKotaArray.length === 0) {
        await chat.sendMessage(`⚠️ Tidak ditemukan kota dengan nama ${namaKota}.`);
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

       
    } else if (message.type === "location") {
      //const chat = await message.getChat();
      const { latitude, longitude, description } = message.location; // ✅ lowercase 'location'

      console.log(`📍 Lokasi diterima: ${latitude}, ${longitude} (${description || "tanpa deskripsi"})`);

      const apiKey = "44747099862079d031d937f5cd84a57e"; // <- pakai key kamu
      const data = await getAirQuality(latitude, longitude, apiKey);
      //console.log("🌫️ Air Quality Data:", JSON.stringify(data, null, 2));
      const aqi = data.list[0].main.aqi;
      const desc = interpretAQI(aqi);

      const comp = data.list[0].components;

      const replyMsg1 = `📍 Lokasi: ${description}\n\n` +
        `🌍 *Air Quality Info*\n` +   
        `🌫️ AQI: ${aqi} → ${desc}\n` +
        `💨 Komponen:\n` +
        `- CO: ${comp.co} μg/m³\n` +
        `- NO: ${comp.no} μg/m³\n` +
        `- NO₂: ${comp.no2} μg/m³\n` +
        `- O₃: ${comp.o3} μg/m³\n` +
        `- SO₂: ${comp.so2} μg/m³\n` +
        `- PM2.5: ${comp.pm2_5} μg/m³\n` +
        `- PM10: ${comp.pm10} μg/m³\n` +
        `- NH₃: ${comp.nh3} μg/m³`;

    //  await message.reply(replyMsg);


      const weather = await getWeather(apiKey,latitude, longitude);   
     

      if (weather) {
        const replyMsg2 =
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
          `💨 Angin: ${weather.wind.speed} m/s, Arah ${weather.wind.deg}°, Gust ${weather.wind.gust ?? "-"} m/s\n` +
          `☁️ Awan: ${weather.clouds.all}%\n\n` +

          `🌅 Sunrise: ${new Date(weather.sys.sunrise * 1000).toLocaleTimeString("id-ID")}\n` +
          `🌇 Sunset: ${new Date(weather.sys.sunset * 1000).toLocaleTimeString("id-ID")}\n\n` +

          `🕒 Zona Waktu: UTC${weather.timezone / 3600}\n` +
          `🆔 City ID: ${weather.id}\n` +
          `📡 Source: ${weather.base}\n` +
          `⏱️ Data Timestamp: ${new Date(weather.dt * 1000).toLocaleString("id-ID")}`;

        const chat = await message.getChat();
        await chat.sendMessage(replyMsg1+"\n\n"+replyMsg2);
        console.log(`✅ Sent weather info to group: ${chat.name}`);
      }
    } else if (message.body.toLowerCase() === "hasil club lari") {
      
      const clubInfo = await getClubInfo(CLUB_ID);
      const activities = await getClubActivities(CLUB_ID);

      if (!clubInfo) {
        message.reply("❌ Gagal ambil info club.");
        return;
      }

      // Send cover image first
      if (clubInfo.cover_photo_small) {
        try {
          const media = await MessageMedia.fromUrl(clubInfo.cover_photo_small);
          await client.sendMessage(message.from, media, { caption: `🏃 *${clubInfo.name}*` });
        } catch (err) {
          console.error("❌ Error sending cover photo:", err.message);
        }
      }

      // Build text reply
      let reply = `🌍 Lokasi: ${clubInfo.city}, ${clubInfo.state}, ${clubInfo.country}\n` +
        `👥 Member: ${clubInfo.member_count}\n\n` +
        `ℹ️ ${clubInfo.description || "No description"}\n\n` +
        `=== 15 Aktivitas Terbaru ===\n\n`;

      

      activities.forEach((act, i) => {
        const distanceKm = act.distance / 1000;
        const movingMinutes = (act.moving_time / 60).toFixed(0);

        // pace in seconds/km
        const paceSecPerKm = act.moving_time / distanceKm;
        const paceMin = Math.floor(paceSecPerKm / 60);
        const paceSec = Math.round(paceSecPerKm % 60);
        const paceFormatted = `${paceMin}:${paceSec.toString().padStart(2, "0")} /km`;
        reply += `${i + 1}. ${act.athlete.firstname} ${act.athlete.lastname}\n` +
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
      console.log('Current Year:', currentYear);
      if (yearNum >currentYear) {
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
    if (message.body === 'ping') {
      await message.reply('pong Yudhistira Sulaeman hari selasa Bandung Jabar Indonesia Banget...');
    } else if (message.body === 'hello') {
      await message.reply('Hello! How can I help you?');
    } else if (message.body.startsWith("ambil ")) {
   
      //console.log('Fetching data for noPasien:', noPasien);
      try {
        const noPasien = message.body.split(" ")[1].trim();
        // 🔹 Call your webservice
        const response = await axios.get(`https://harry.jurnalisproperti.com/find_ImagePasienWG.php?kode=${noPasien}`);
        let base64String = response.data.gambar;
        let nama = response.data.nama;
        let dlahir = response.data.dlahir;
        let jekel = response.data.jekel;
        let alamat = response.data.alamat;
        let tlp = response.data.tlp;
        let alergi = response.data.alergi;
        console.log(`https://harry.jurnalisproperti.com/find_ImagePasienWG.php?kode=${noPasien}`);
        // 🔹 Clean base64 if it has prefix
        base64String = base64String.replace(/^data:image\/\w+;base64,/, "");
      
        const media = new MessageMedia("image/png", base64String, "myImage.png");
        //await client.sendMessage("628122132341@c.us", media,{caption: `🧾 Data pasien ${noPasien}\nNama: ${nama}\nJK: ${jekel}\nAlamat: ${alamat}\nTlp: ${tlp}\nTgl Lahir: ${dlahir}\nAlergi: ${alergi}`});
        await client.sendMessage("628122132341@c.us", media, {
          caption:
            `🧾 Data pasien ${noPasien}
👤 Nama: ${nama}
🚻 JK: ${jekel}
🏠 Alamat: ${alamat}
📞 Tlp: ${tlp}
🎂 Tgl Lahir: ${dlahir}
⚠️ Alergi: ${alergi}`
        });
      } catch (error) {
        console.error('Error calling API:', error.message);
        await message.reply('❌ Failed to fetch data from API');
      }
     
  } else {
          await message.reply('I am not sure how to respond to that.');
        }
      }
});
    

// Strava API Credentials
const CLIENT_ID = "54707";
const CLIENT_SECRET = "24def89a80ad1fe7586f0303af693787576075b3";
const REFRESH_TOKEN = "729818486aef1199b8a0e2ffb481e6f8c7f72e47";
const CLUB_ID = "728531"; // ID Club Lari

let accessToken = "";

// --- Function: Refresh Token Strava ---
async function getAccessToken() {
    try {
        const res = await axios.post("https://www.strava.com/oauth/token", {
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            refresh_token: REFRESH_TOKEN,
            grant_type: "refresh_token"
        });
        accessToken = res.data.access_token;
        console.log("✅ Access Token diperbarui");
    } catch (err) {
        console.error("❌ Error refresh token:", err.message);
    }
}


async function getClubInfo(CLUB_ID) {
    try {
        if (!accessToken) await getAccessToken();

        const res = await axios.get(
            `https://www.strava.com/api/v3/clubs/${CLUB_ID}`,
            {
                headers: { Authorization: `Bearer ${accessToken}` }
            }
        );

      //  console.log("📊 Club Info:", JSON.stringify(res.data, null, 2));
        return res.data;
    } catch (err) {
        console.error("❌ Error getClubInfo:", err.message);
        return null;
    }
}



// --- Function: Get Club Activities ---
async function getClubActivities(CLUB_ID) {
    try {
      if (!accessToken) await getAccessToken();
      
      //const clubInfo = await getClubInfo(CLUB_ID);
       const res = await axios.get(
            `https://www.strava.com/api/v3/clubs/${CLUB_ID}/activities`,
            {
                headers: { Authorization: `Bearer ${accessToken}` },
                params: { per_page: 15 } // ambil 5 aktivitas terbaru
            }
        );
        return res.data ;
    } catch (err) {
        console.error("❌ Error getClubActivities:", err.message);
        return "Gagal ambil data Club Strava.";
    }
}

async function getCalendar(year, month) {
  const url = `https://libur.deno.dev/api?year=${year}&month=${month}`;
  const res = await axios.get(url);
  return res.data;
}

// Format pesan kalender
function formatCalendar(data, year, month) {
  if (!data || data.length === 0) {
    return `❌ Tidak ada data LIBUR untuk ${month}/${year}`;
  }
   data.forEach(day => {
    reply += `📌 ${day.date} → ${day.name}\n`;
  });
  return reply;
}

async function sendAvatar(participant,toNumber, name, avatarUrl) {
  try {
    if (!avatarUrl) {
      console.log(`⚠️ ${name} has no avatar.`);
      return;
    }

    // Download avatar
    const response = await axios.get(avatarUrl, { responseType: "arraybuffer" });
    const media = new MessageMedia(
      "image/jpeg",
      Buffer.from(response.data, "binary").toString("base64"),
      `${name}.jpg`
    );

    // Send to target number (admin)
    await client.sendMessage(`${toNumber}@c.us`, media, {caption: `📸 Avatar of ${name} (${participant.id._serialized})`,});
    console.log(`✅ Avatar of ${name} sent to ${toNumber}`);
  } catch (err) {
    console.error(`❌ Failed for ${name}:`, err.message);
  }
}


// async function getSholatByLocation(kodeLokasi) {
//   try {
//     // ambil tanggal hari ini dalam format YYYY-MM-DD
//    // const today = new Date().toISOString().split("T")[0];
//     const today = new Date().toLocaleDateString("sv-SE"); 
//     const res = await axios.get(`https://api.myquran.com/v2/sholat/jadwal/${kodeLokasi}/${today}`);
//     return res.data;
//   } catch (err) {
//     console.error("Gagal ambil jadwal sholat:", err.message);
//     return null;
//   }
// }

// async function getKodeKota(namaKota) {
//   try {
//     const res = await axios.get(`https://api.myquran.com/v2/sholat/kota/cari/${namaKota}`);
//     if (res.data.status && res.data.data.length > 0) {
//       let idKotaArray = [];

//       // looping isi data
//       res.data.data.forEach((kota) => {
//         idKotaArray.push(kota.id); 
//       });

//       return idKotaArray;
//     } else {
//       return [];
//     }
//   } catch (err) {
//     console.error("Gagal mengambil kode kota:", err);
//     return [];
//   }
// }


const numbers = [
  "628122132341@c.us",
  "6285220757725@c.us",
  "628122233610@c.us",
  "6285975386345@c.us",
  "628121462983@c.us"
];

async function sendMessages(topic, message) {
  for (const number of numbers) {
    try {
      await client.sendMessage(number, ` Lampu ${topic} : ${message.toString()}`);
      console.log(`✅ Message sent to ${number}`);


      
    } catch (err) {
      console.error(`❌ Failed to send to ${number}:`, err);
    }
  }
}

app.get("/send", async (req, res) => {
  const number = req.query.number;  // ex: ?number=628122132341
  const noPasien = req.query.text;      // ex: ?text=Hello
   try {
     //  const noPasien = message.body.split(" ")[1].trim(); 
      // 🔹 Call your webservice
      const response = await axios.get(`https://harry.jurnalisproperti.com/find_ImagePasienWG.php?kode=${noPasien}`); 
      let base64String = response.data.gambar; 
      let nama = response.data.nama; 
      let dlahir = response.data.dlahir; 
      let jekel = response.data.jekel; 
      let alamat = response.data.alamat; 
      let tlp = response.data.tlp; 
      let alergi = response.data.alergi; 
      console.log(`https://harry.jurnalisproperti.com/find_ImagePasienWG.php?kode=${noPasien}`);
      // 🔹 Clean base64 if it has prefix
      base64String = base64String.replace(/^data:image\/\w+;base64,/, "");
      
      const media = new MessageMedia("image/png", base64String, "myImage.png");
      //await client.sendMessage("628122132341@c.us", media,{caption: `🧾 Data pasien ${noPasien}\nNama: ${nama}\nJK: ${jekel}\nAlamat: ${alamat}\nTlp: ${tlp}\nTgl Lahir: ${dlahir}\nAlergi: ${alergi}`});
   await client.sendMessage(`${number}@c.us`, media, {
  caption: 
`🧾 Data pasien ${noPasien}
👤 Nama: ${nama}
🚻 JK: ${jekel}
🏠 Alamat: ${alamat}
📞 Tlp: ${tlp}
🎂 Tgl Lahir: ${dlahir}
⚠️ Alergi: ${alergi}`
});
    } catch (error) {
      console.error('Error calling API:', error.message);
      await message.reply('❌ Failed to fetch data from API');
    }
  
});
app.get("/", (req, res) => {
  res.send("WhatsApp Bot is running...");
});
app.get("/status", (req, res) => {
  res.json({ status: "ok", message: "WhatsApp Bot is running..." });
});
app.get("/ping", (req, res) => {
  res.send("pong");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}
);

client.initialize();