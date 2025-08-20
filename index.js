// const express = require('express');
// const qrcode = require('qrcode-terminal');
// const axios = require('axios');
// const app = express();
// const mqtt = require('mqtt');
// const port = process.env.PORT || 3000;
// const { LocalAuth, Client,MessageMedia } = require('whatsapp-web.js')

// // =============== MQTT SETUP =================
// const mqttBroker = "mqtt://103.27.206.14:1883";  // or your own broker
// const mqttTopics = ["R1.JC.05", "R1.JC.06"];
// const mqttClient = mqtt.connect(mqttBroker);
// mqttClient.on("connect", () => {
//   console.log("✅ Connected to MQTT broker");
//   mqttClient.subscribe(mqttTopics, (err) => {
//     if (!err) {
//       console.log(`📡 Subscribed to topics: ${mqttTopics.join(", ")}`);
//     } else {
//       console.error("❌ MQTT subscribe error:", err);
//     }
//   });
// });

// const numbers = [
//   "628122132341@c.us",
//   "6285220757725@c.us",
//   "628122233610@c.us",
//   "6285975386345@c.us",
//   "628121462983@c.us"
// ];

// async function sendMessages(topic, message) {
//   for (const number of numbers) {
//     try {
//       await client.sendMessage(number, ` Lampu ${topic} : ${message.toString()}`);
//       console.log(`✅ Message sent to ${number}`);
//     } catch (err) {
//       console.error(`❌ Failed to send to ${number}:`, err);
//     }
//   }
// }

// mqttClient.on("message", (topic, message) => {
//   console.log(`📩 MQTT message from [${topic}]: ${message.toString()}`);
//   sendMessages(topic, message);
// });


//   // example: send to WhatsApp number when MQTT message received
//   //const number = "628122132341@c.us";
//   //8122132341, 852 - 2075 - 7725, 812 - 2233 - 610, 859 - 7538 - 6345, 812 - 1462 - 983;
// //   [2:47 PM, 8/19/2025] Yudhistira Sulaeman: 852-2075-7725 acas
// // [2:49 PM, 8/19/2025] Yudhistira Sulaeman:   812-2233-610 herry
// // [2:50 PM, 8/19/2025] Yudhistira Sulaeman:   859-7538-6345 asep
// //   [2: 50 PM, 8 / 19 / 2025] Yudhistira Sulaeman: 812 - 1462 - 983 hakim





// const client=new Client({
//   authStrategy: new LocalAuth({clientId: "yudhi-boot"}),
//     puppeteer: {
//         headless: true,
//         args: ['--no-sandbox', '--disable-setuid-sandbox']
//     }   
// });

// client.on('qr', (qr) => {
//   console.log('QR RECEIVED', qr);
//   qrcode.generate(qr, { small: true });
// });

// client.on('authenticated', () => {
//   console.log('Client is authenticated');
// });
// client.on('ready', () => {
//   console.log('Client is ready!');
// });
// client.on('message', async (message) => {
//   console.log('Received message:', message.body);
//   if (message.body === 'ping') {
//     await message.reply('pong Yudhistira Sulaeman hari selasa Bandung Jabar Indonesia Banget...');
//   } else if (message.body === 'hello') {
//     await message.reply('Hello! How can I help you?');
//   } else if (message.body.startsWith("ambil ")) {
   
//     //console.log('Fetching data for noPasien:', noPasien);
//     try {
//        const noPasien = message.body.split(" ")[1].trim(); 
//       // 🔹 Call your webservice
//       const response = await axios.get(`https://harry.jurnalisproperti.com/find_ImagePasienWG.php?kode=${noPasien}`); 
//       let base64String = response.data.gambar; 
//       let nama = response.data.nama; 
//       let dlahir = response.data.dlahir; 
//       let jekel = response.data.jekel; 
//       let alamat = response.data.alamat; 
//       let tlp = response.data.tlp; 
//       let alergi = response.data.alergi; 
//       console.log(`https://harry.jurnalisproperti.com/find_ImagePasienWG.php?kode=${noPasien}`);
//       // 🔹 Clean base64 if it has prefix
//       base64String = base64String.replace(/^data:image\/\w+;base64,/, "");
      
//       const media = new MessageMedia("image/png", base64String, "myImage.png");
//       //await client.sendMessage("628122132341@c.us", media,{caption: `🧾 Data pasien ${noPasien}\nNama: ${nama}\nJK: ${jekel}\nAlamat: ${alamat}\nTlp: ${tlp}\nTgl Lahir: ${dlahir}\nAlergi: ${alergi}`});
//    await client.sendMessage("628122132341@c.us", media, {
//   caption: 
// `🧾 Data pasien ${noPasien}
// 👤 Nama: ${nama}
// 🚻 JK: ${jekel}
// 🏠 Alamat: ${alamat}
// 📞 Tlp: ${tlp}
// 🎂 Tgl Lahir: ${dlahir}
// ⚠️ Alergi: ${alergi}`
// });
//     } catch (error) {
//       console.error('Error calling API:', error.message);
//       await message.reply('❌ Failed to fetch data from API');
//     }
//    // 🔹 Format numbers with country code (62 = Indonesia)
//   // const number1 = "628122132341@c.us";    // 08122132341 → 628122132341
//   // const number2 = "6287882977936@c.us";   // 087882977936 → 6287882977936
//   // // 🔹 Send message
//   // await client.sendMessage(number1, "Hello 08122132341, where is mastaka 🚀");
//   // await client.sendMessage(number2, "Hello 087882977936, where is mastaka 🚀");
//   // console.log("Messages sent!");
//   }  else {
//     await message.reply('I am not sure how to respond to that.');
//   }
// });

// app.get("/send", async (req, res) => {
//   const number = req.query.number;  // ex: ?number=628122132341
//   const text = req.query.text;      // ex: ?text=Hello
//   try {
//     await client.sendMessage(`${number}@c.us`, text);
//     res.json({ status: "ok", sent: text });
//   } catch (e) {
//     res.json({ status: "error", message: e.message });
//   }
// });
// app.get("/", (req, res) => {
//   res.send("WhatsApp Bot is running...");
// });
// app.get("/status", (req, res) => {
//   res.json({ status: "ok", message: "WhatsApp Bot is running..." });
// });
// app.get("/ping", (req, res) => {
//   res.send("pong");
// });

// client.initialize();

// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// }
// );


const express = require('express');
const qrcode = require('qrcode-terminal');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;
const { LocalAuth, Client } = require('whatsapp-web.js')
const client=new Client({
    authStrategy: new LocalAuth({ clientId: "yudhi-boot" }),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }   
});

client.on('qr', (qr) => {
  console.log('QR RECEIVED', qr);
  qrcode.generate(qr, { small: true });
});

client.on('authenticated', () => {
  console.log('Client is authenticated');
});
client.on('ready', () => {
  console.log('Client is ready!');
});
client.on('message', async (message) => {
  console.log('Received message:', message.body);
  if (message.body === 'ping') {
    await message.reply('pong');
  } else if (message.body === 'hello') {
    await message.reply('Hello! How can I help you?');
  } else {
    await message.reply('I am not sure how to respond to that.');
  }
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}
);

client.initialize();