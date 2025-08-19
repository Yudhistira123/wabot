const express = require('express');
const qrcode = require('qrcode-terminal');
const axios = require('axios');
const app = express();
const mqtt = require('mqtt');
const port = process.env.port || 3000;
const { LocalAuth, Client } = require('whatsapp-web.js')

// =============== MQTT SETUP =================
const mqttBroker = "mqtt://103.27.206.14:1883";  // or your own broker
const mqttTopic = "R1.JC.05";                 // change to your topic
const mqttClient = mqtt.connect(mqttBroker);

mqttClient.on("connect", () => {
  console.log("✅ Connected to MQTT broker");
  mqttClient.subscribe(mqttTopic, (err) => {
    if (!err) {
      console.log(`📡 Subscribed to topic: ${mqttTopic}`);
    } else {
      console.error("❌ MQTT subscribe error:", err);
    }
  });
});

mqttClient.on("message", (topic, message) => {
  console.log(`📩 MQTT message from [${topic}]: ${message.toString()}`);

  // example: send to WhatsApp number when MQTT message received
  const number = "628122132341@c.us"; 
  client.sendMessage(number, ` Lampu ${topic} : ${message.toString()}`);
});



const client=new Client({
  authStrategy: new LocalAuth({clientId: "yudhi-boot"}),
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
    await message.reply('pong Yudhistira Sulaeman hari selasa Bandung Jabar Indonesia Banget...');
  } else if (message.body === 'hello') {
    await message.reply('Hello! How can I help you?');
  }else if (message.body === 'kirim') {
   // 🔹 Format numbers with country code (62 = Indonesia)
  const number1 = "628122132341@c.us";    // 08122132341 → 628122132341
  const number2 = "6287882977936@c.us";   // 087882977936 → 6287882977936

  // 🔹 Send message
  await client.sendMessage(number1, "Hello 08122132341, where is mastaka 🚀");
  await client.sendMessage(number2, "Hello 087882977936, where is mastaka 🚀");

  console.log("Messages sent!");
  }  else {
    await message.reply('I am not sure how to respond to that.');
  }
});



client.initialize();
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}
);
