const {
  makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
} = require("@whiskeysockets/baileys");
const { Boom } = require("@hapi/boom");

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("auth");

  // ambil versi WA terbaru dari server
  const { version, isLatest } = await fetchLatestBaileysVersion();
  console.log(
    `✅ Using WA version: ${version.join(".")} (latest: ${isLatest})`
  );

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true, // QR langsung muncul di terminal
    browser: ["Ubuntu", "Chrome", "22.04.4"], // bebas, bisa diganti
    version,
  });

  // event save creds
  sock.ev.on("creds.update", saveCreds);

  // event pesan masuk
  sock.ev.on("messages.upsert", async (m) => {
    const msg = m.messages[0];
    if (!msg.message) return;

    const from = msg.key.remoteJid;
    const text =
      msg.message.conversation || msg.message.extendedTextMessage?.text || "";

    console.log(`📩 New message from ${from}: ${text}`);

    if (text.toLowerCase() === "ping") {
      await sock.sendMessage(from, { text: "pong 🏓" });
    }
  });

  // handle disconnect
  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !==
        DisconnectReason.loggedOut;
      console.log(
        "Connection closed. Reason:",
        lastDisconnect?.error,
        "Reconnecting:",
        shouldReconnect
      );
      if (shouldReconnect) startBot();
    } else if (connection === "open") {
      console.log("✅ Bot connected!");
    }
  });
}

startBot();
