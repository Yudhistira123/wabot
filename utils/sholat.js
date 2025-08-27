const axios = require("axios");

async function getSholatByLocation(kodeLokasi) {
  try {
    const today = new Date().toISOString().split("T")[0];
    const res = await axios.get(
      `https://api.myquran.com/v2/sholat/jadwal/${kodeLokasi}/${today}`
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
