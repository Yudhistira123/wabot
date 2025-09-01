const natural = require("natural");

// Contoh knowledge base
// const knowledgeBase = [
//   { question: "Apa itu rudal balistik?", answer: "Rudal balistik adalah ..." },
//   { question: "Siapa penemu roket?", answer: "Penemu roket modern adalah ..." },
//   {
//     question: "Bagaimana cara kerja radar?",
//     answer: "Radar bekerja dengan ...",
//   },
// ];

// Fungsi TF-IDF
async function searchWithTFIDF(query, knowledgeBase) {
  const tfidf = new natural.TfIdf();

  // Tambahkan semua pertanyaan ke tf-idf index
  knowledgeBase.forEach((item, idx) => {
    tfidf.addDocument(item.question, idx.toString());
  });

  let bestScore = 0;
  let bestDoc = null;

  tfidf.tfidfs(query, function (i, measure) {
    if (measure > bestScore) {
      bestScore = measure;
      bestDoc = knowledgeBase[i];
    }
  });

  return bestDoc;
}

// Contoh integrasi ke chatbot
// async function handleChat(
//   text,
//   from,
//   sock,
//   knowledgeBasePUB,
//   knowledgeBaseRudal
// ) {
//   let knowledgeBase;

//   if (text.startsWith("ekyd:")) {
//     knowledgeBase = knowledgeBasePUB;
//     text = text.replace("ekyd:", "").trim();
//   } else if (text.startsWith("rn:")) {
//     knowledgeBase = knowledgeBaseRudal;
//     text = text.replace("rn:", "").trim();
//   }

//   console.log("Received for chatbot (TF-IDF):", text);

//   const found = await searchWithTFIDF(text, knowledgeBase);

//   if (found) {
//     await sock.sendMessage(from, { text: found.answer });
//   } else {
//     await sock.sendMessage(from, {
//       text: "⚠️ Maaf, saya belum punya jawaban untuk pertanyaan itu.",
//     });
//   }
// }

module.exports = { searchWithTFIDF };

// // Kalau mau test langsung (tanpa WA bot), jalankan ini:
// (async () => {
//   const query = "cara kerja radar militer";
//   const result = await searchWithTFIDF(query, knowledgeBase);
//   console.log("Hasil TF-IDF:", result);
// })();
