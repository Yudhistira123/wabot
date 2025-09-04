// testSurat.js
import { getSholatByLocation } from "./utils/sholat.js";

async function main() {
  const idKota = "1632"; // Ganti dengan kode kota yang diinginkan
  const replyMsg = await getSholatByLocation(idKota);

  console.log(replyMsg);
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
