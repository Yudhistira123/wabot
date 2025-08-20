const express = require('express');
const qrcode = require('qrcode-terminal');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;
const { Client, LocalAuth } = require('whatsapp-web.js');


client.on('qr', (qr) => {
  qrcode.generate(qr, { small: true }); // tampilkan QR langsung di terminal
});

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

client.on('qr', (qr) => {
  console.log('QR RECEIVED', qr);
});

client.on('authenticated', () => {
  console.log('Client is authenticated');
});

client.on('ready', () => {
  console.log('Client is ready!');
});

client.initialize();
