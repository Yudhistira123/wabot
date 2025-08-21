const express = require('express');
const qrcode = require('qrcode-terminal');
const axios = require('axios');
const app = express();
const mqtt = require('mqtt');
const port = process.env.PORT || 3000;
const { LocalAuth, Client,MessageMedia } = require('whatsapp-web.js')

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

  // example: send to WhatsApp number when MQTT message received
  //const number = "628122132341@c.us";
  //8122132341, 852 - 2075 - 7725, 812 - 2233 - 610, 859 - 7538 - 6345, 812 - 1462 - 983;
//   [2:47 PM, 8/19/2025] Yudhistira Sulaeman: 852-2075-7725 acas
// [2:49 PM, 8/19/2025] Yudhistira Sulaeman:   812-2233-610 herry
// [2:50 PM, 8/19/2025] Yudhistira Sulaeman:   859-7538-6345 asep
//   [2: 50 PM, 8 / 19 / 2025] Yudhistira Sulaeman: 812 - 1462 - 983 hakim

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
    const sender = message._data.notifyName || msg.from;
    console.log(`👤 Pengirim: ${sender}`);
    // Cek isi pesan
    if (message.body.toLowerCase().includes("hi")) {
      await message.reply("🤖 aya naon");
      console.log(`🤖 Reply ke ${sender}: aya naon`);
    } else if (message.body.toLowerCase().includes("halo")) {
      await message.reply("🤖 halo juga!");
      console.log(`🤖 Reply ke ${sender}: halo juga!`);
    }
  } else {
   if (message.body.toLowerCase().includes("jadwal sholat")) {
    const sholatData = await getSholatByLocation(1219); // 1219 = Bandung

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

      // await message.reply(message.from, replyMsg);
      await message.reply(replyMsg);
    } else {
      //await message.reply(message.from, "⚠️ Gagal mengambil jadwal sholat.");
       await message.reply("⚠️ Gagal mengambil jadwal sholat.");
    }
  
}else if (message.body === 'ping') {
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
   // 🔹 Format numbers with country code (62 = Indonesia)
  // const number1 = "628122132341@c.us";    // 08122132341 → 628122132341
  // const number2 = "6287882977936@c.us";   // 087882977936 → 6287882977936
  // // 🔹 Send message
  // await client.sendMessage(number1, "Hello 08122132341, where is mastaka 🚀");
  // await client.sendMessage(number2, "Hello 087882977936, where is mastaka 🚀");
  // console.log("Messages sent!");
  }  else {
    await message.reply('I am not sure how to respond to that.');
  }
  }
});

async function getSholatByLocation(kodeLokasi) {
  try {
    // ambil tanggal hari ini dalam format YYYY-MM-DD
    const today = new Date().toISOString().split("T")[0];

    const res = await axios.get(`https://api.myquran.com/v2/sholat/jadwal/${kodeLokasi}/${today}`);

    return res.data;
  } catch (err) {
    console.error("Gagal ambil jadwal sholat:", err.message);
    return null;
  }
}


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
  // try {


  //   await client.sendMessage(`${number}@c.us`, text);
  //   res.json({ status: "ok", sent: text });
  // } catch (e) {
  //   res.json({ status: "error", message: e.message });
  // }
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