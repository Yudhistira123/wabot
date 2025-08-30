const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-extensions",
      "--disable-gpu",
      "--disable-software-rasterizer",
    ],
  },
});

// client.on("qr", (qr) => {
//   console.log("QR RECEIVED:", qr);
// });

client.on("qr", (qr) => {
  console.log("QR RECEIVED", qr);
  qrcode.generate(qr, { small: true });
});

client.on("authenticated", () => {
  console.log("Client is authenticated");
});

client.on("ready", () => {
  console.log("✅ Client is ready!");
});

client.initialize();
