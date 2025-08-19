const express = require('express');
const qrcode = require('qrcode-terminal');
const axios = require('axios');
const app = express();
const port = process.env.port || 3000;
const { LocalAuth, Client } = require('whatsapp-web.js')

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
    await message.reply('pong Yudhistira Sulaeman hari selasa Bandung');
  } else if (message.body === 'hello') {
    await message.reply('Hello! How can I help you?');
  } else {
    await message.reply('I am not sure how to respond to that.');
  }
});



client.initialize();
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}
);
