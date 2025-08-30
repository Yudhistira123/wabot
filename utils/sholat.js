const axios = require("axios");

async function getSholatByLocation(kodeLokasi) {
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

    const res = await axios.get(
      `https://api.myquran.com/v2/sholat/jadwal/${kodeLokasi}/${hariIni}`
    );
    // console.log(res.data);
    return res.data;
  } catch (err) {
    console.error("❌ Gagal ambil jadwal sholat:", err.message);
    return null;
  }
}

async function getKodeKota(namaKota) {
  try {
    const res = await axios.get(
      `https://api.myquran.com/v2/sholat/kota/cari/${namaKota}`
    );
    // console.log(res.data);
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
async function getDoaAcak() {
  try {
    const url = "https://api.myquran.com/v2/doa/acak";
    const res = await axios.get(url);
    return res.data.data; // ambil bagian data doa
  } catch (err) {
    console.error("❌ Error getDoaAcak:", err.message);
    return null;
  }
}

// Format pesan WhatsApp
function formatDoa(doa) {
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

function emphasizeArabic(text) {
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

module.exports = { getSholatByLocation, getKodeKota, getDoaAcak, formatDoa };
