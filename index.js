const {
  makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
} = require("@whiskeysockets/baileys");
const qrcode = require("qrcode-terminal");

// Buat store untuk simpan chat & kontak
const store = makeInMemoryStore({});
store.readFromFile("./baileys_store.json");
// Simpan otomatis tiap 10 detik
setInterval(() => {
  store.writeToFile("./baileys_store.json");
}, 10_000);

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("baileys_auth");

  const sock = makeWASocket({
    auth: state,
    // jangan pakai printQRInTerminal
  });

  // Hubungkan store dengan sock
  store.bind(sock.ev);

  // Save creds setiap ada update
  sock.ev.on("creds.update", saveCreds);

  // Handle koneksi
  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log("📲 Scan QR ini pakai WhatsApp:");
      qrcode.generate(qr, { small: true });
    }

    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !==
        DisconnectReason.loggedOut;
      console.log("⚠️ Connection closed. Reconnect:", shouldReconnect);
      if (shouldReconnect) startBot();
    } else if (connection === "open") {
      console.log("✅ WhatsApp connected & ready!");
      listGroups(); // Panggil fungsi listGroups saat koneksi terbuka
    }
  });

  // Listener pesan masuk
  sock.ev.on("messages.upsert", async (m) => {
    const msg = m.messages[0];
    if (!msg.message) return;

    const from = msg.key.remoteJid;
    const text =
      msg.message.conversation || msg.message.extendedTextMessage?.text || "";

    console.log("📩 Message from", from, ":", text);

    if (text.toLowerCase() === "!ping") {
      await sock.sendMessage(from, { text: "pong 🏓" });
    }
  });
}

// Function untuk ambil semua group
function listGroups() {
  const chats = Object.values(store.chats);
  console.log(`You have ${chats.length} chats open.`);

  const groups = chats.filter((c) => c.id.endsWith("@g.us"));
  console.log(`You have ${groups.length} group chats open.`);

  console.log("\n=== LIST GROUP ===");
  groups.forEach((g, i) => {
    console.log(`${i + 1}. ${g.name || g.subject} => ${g.id}`);
  });
}

startBot();
