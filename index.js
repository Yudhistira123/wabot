const {
  makeWASocket,
  useMultiFileAuthState,
} = require("@whiskeysockets/baileys");
const qrcode = require("qrcode-terminal");

async function startBot() {
  // Simpan sesi di folder "session"
  const { state, saveCreds } = await useMultiFileAuthState("session");

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false, // sudah deprecated
  });

  // Event koneksi
  sock.ev.on("connection.update", ({ connection, qr }) => {
    if (qr) {
      console.log("📌 Scan QR berikut untuk login:");
      qrcode.generate(qr, { small: true });
    }
    if (connection === "open") {
      console.log("✅ Bot sudah konek ke WhatsApp!");
    }
  });

  // Update creds kalau berubah
  sock.ev.on("creds.update", saveCreds);

  // Event pesan masuk
  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message) return;

    const from = msg.key.remoteJid;
    const text =
      msg.message.conversation || msg.message.extendedTextMessage?.text || "";

    console.log("💬 Pesan dari", from, ":", text);

    // Auto-reply sederhana
    if (text) {
      await sock.sendMessage(from, { text: `Echo: ${text}` });
    }
  });
}

startBot();
