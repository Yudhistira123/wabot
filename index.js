const {
  makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
} = require("@whiskeysockets/baileys");
const qrcode = require("qrcode-terminal");
const {
  getSholatByLocation,
  getKodeKota,
  getDoaAcak,
  formatDoa,
} = require("./utils/sholat");

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("baileys_auth");

  const sock = makeWASocket({
    auth: state,
    // jangan pakai printQRInTerminal
  });

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
    // Cek apakah pesan dari grup
    if (from.endsWith("@g.us")) {
      console.log("Pesan dari grup:", msg.message.conversation);
      if (text.toLowerCase() === "!ping") {
        await sock.sendMessage(from, { text: "pong grup 🏓" });
      } else if (text.toLowerCase().startsWith("jadwal sholat")) {
        // jadwal sholat
        const namaKota = text.toLowerCase().replace("jadwal sholat", "").trim();
        // console.log(`🔍 Mencari kode kota untuk: ${namaKota}`);
        if (!namaKota) {
          await sock.sendMessage(from, {
            text: "⚠️ Tolong sebutkan nama kota. Contoh: *jadwal sholat bandung*",
          });
          return;
        }
        console.log(`🔍 Mencari kode kota untuk: ${namaKota}`);
        const idKotaArray = await getKodeKota(namaKota);
        if (idKotaArray.length === 0) {
          // await sock.sendMessage(
          //   `⚠️ Tidak ditemukan kota dengan nama ${namaKota}.`
          // );

          await sock.sendMessage(from, {
            text: "⚠️ Tolong sebutkan nama kota. Contoh: *jadwal sholat bandung*",
          });

          return;
        }
        for (const idKota of idKotaArray) {
          const sholatData = await getSholatByLocation(idKota);
          if (sholatData && sholatData.data) {
            const jadwal = sholatData.data.jadwal;
            let replyMsg =
              `🕌 *Jadwal Sholat ${sholatData.data.lokasi}*\n` +
              `📅 Hari,Tgl: ${jadwal.tanggal}\n\n` +
              `🌅 Imsak     : ${jadwal.imsak} WIB\n` +
              `🌄 Subuh     : ${jadwal.subuh} WIB\n` +
              `🌤️ Terbit    : ${jadwal.terbit} WIB\n` +
              `🌞 Dhuha     : ${jadwal.dhuha} WIB\n` +
              `☀️ Dzuhur    : ${jadwal.dzuhur} WIB\n` +
              `🌇 Ashar     : ${jadwal.ashar} WIB\n` +
              `🌆 Maghrib   : ${jadwal.maghrib} WIB\n` +
              `🌙 Isya      : ${jadwal.isya} WIB`;

            // await sock.sendMessage(from, replyMsg);
            await sock.sendMessage(from, { text: replyMsg });
          } else {
            await sock.sendMessage(from, {
              text: "⚠️ Gagal mengambil jadwal sholat.",
            });
          }
        }
      }
      // !jadwalsholat <kota>
    } else {
      if (text.toLowerCase() === "!ping") {
        await sock.sendMessage(from, { text: "pong personal 🏓" });
      }
      console.log("Pesan dari personal:", msg.message.conversation);
    }
  });
}

startBot();
