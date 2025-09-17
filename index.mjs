import {
  makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
} from "@whiskeysockets/baileys";

// const {
//   makeWASocket,
//   useMultiFileAuthState,
//   DisconnectReason,
// } = require("@whiskeysockets/baileys");

// const qrcode = require("qrcode-terminal");
import qrcode from "qrcode-terminal";
// const {
//   getSholatByLocation,
//   getKodeKota,
//   getDoaAcak,
//   formatDoa,
//   getSuratAyat,
// } = require("./utils/sholat");

import {
  getSholatByLocation,
  getKodeKota,
  getDoaAcak,
  formatDoa,
  getSuratAyat,
  getNoSurat,
  sendAyatLoop,
} from "./utils/sholat.js";

// const {
//   getAirQuality,
//   interpretAQI,
//   formatAirQuality,
// } = require("./utils/airQualityService.cjs");

import {
  getAirQuality,
  interpretAQI,
  formatAirQuality,
} from "./utils/airQualityService.cjs";

// const { getWeather, formatWeather } = require("./utils/weather.cjs");
// const { getClubInfo, getClubActivities } = require("./utils/stravaService");
import { getWeather, formatWeather } from "./utils/weather.js";
import { getClubInfo, getClubActivities } from "./utils/stravaService.js";

//const fetch = require("node-fetch");
import fetch from "node-fetch";

// const fetch = (...args) =>
//   import("node-fetch").then(({ default: fetch }) => fetch(...args));

// const { getCalendar, formatCalendar } = require("./utils/calendarService");
// const axios = require("axios");
// const { sendAvatar, sendNewsMessage } = require("./utils/avatar");
// const { loadKnowledgeBase } = require("./utils/knowledgeBase");
// const Fuse = require("fuse.js");

// const { searchWithTFIDF } = require("./utils/algoritma");

import { getCalendar, formatCalendar } from "./utils/calendarService.js";
import axios from "axios";
//import { sendAvatar, sendNewsMessage } from "./utils/avatar.js";
import { loadKnowledgeBase } from "./utils/knowledgeBase.js";
import Fuse from "fuse.js";

import { searchWithTFIDF } from "./utils/algoritma.js";

import { getFilteredPOISorted } from "./utils/googleApi.js";

import { openKelas, absen, daftarHadir, endKelas } from "./utils/attendance.js";

// end of import

let knowledgeBase = [];
let knowledgeBaseRudal = [];

// Load knowledge base CSV
loadKnowledgeBase("rudalrn01ss.csv").then((kb) => {
  knowledgeBaseRudal = kb;
});

let knowledgeBasePUB = [];

// Load knowledge base CSV
loadKnowledgeBase("template_chatbot.csv").then((kb) => {
  knowledgeBasePUB = kb;
});

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
process.env.GAI_CONF = "/etc/gai.conf";

// const dns = require("dns");
// dns.setDefaultResultOrder("ipv4first");

const PANEL_API =
  "https://valofity.zakzz.web.id/api/client/servers/mc1/resources"; // ganti dengan URL Pterodactyl-mu
const API_KEY = "ptlc_vzwA4AE4fHLvYpatWNgwjQj6TUPgbOEbFPMajI2DLsl"; // API Key dari panel

// const PANEL_API = "https://valofity.zakzz.web.id"; // ganti dengan URL Pterodactyl-mu
// const API_KEY = "ptlc_vzwA4AE4fHLvYpatWNgwjQj6TUPgbOEbFPMajI2DLsl"; // API Key dari panel

