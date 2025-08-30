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
const {
  getAirQuality,
  interpretAQI,
  formatAirQuality,
} = require("./utils/airQualityService.cjs");
const { getWeather, formatWeather } = require("./utils/weather.cjs");
const { getClubInfo, getClubActivities } = require("./utils/stravaService");
const fetch = require("node-fetch");

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

            await sock.sendMessage(from, { text: replyMsg });
          } else {
            await sock.sendMessage(from, {
              text: "⚠️ Gagal mengambil jadwal sholat.",
            });
          }
        }
      } else if (text.toLowerCase().startsWith("doa hari ini")) {
        const doa = await getDoaAcak();
        const tesxdoa = formatDoa(doa);
        await sock.sendMessage(from, { text: tesxdoa });
      } else if (msg.message.locationMessage) {
        const loc = msg.message.locationMessage;
        const latitude = loc.degreesLatitude;
        const longitude = loc.degreesLongitude;
        const description = loc.name; // Deskripsi lokasi opsional

        console.log(
          `📍 Lokasi diterima: ${latitude}, ${longitude} (${
            description || "tanpa deskripsi"
          })`
        );

        const apiKey = "44747099862079d031d937f5cd84a57e"; // <- pakai key kamu
        const data = await getAirQuality(latitude, longitude, apiKey);
        const replyMsg1 = formatAirQuality(description, data);
        const weather = await getWeather(latitude, longitude, apiKey);
        const replyMsg2 = formatWeather(weather);
        await sock.sendMessage(from, { text: replyMsg1 + "\n\n" + replyMsg2 });
      } else if (text.toLowerCase() === "hasil club lari") {
        const CLUB_ID = "728531"; // ID Club Laris
        const clubInfo = await getClubInfo(CLUB_ID);
        const activities = await getClubActivities(CLUB_ID);
        if (!clubInfo) {
          await sock.sendMessage(from, { text: "❌ Gagal ambil info club." });
          return;
        }
        if (clubInfo.cover_photo_small) {
          try {
            const res = await fetch(clubInfo.cover_photo_small);
            const buffer = await res.arrayBuffer();

            // const media = await MessageMedia.fromUrl(
            //   clubInfo.cover_photo_small
            // );
            // await sock.sendMessage(from, media, {
            //   caption: `🏃 *${clubInfo.name}*`,
            // });

            await sock.sendMessage(from, {
              image: buffer,
              caption: `🏃 *${clubInfo.name}*`,
            });
          } catch (err) {
            console.error("❌ Error sending cover photo:", err.message);
          }
        }

        // Build text reply
        let reply =
          `🌍 Lokasi: ${clubInfo.city}, ${clubInfo.state}, ${clubInfo.country}\n` +
          `👥 Member: ${clubInfo.member_count}\n\n` +
          `ℹ️ ${clubInfo.description || "No description"}\n\n` +
          `=== 10 Aktivitas Terbaru ===\n\n`;

        activities.forEach((act, i) => {
          const distanceKm = act.distance / 1000;
          const movingMinutes = (act.moving_time / 60).toFixed(0);

          // pace in seconds/km
          const paceSecPerKm = act.moving_time / distanceKm;
          const paceMin = Math.floor(paceSecPerKm / 60);
          const paceSec = Math.round(paceSecPerKm % 60);
          const paceFormatted = `${paceMin}:${paceSec
            .toString()
            .padStart(2, "0")} /km`;
          reply +=
            `${i + 1}. ${act.athlete.firstname} ${act.athlete.lastname}\n` +
            `📌 ${act.name}\n` +
            `📏 ${distanceKm.toFixed(2)} km\n` +
            `⏱️ ${movingMinutes} menit\n` +
            `🏃 Pace: ${paceFormatted}\n` +
            `⛰️ Elevasi: ${act.total_elevation_gain} m\n\n`;
        });

        //const chat = await message.getChat();
        await sock.sendMessage(from, { text: reply });
        // await chat.sendMessage(reply);
        //  message.reply(reply);
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
