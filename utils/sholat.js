import axios from "axios";
import axiosRetry from "axios-retry";
import { toHijri } from "hijri-converter";

// konfigurasi retry
axiosRetry(axios, {
  retries: 3, // maksimal 3x coba ulang
  retryDelay: axiosRetry.exponentialDelay, // jeda antar percobaan meningkat
  retryCondition: (error) => {
    // hanya retry kalau timeout atau response 5xx
    return (
      axiosRetry.isNetworkOrIdempotentRequestError(error) ||
      error.code === "ECONNABORTED" ||
      (error.response && error.response.status >= 500)
    );
  },
});

// const https = require("https");

// const agent = new https.Agent({ family: 4 }); // IPv4 only

const hijriMonths = [
  "Muharram",
  "Safar",
  "Rabi’ al-Awwal",
  "Rabi’ al-Thani",
  "Jumada al-Ula",
  "Jumada al-Thaniyah",
  "Rajab",
  "Sha’ban",
  "Ramadhan",
  "Shawwal",
  "Dhul Qa’dah",
  "Dhul Hijjah",
];

export async function getSholatByLocation(kodeLokasi) {
  const today = new Date();
  try {
    // const today = new Date().toISOString().split("T")[0];
    const jakarta = new Date(
      today.toLocaleString("en-US", { timeZone: "Asia/Jakarta" })
    );
    const year = jakarta.getFullYear();
    const month = String(jakarta.getMonth() + 1).padStart(2, "0");
    const day = String(jakarta.getDate()).padStart(2, "0");

    const hariIni = `${year}/${month}/${day}`;
    const url = `https://api.myquran.com/v2/sholat/jadwal/${kodeLokasi}/${hariIni}`;
    // const res = await axios.get(

    // );
    const res = await axios.get(url, { timeout: 15000 });

    //======
    const correctedDate = new Date(jakarta);
    correctedDate.setDate(correctedDate.getDate() - 1);

    const hijriDate = toHijri(
      correctedDate.getFullYear(),
      correctedDate.getMonth() + 1,
      correctedDate.getDate()
    );
    const hijriString = `${hijriDate.hd} ${hijriMonths[hijriDate.hm - 1]} ${
      hijriDate.hy
    }`;

    let sholatData = res.data;
    let jadwal = sholatData.data.jadwal;
    console.log("Hijri Date:", hijriString);

    //  `🗓️ ${jadwal.tanggal} \n\n` +
    let replyMsg =
      `🕌 *Jadwal Sholat ${sholatData.data.lokasi}*\n` +
      `🗓️ ${jadwal.tanggal} \n` +
      `      ${hijriString}H \n\n` +
      `🌅 Imsak     : ${jadwal.imsak} WIB\n` +
      `🌄 Subuh     : ${jadwal.subuh} WIB\n` +
      `🌤️ Terbit    : ${jadwal.terbit} WIB\n` +
      `🌞 Dhuha     : ${jadwal.dhuha} WIB\n` +
      `☀️ Dzuhur    : ${jadwal.dzuhur} WIB\n` +
      `🌇 Ashar     : ${jadwal.ashar} WIB\n` +
      `🌆 Maghrib   : ${jadwal.maghrib} WIB\n` +
      `🌙 Isya    : ${jadwal.isya} WIB`;
    //======

    // console.log(res.data);
    return replyMsg;
  } catch (err) {
    console.error("❌ Gagal ambil jadwal sholat:", err.message);
    return null;
  }
}

export async function getKodeKota(namaKota) {
  try {
    const url = `https://api.myquran.com/v2/sholat/kota/cari/${namaKota}`;
    console.log("Mencarixx kode kota untuk:", url);
    // const res = await axios.get(
    //   `https://api.myquran.com/v2/sholat/kota/cari/${namaKota}`
    // );
    const res = await axios.get(url, { timeout: 15000 });
    console.log(res.data);
    if (res.data.status && res.data.data.length > 0) {
      return res.data.data.map((k) => k.id);
    } else {
      return [];
    }
  } catch (err) {
    console.error("❌ Gagal mengambil kode kota:", err.message);
    return [];
  }
}

