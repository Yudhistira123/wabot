const express = require("express");
const qrcode = require("qrcode-terminal");
const { LocalAuth, Client } = require("whatsapp-web.js");
const { initMQTT } = require("./utils/mqtt");
const { sendAvatar } = require("./utils/avatar");
const { getSholatByLocation, getKodeKota } = require("./utils/sholat");
const { getWeather, formatWeatherMessage } = require("./utils/weather");

const app = express();
const port = process.env.PORT || 3000;

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
    } else if (message.body.toLowerCase().includes("naon")) {
      await chat.sendMessage("🤖 aya naon");
      console.log(`🤖 Reply ke ${sender}: aya naon`);
    } else if (message.body.toLowerCase().includes("halo")) {
      await chat.sendMessage("🤖 halo juga!");
      console.log(`🤖 Reply ke ${sender}: halo juga!`);
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
            `📅 Tanggal: ${jadwal.tanggal}\n\n` +
            `🌅 Imsak     : ${jadwal.imsak} WIB\n` +
            `🌄 Subuh     : ${jadwal.subuh} WIB\n` +
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

  
      const weather = await getWeather(latitude, longitude);

      if (weather) {
        const replyMsg =
          `🌍 *Informasi Cuaca Lengkap*\n\n` +
          `📍 Lokasi: ${weather.name}, ${weather.sys.country}\n` +
          `🌐 Koordinat: ${weather.coord.lat}, ${weather.coord.lon}\n\n` +

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
        await chat.sendMessage(replyMsg);
        console.log(`✅ Sent weather info to group: ${chat.name}`);
      }
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
     // }else{
      //  } else if (message.body.toLowerCase().includes("cuaca bandung")) {
      // }else if (message.type === "location") {
      // const chat = await message.getChat();
      // const { latitude, longitude, description } = message.location; // ✅ lowercase 'location'

      // console.log(`📍 Lokasi diterima: ${latitude}, ${longitude} (${description || "tanpa deskripsi"})`);

  
      // const weather = await getWeather(latitude, longitude);

      // if (weather) {
      //   const replyMsg =
      //     `🌍 *Informasi Cuaca Lengkap*\n\n` +
      //     `📍 Lokasi: ${weather.name}, ${weather.sys.country}\n` +
      //     `🌐 Koordinat: ${weather.coord.lat}, ${weather.coord.lon}\n\n` +

      //     `🌤️ Cuaca: ${weather.weather[0].main} - ${weather.weather[0].description}\n` +
      //     `🌡️ Suhu: ${weather.main.temp}°C\n` +
      //     `🤒 Terasa: ${weather.main.feels_like}°C\n` +
      //     `🌡️ Suhu Min: ${weather.main.temp_min}°C\n` +
      //     `🌡️ Suhu Max: ${weather.main.temp_max}°C\n` +
      //     `💧 Kelembapan: ${weather.main.humidity}%\n` +
      //     `🌬️ Tekanan: ${weather.main.pressure} hPa\n` +
      //     `🌊 Tekanan Laut: ${weather.main.sea_level ?? "-"} hPa\n` +
      //     `🏞️ Tekanan Darat: ${weather.main.grnd_level ?? "-"} hPa\n\n` +

      //     `👀 Jarak Pandang: ${weather.visibility} m\n` +
      //     `💨 Angin: ${weather.wind.speed} m/s, Arah ${weather.wind.deg}°, Gust ${weather.wind.gust ?? "-"} m/s\n` +
      //     `☁️ Awan: ${weather.clouds.all}%\n\n` +

      //     `🌅 Sunrise: ${new Date(weather.sys.sunrise * 1000).toLocaleTimeString("id-ID")}\n` +
      //     `🌇 Sunset: ${new Date(weather.sys.sunset * 1000).toLocaleTimeString("id-ID")}\n\n` +

      //     `🕒 Zona Waktu: UTC${weather.timezone / 3600}\n` +
      //     `🆔 City ID: ${weather.id}\n` +
      //     `📡 Source: ${weather.base}\n` +
      //     `⏱️ Data Timestamp: ${new Date(weather.dt * 1000).toLocaleString("id-ID")}`;

      //   const chat = await message.getChat();
      //   await chat.sendMessage(replyMsg);
      //   console.log(`✅ Sent weather info to group: ${chat.name}`);
      // } else {
    
    //   await message.reply("⚠️ Gagal mengambil data cuaca.");
    // }
  } else {
          await message.reply('I am not sure how to respond to that.');
        }
      }
});
 app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}
);

client.initialize();   
