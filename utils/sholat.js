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
    console.log(res.data);
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

module.exports = { getSholatByLocation, getKodeKota };
