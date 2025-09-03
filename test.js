// testSurat.js
import { getNoSurat } from "./utils/sholat.js";

async function main() {
  const data = await getNoSurat();

  if (!data) {
    console.log("⚠️ Data tidak bisa diambil.");
    return;
  }

  // tampilkan jumlah surat
  console.log("📖 Jumlah surat:", data.data.length);

  // contoh: tampilkan 5 surat pertama
  let reply = "";
  data.data.slice(0, data.data.length).forEach((surat, i) => {
    reply += `${i + 1}. ${surat.name_id}/${surat.revelation_id} (${
      surat.number_of_verses
    } ayat)\n`;
  });
  console.log(reply);
}

main();

// async function testSuratAyat(surat, ayat) {
//   try {
//     const result = await getSuratAyat(surat, ayat);
//     // console.log("Hasil API MyQuran:", result.info.surat);

//     if (result && result.data && result.data[0]) {
//       const ayatData = result.data[0];
//       console.log(
//         `📖 ${result.info.surat.nama.id} (${result.info.surat.id}):${ayatData.ayah} | Juz: ${ayatData.juz}`
//       );
//       console.log("🕌 Arabic:", ayatData.arab);
//       console.log("🔤 Latin:", ayatData.latin);
//       console.log("🌐 Translation:", ayatData.text);
//       console.log("🎧 Audio URL:", ayatData.audio);
//       console.log(
//         `📖 ${result.info.surat.relevasi},  ${result.info.surat.ayat_max} ayat`
//       );
//     } else {
//       console.log("⚠️ Ayat tidak ditemukan.");
//     }
//   } catch (err) {
//     console.error("❌ Error:", err.message);
//   }
// }

// // Contoh panggil
// const surat = "2"; // Al-Fatihah
// const ayat = "6"; // Ayat pertama

// testSuratAyat(surat, ayat);
