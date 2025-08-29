const fs = require("fs");
const csv = require("csv-parser");

function loadKnowledgeBase(filePath) {
  return new Promise((resolve, reject) => {
    let knowledgeBase = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        knowledgeBase.push({
          question: row["pertanyaan"].toLowerCase().trim(),
          answer: row["jawaban"],
        });
      })
      .on("end", () => {
        console.log("✅ Knowledge base loaded from", filePath);
        resolve(knowledgeBase);
      })
      .on("error", (err) => {
        reject(err);
      });
  });
}

module.exports = { loadKnowledgeBase };