// Ambil doa acak dari MyQuran API
export async function getDoaAcak() {
  try {
    const url = "https://api.myquran.com/v2/doa/acak";
    const res = await axios.get(url, { timeout: 15000 });
    return res.data.data; // ambil bagian data doa
  } catch (err) {
    console.error("❌ Error getDoaAcak:");
    console.error("Message:", err.message || "No message");
    console.error("Code:", err.code || "No code");
    if (err.response) {
      console.error("Status:", err.response.status);
      console.error("Response:", err.response.data);
    }
    console.error("Stack:", err.stack || "No stack");
    return null;
  }
}

// Ambil doa acak dari MyQuran API
export async function getSuratAyat(surat, ayat) {
  try {
    const url = `https://api.myquran.com/v2/quran/ayat/${surat}/${ayat}`;
    const res = await axios.get(url, { timeout: 15000 });
    // console.log(res.data);
    return res.data; // ambil bagian data doa
  } catch (err) {
    console.error("❌ Errorx getSuratAyat:", err.message);
    return null;
  }
}

export async function getNoSurat() {
  try {
    const url = `https://api.myquran.com/v2/quran/surat/semua`;
    const res = await axios.get(url, { timeout: 15000 });
    // console.log(res.data);
    return res.data; // ambil bagian data doa
  } catch (err) {
    console.error("❌ Errorx getSuratAyat:", err.message);
    return null;
  }
}

// Format pesan WhatsApp
export function formatDoa(doa) {
  if (!doa) return "⚠️ Gagal mengambil doa.";

  const header =
    "📖 QS Ghafir (40):60\n" +
    "وَقَالَ رَبُّكُمُ ٱدْعُونِيٓ أَسْتَجِبْ لَكُمْ ۚ\n" +
    "“Dan Tuhanmu berfirman: Berdoalah kepada-Ku, niscaya akan Kuperkenankan bagimu…”\n\n";
  const source = doa.source
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
  return (
    header +
    `📖 *${doa.judul}*\n\n` +
    `🕌 Arab:\n ${doa.arab}\n\n` +
    // `🕌 Arab:\n${emphasizeArabic(doa.arab)}\n\n` +
    `🇮🇩 Latin:\n ${doa.indo}\n\n` +
    `📩 Sumber:\n ${source}`
  );
}

export function emphasizeArabic(text) {
  const mapping = {
    ا: "ﺍ",
    أ: "ﺃ",
    إ: "ﺇ",
    آ: "ﺁ",
    ب: "ﺏ",
    ت: "ﺕ",
    ث: "ﺙ",
    ج: "ﺝ",
    ح: "ﺡ",
    خ: "ﺥ",
    د: "ﺩ",
    ذ: "ﺫ",
    ر: "ﺭ",
    ز: "ﺯ",
    س: "ﺱ",
    ش: "ﺵ",
    ص: "ﺹ",
    ض: "ﺽ",
    ط: "ﻁ",
    ظ: "ﻅ",
    ع: "ﻉ",
    غ: "ﻍ",
    ف: "ﻑ",
    ق: "ﻕ",
    ك: "ﻙ",
    ل: "ﻟ",
    م: "ﻡ",
    ن: "ﻥ",
    ه: "ﻫ",
    و: "ﻭ",
    ي: "ﻱ",
    ى: "ﻯ",
    ء: "ء", // tetap
    ؤ: "ﺅ",
    ئ: "ﺉ",
  };

  return text
    .split("")
    .map((ch) => mapping[ch] || ch)
    .join("");
}

// module.exports = {
//   getSholatByLocation,
//   getKodeKota,
//   getDoaAcak,
//   formatDoa,
//   getSuratAyat,
// };
