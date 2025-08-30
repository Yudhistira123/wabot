const {
  makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  makeInMemoryStore,
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
  });

  // Hubungkan store dengan sock
  store.bind(sock.ev);

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", ({ connection, qr }) => {
    if (qr) {
      console.log("📲 Scan QR ini pakai WhatsApp:");
      qrcode.generate(qr, { small: true });
    }
    if (connection === "open") {
      console.log("✅ WhatsApp connected & ready!");
      listGroups(); // panggil list group setelah connect
    }
  });

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
}

startBot();
