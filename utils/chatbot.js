import fs from "fs";
import csv from "csv-parser";
import { pipeline } from "@xenova/transformers";

// Normalisasi teks
function normalizeText(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Cosine Similarity
function cosineSimilarity(a, b) {
  const arrA = Array.from(a.data); // fix: ambil tensor.data
  const arrB = Array.from(b.data);

  const dot = arrA.reduce((sum, v, i) => sum + v * arrB[i], 0);
  const normA = Math.sqrt(arrA.reduce((sum, v) => sum + v * v, 0));
  const normB = Math.sqrt(arrB.reduce((sum, v) => sum + v * v, 0));

  return dot / (normA * normB);
}

class ChatbotSemantik {
  constructor(filepath) {
    this.filepath = filepath;
    this.data = [];
    this.model = null;
    this.embeddings = []; // simpan embedding dokumen
  }

  async loadData() {
    return new Promise((resolve, reject) => {
      fs.createReadStream(this.filepath)
        .pipe(csv())
        .on("data", (row) => {
          if (row.pertanyaan && row.jawaban) {
            this.data.push({
              pertanyaan: normalizeText(row.pertanyaan),
              jawaban: row.jawaban,
            });
          }
        })
        .on("end", () => {
          if (this.data.length === 0) {
            reject("❌ Data kosong atau kolom tidak sesuai.");
          } else {
            resolve(true);
          }
        })
        .on("error", reject);
    });
  }

  async train() {
    this.model = await pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2"
    );
    console.log("✅ Model loaded");

    // Hitung embedding semua pertanyaan sekali saja
    this.embeddings = await Promise.all(
      this.data.map((item) =>
        this.model(item.pertanyaan, { pooling: "mean", normalize: true })
      )
    );
  }

  async getResponse(query) {
    if (!this.model) throw new Error("Model belum diload");

    const queryEmb = await this.model(normalizeText(query), {
      pooling: "mean",
      normalize: true,
    });

    // Hitung similarity ke semua pertanyaan
    let results = this.data.map((item, i) => ({
      question: item.pertanyaan,
      answer: item.jawaban,
      score: cosineSimilarity(queryEmb, this.embeddings[i]),
    }));

    results.sort((a, b) => b.score - a.score);

   
    const topScore = results[0].score;
    const relevant = results
      .filter((r) => r.score >= topScore * 0.85) // minimal 85% dari skor terbaik
      .slice(0, 2);

    if (relevant.length === 0) {
      return "⚠️ Maaf, tidak ditemukan jawaban.";
    }

    if (relevant.length === 1) {
      return relevant[0].answer;
    }

    // Jika ada lebih dari 1 → beri list bernomor
    let response = "🔎 Saya menemukan beberapa jawaban terkait:\n";
    relevant.forEach((r, i) => {
      response += `\n${i + 1}. ${r.answer}`;
    });
    return response;
  }
}

// 🔹 Main Program
if (process.argv.length > 2) {
  const filePath = process.argv[2];
  const bot = new ChatbotSemantik(filePath);

  (async () => {
    await bot.loadData();
    await bot.train();

    console.log("💡 Chatbot siap! Ketik pertanyaan (CTRL+C untuk keluar).");

    process.stdin.on("data", async (data) => {
      const input = data.toString().trim();
      if (input) {
        const response = await bot.getResponse(input);
        console.log("🤖:", response);
      }
    });
  })();
} else {
  console.error("❌ Harap masukkan path ke CSV, contoh:");
  console.error("   node chatbot.js ./template_chatbot.csv");
}