const serverMap = {
  mc1: "2954ae8b", // alias mc1 → server ID
  // bisa tambah alias lain di sini
};

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("baileys_auth");

  const sock = makeWASocket({
    auth: state,
    // jangan pakai printQRInTerminal test
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
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
      if (shouldReconnect) {
        console.log("⚠️ Reconnecting in 5s...");
        setTimeout(startBot, 5000);
      }
    } else if (connection === "open") {
      console.log("✅ WhatsApp connected & ready!");
    }
  });

  // Listener pesan masuk
  sock.ev.on("messages.upsert", async (m) => {
    const msg = m.messages[0];
    if (!msg.message) return;

    const from = msg.key.remoteJid;
    //sconst sender = msg.sender || msg.author || msg.from; // varian field
    const sender = msg.key.participant || msg.key.remoteJid;
    const pushName = msg.pushName || sender;

    // const from = m.key.remoteJid;
    // const sender = m.key.participant || m.key.remoteJid;
    // const pushName = m.pushName || sender;

    const text =
      msg.message.conversation || msg.message.extendedTextMessage?.text || "";
    console.log("📩 Message from", from, ":", text);
    // Cek apakah pesan dari grup
    if (from.endsWith("@g.us")) {
      console.log("Pesan dari grup:", text);
      if (text.toLowerCase() === "!ping") {
        await sock.sendMessage(from, { text: "pong grup 🏓" });
        // 1. Jadwal sholat
      } else if (text.toLowerCase().startsWith("jadwal sholat")) {
        // jadwal sholat
        const namaKota = text.toLowerCase().replace("jadwal sholat", "").trim();
        console.log(`🔍 Mencari kode kota untuk: ${namaKota}`);
        if (!namaKota) {
          await sock.sendMessage(from, {
            text: "⚠️ Tolong sebutkan nama kota. Contoh: *jadwal sholat bandung*",
          });
          return;
        }
        // console.log(`🔍 Mencari kode kota untuk: ${namaKota}`);
        const idKotaArray = await getKodeKota(namaKota);
        if (idKotaArray.length === 0) {
          await sock.sendMessage(from, {
            text: "⚠️ Tolong sebutkan nama kota. Contoh: *jadwal sholat bandung*",
          });

          return;
        }
        for (const idKota of idKotaArray) {
          const replyMsg = await getSholatByLocation(idKota);
          await sock.sendMessage(from, { text: replyMsg });
        }

        // 2. Doa Hari Ini
      } else if (text.toLowerCase().startsWith("doa hari ini")) {
        const doa = await getDoaAcak();
        const tesxdoa = formatDoa(doa);
        await sock.sendMessage(from, { text: tesxdoa });
        // 3. Cek kualitas udara dan cuaca berdasarkan lokasi
        // } else if (msg.message.locationMessage) {
      } else if (text.toLowerCase().startsWith("xxxxx")) {
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
        const replyMsg2 = await formatWeather(weather);
        //POI
        const places = await getFilteredPOISorted(latitude, longitude, 1000);

        // Format semua hasil jadi satu string
        let replyMsg3 = "📍 *Tempat Penting Saat Turing*\n\n";
        places.slice(0, 20).forEach((p, i) => {
          const mapsLink = `https://www.google.com/maps?q=${p.lat},${p.lon}`;
          replyMsg3 += `${i + 1}. ${p.name}-${
            p.distance_km
          } km\n${mapsLink}\n\n`;
        });

        await sock.sendMessage(from, {
          text: replyMsg1 + "\n\n" + replyMsg2 + "\n\n" + replyMsg3,
        });
        // 4. Hasil Club Lari (Strava)
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
            //const buffer = await res.arrayBuffer();
            const buffer = Buffer.from(await res.arrayBuffer());

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
        await sock.sendMessage(from, { text: reply });
        //  5. Kalendar
      } else if (text.toLowerCase().startsWith("kal")) {
        const parts = text.split(" ");
        const year = parts[1];
        const month = parts[2];

        if (!year || !month) {
          await sock.sendMessage(from, {
            text: "⚠️ Format salah.\nContoh: *kalendar 2025 9*",
          });
          return;
        }
        const yearNum = parseInt(year, 10);
        const currentYear = new Date().getFullYear();
        console.log("Current Year:", currentYear);
        if (yearNum > currentYear) {
          await sock.sendMessage(from, {
            text: `⚠️ Maximum year is *${currentYear}*`,
          });
          return;
        }

        const data = await getCalendar(year, month);
        const caption = formatCalendar(data, year, month);

        if (yearNum < currentYear) {
          await sock.sendMessage(from, { text: caption });
          return;
        }
        const calUrl = `https://amdktirta.my.id/cal${year}/${month}.jpg`;
        console.log("Calendar URL:", calUrl);
        if (calUrl) {
          try {
            const res = await fetch(calUrl);
            console.log("Fetching calendar image from:", res);
            // const buffer = await res.arrayBuffer();
            const buffer = Buffer.from(await res.arrayBuffer());
            await sock.sendMessage(from, {
              image: buffer,
              caption: caption,
            });
          } catch (err) {
            console.error("❌ Error sending cover photo:", err.message);
          }
        }
        // 6. Kirim avatar anggota grup ke admin
      } else if (text.toLowerCase().includes("sg4")) {
        // Change to your admin number
        // const groupId = from;
        // const contact = "";
        // // Ambil metadata grup
        // const metadata = await sock.groupMetadata(groupId);
        // for (const participant of metadata.participants) {
        //   const id = participant.id; // misal "628123456789@s.whatsapp.net"
        //   // Nama bisa dari pushname user, tapi kadang tidak tersedia, fallback ke nomor
        //   // Untuk ambil nama kontak, perlu query vCard
        //   let name = id.split("@")[0]; // default pakai nomor
        //   try {
        //     contact = await sock.onWhatsApp(id);
        //     // onWhatsApp memberi info apakah user aktif, tapi tidak pushname
        //   } catch (err) {
        //     console.error("Error fetching contact:", err);
        //   }
        //   // Ambil profile picture
        //   let avatarUrl = null;
        //   try {
        //     avatarUrl = await sock.profilePictureUrl(id, "image"); // 'image' atau 'preview'
        //   } catch (err) {
        //     avatarUrl = null; // jika tidak punya foto
        //   }
        //   console.log({
        //     contact,
        //     id,
        //     name,
        //     avatarUrl,
        //     admin: participant.admin || "member",
        //   });
        // }
        // const adminNumber = "628122132341";
        // for (const participant of chat.participants) {
        //   const contact = await client.getContactById(
        //     participant.id._serialized
        //   );
        //   const name = contact.pushname || contact.number;
        //   const avatarUrl = await contact.getProfilePicUrl();
        //   await sendAvatar(client, participant, adminNumber, name, avatarUrl);
        // }
      } else if (text.toLowerCase().startsWith("qs:")) {
        const suratAyat = text.toLowerCase().replace("qs:", "").trim();
        const parts = suratAyat.split("/");
        const surat = parseInt(parts[0]); // nomor surat
        const ayatPart = parts[1]; // bisa "5" atau "5-8"

        let startAyat, endAyat;

        if (ayatPart.includes("-")) {
          // Range ayat, contoh "5-8"
          const range = ayatPart.split("-");
          startAyat = parseInt(range[0]);
          endAyat = parseInt(range[1]);
          // 🚨 Batasi maksimal 5 ayat
          if (endAyat - startAyat > 4) {
            endAyat = startAyat + 4;
          }
        } else {
          // Hanya 1 ayat, contoh "5"
          startAyat = parseInt(ayatPart);
          // endAyat = startAyat;
          endAyat = 1;
        }
        await sendAyatLoop(surat, startAyat, endAyat, sock, from);
      } else if (text.toLowerCase().startsWith("qsall")) {
        const data = await getNoSurat();
        if (!data) {
          console.log("⚠️ Data tidak bisa diambil.");
          return;
        }
        let reply = "";
        data.data.slice(0, data.data.length).forEach((surat, i) => {
          reply += `${i + 1}. ${surat.name_id}/${surat.revelation_id} (${
            surat.number_of_verses
          } ayat)\n`;
        });
        await sock.sendMessage(from, { text: reply });
      }
      // !jadwalsholat <kota>
      // absensi
      else if (text.startsWith("/openkelas")) {
        // contoh: /openkelas IF101 Lab-Komputer
        const parts = text.split(" ");
        const kode = parts[1] || "UNKNOWN";
        const ruang = parts.slice(2).join(" ") || "Tanpa Ruang";
        // lokasi default (kampus)
        // const lat = -6.89148,
        //   lng = 107.61078;

        const lat = -6.897134193872105,
          lng = 107.5802957155738;
        const reply = openKelas(from, kode, ruang, lat, lng);
        await sock.sendMessage(from, { text: reply });
      } else if (text === "/daftarhadir") {
        const reply = daftarHadir(from);
        await sock.sendMessage(from, { text: reply });
      } else if (text === "/endkelas") {
        const reply = endKelas(from);
        await sock.sendMessage(from, { text: reply });
      } else if (msg.message.locationMessage) {
        const loc = msg.message.locationMessage;
        const reply = absen(
          from,
          sender,
          pushName,
          loc.degreesLatitude,
          loc.degreesLongitude,
          sock
        );
        await sock.sendMessage(from, { text: reply });
      }

      // end absensi
    } else {
      console.log("Pesan dari personal:", text);
      if (text.toLowerCase() === "!ping") {
        await sock.sendMessage(from, { text: "pong personal 🏓" });
      } else if (text.startsWith("ambil ")) {
        //console.log('Fetching data for noPasien:', noPasien);
        try {
          const noPasien = text.split(" ")[1].trim();
          // 🔹 Call your webservice
          let url = `https://harry.jurnalisproperti.com/find_ImagePasienWG.php?kode=${noPasien}`;
          console.log("Fetching data from URL:", url);
          const response = await axios.get(url);
          let base64String = response.data.gambar;
          let nama = response.data.nama;
          let dlahir = response.data.dlahir;
          let jekel = response.data.jekel;
          let alamat = response.data.alamat;
          let tlp = response.data.tlp;
          let alergi = response.data.alergi;

          // 🔹 Clean base64 if it has prefix
          base64String = base64String.replace(/^data:image\/\w+;base64,/, "");

          const buffer = Buffer.from(base64String, "base64");
          // let info = `🧾 Data pasien ${noPasien}
          // 👤 Nama: ${nama}
          // 🚻 JK: ${jekel}
          // 🏠 Alamat: ${alamat}
          // 📞 Tlp: ${tlp}
          // 🎂 Tgl Lahir: ${dlahir}
          // ⚠️ Alergi: ${alergi}`;

          await sock.sendMessage("628122132341@c.us", {
            image: buffer,
            caption: `🧾 Data pasien ${noPasien}
👤 Nama: ${nama}
🚻 JK: ${jekel}
🏠 Alamat: ${alamat}
📞 Tlp: ${tlp}
🎂 Tgl Lahir: ${dlahir}
⚠️ Alergi: ${alergi}`,
          });
        } catch (error) {
          console.error("Error calling API:", error.message);
          await sock.sendMessage(from, {
            text: "❌ Failed to fetch data from API",
          });
        }
      } else if (text.startsWith("test url")) {
        const newsUrl = text.replace("test url", "").trim();
        await sendNewsMessage(sock, newsUrl);
      } else if (text.startsWith("ekyd:") || text.startsWith("rn:")) {
        if (text.startsWith("ekyd:")) {
          knowledgeBase = knowledgeBasePUB;
          text = text.replace("ekyd:", "").trim();
        } else if (text.startsWith("rn:")) {
          knowledgeBase = knowledgeBaseRudal;
          text = text.replace("rn:", "").trim();
        }

        console.log("Receiveddd for chatbot (TF-IDF):", text);

        const found = await searchWithTFIDF(text, knowledgeBase);

        if (found) {
          await sock.sendMessage(from, { text: found.answer });
        } else {
          await sock.sendMessage(from, {
            text: "⚠️ Maaf, saya belum punya jawaban untuk pertanyaan itu.",
          });
        }
      } // === Perintah STATUS ===
      else if (text.startsWith("!status")) {
        const parts = text.split(" ");
        const key = parts[1]?.trim() || "b81775cb"; // default ke 1 server

        const replyMsg = await getServerStatus(key);

        //const replyMsg = await getServerStatus("mc1");
        await sock.sendMessage(
          from,
          { text: replyMsg },
          msg ? { quoted: msg } : {}
        );

        //  await sock.sendMessage(from, { text: msg });
      }

      // === Perintah START ===
      else if (text.startsWith("!start")) {
        const parts = text.split(" ");
        const key = parts[1]?.trim() || "mc1"; // default pakai mc1
        const msg = await startServer(key);
        sock.sendMessage(from, { text: msg });
      }

      if (text.startsWith("!stop")) {
        const parts = text.split(" ");
        const key = parts[1]?.trim() || "mc1";
        const msg = await stopServer(key);
        sock.sendMessage(from, { text: msg });
      }

      // let tanya = "";

      // Kalau mau test langsung (tanpa WA bot), jalankan ini:
      // (async () => {
      //   const query = "cara kerja radar militer";
      // const result = await searchWithTFIDF(text, knowledgeBase);
      //   console.log("Hasil TF-IDF:", result);
      // })();

      // if (text.startsWith("ekyd:")) {
      //   knowledgeBase = knowledgeBasePUB;
      //   tanya = text.replace("ekyd:", "").trim();
      // } else if (text.startsWith("rn:")) {
      //   knowledgeBase = knowledgeBaseRudal;
      //   tanya = text.replace("rn:", "").trim();
      // }

      // console.log("Received for chatbot:", tanya);

      // const fuse = new Fuse(knowledgeBase, {
      //   keys: ["question"],
      //   threshold: 0.4,
      // });

      // const results = fuse.search(tanya);
      // if (results.length > 0) {
      //   const found = results[0].item;
      //   await sock.sendMessage(from, { text: found.answer });
      // } else {
      //   await sock.sendMessage(from, {
      //     text: "⚠️ Maaf, saya belum punya jawaban untuk pertanyaan itu.",
      //   });
      // }
      //  }
      // } else {
      //   await sock.sendMessage(from, {
      //     text: "I am not sure how to respond to that.",
      //   });
      // }
      // personal
    }
  });
}

