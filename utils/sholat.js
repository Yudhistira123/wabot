const axios = require("axios");
const https = require("https");

async function getSholatByLocation(kodeLokasi) {
  try {
    // const today = new Date().toISOString().split("T")[0];
    const today = new Date().toLocaleDateString("sv-SE", {
      timeZone: "Asia/Jakarta",
    });
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
  console.log(`🔍 Mencari kode kota untuk: ${namaKota}`);
  // try {
  // const res = await axios.get(
  //   `https://api.myquran.com/v2/sholat/kota/cari/${namaKota}`
  // );

  const agent = new https.Agent({
    family: 4, // 👈 paksa IPv4
  });

  axios
    .get("https://api.myquran.com/v2/sholat/kota/cari/bandung", {
      httpsAgent: agent,
      timeout: 10000, // kasih timeout biar ga nunggu lama
    })
    .then((res) => {
      console.log(JSON.stringify(res.data, null, 2));
    })
    .catch((err) => {
      console.error("Axios error:", err.message);
    });
}

//   const res = await axios.get(
//     "https://api.myquran.com/v2/sholat/kota/cari/bandung",
//     {
//       headers: {
//         "Accept-Encoding": "gzip, deflate", // jangan pakai br
//       },
//     }
//   );
//   console.log(JSON.stringify(res.data, null, 2));
//   if (res.data.status && res.data.data.length > 0) {
//     return res.data.data.map((k) => k.id);
//   } else {
//     return [];
//   }
// } catch (err) {
//   if (err.response) {
//     console.error(
//       "❌ API responded with error:",
//       err.response.status,
//       err.response.data
//     );
//   } else if (err.request) {
//     console.error("❌ No response received:", err.request);
//   } else {
//     console.error("❌ Error:", err.message);
//   }
//   return [];
// }

module.exports = { getSholatByLocation, getKodeKota };