async function getServerStatus(key) {
  try {
    const res = await fetch(
      `https://valofity.zakzz.web.id/api/client/servers/${serverMap[key]}/resources`,
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          Accept: "application/json",
        },
      }
    );

    const data = await res.json();

    if (!data.attributes) {
      return `⚠️ Gagal ambil status server *${key}* (respon tidak valid).`;
    }

    const { current_state, resources } = data.attributes;

    return `📌 Status server *${key}*:
- State: ${current_state}
- CPU: ${resources.cpu_absolute}%
- RAM: ${(resources.memory_bytes / 1024 / 1024).toFixed(2)} MB
- Disk: ${(resources.disk_bytes / 1024 / 1024).toFixed(2)} MB`;
  } catch (err) {
    return `⚠️ Error ambil status server *${key}*: ${err.message}`;
  }
}

// Start server
async function startServer(serverKey) {
  const serverId = serverMap[serverKey] || serverKey;

  const res = await fetch(
    `https://valofity.zakzz.web.id/api/client/servers/${serverId}/power`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PTERO_API_KEY || API_KEY}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ signal: "start" }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    console.log("DEBUG start error:", err);
    return `⚠️ Gagal start server ${serverKey}`;
  }

  return `🟢 Server ${serverKey} sedang di-*start*...`;
}

// Stop server
async function stopServer(serverKey) {
  const serverId = serverMap[serverKey] || serverKey;

  const res = await fetch(
    `https://valofity.zakzz.web.id/api/client/servers/${serverId}/power`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PTERO_API_KEY || API_KEY}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ signal: "stop" }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    console.log("DEBUG stop error:", err);
    return `⚠️ Gagal stop server ${serverKey}`;
  }

  return `🔴 Server ${serverKey} sedang di-*stop*...`;
}

startBot();
