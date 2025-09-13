import { loadKnowledgeBase } from "./utils/knowledgeBase.js";
//import { searchWithTFIDF } from "./utils/algoritma.js";
import Fuse from "fuse.js";
import natural from "natural"; // npm install natural

export async function searchWithTFIDF(query, documents) {
  const TfIdf = natural.TfIdf;
  const tfidf = new TfIdf();

  // Add documents
  documents.forEach((doc, i) => {
    tfidf.addDocument(doc.question, i.toString());
  });

  // Get scores for the query
  let results = [];
  tfidf.tfidfs(query, function (i, measure) {
    results.push({
      question: documents[i].question,
      answer: documents[i].answer,
      score: measure, // higher = more relevant
    });
  });

  // Sort by score
  results.sort((a, b) => b.score - a.score);

  return results;
}

async function main() {
  // Load KB
  const knowledgeBaseRudal = await loadKnowledgeBase("template_chatbot.csv");
  console.log("✅ Knowledge base loaded:", knowledgeBaseRudal.length);

  //const query = "bagai mana cara untuk daftar beasiswa PBU";
  const query = "bagaimana profile lulusan PUB";

  // ---- TF-IDF Search ----
  const tfidfResults = await searchWithTFIDF(query, knowledgeBaseRudal);
  console.log("TF-IDF Results:", tfidfResults.slice(0, 3)); // top 3

  // ambil jawaban yang relevan (misalnya skor > 0.1 atau top 2 saja)
  const tfidfBestAnswers = tfidfResults
    .filter((r) => r.score > 0.1)
    .slice(0, 2);
  console.log("TF-IDF Best Answers:", tfidfBestAnswers);

  // ---- Fuse.js Search ----
  const fuse = new Fuse(knowledgeBaseRudal, {
    keys: ["question"],
    threshold: 0.4,
    includeScore: true,
  });
  const fuseResults = fuse.search(query);
  const fuseBestAnswers = fuseResults.slice(0, 2).map((r) => r.item); // ambil 2 teratas
  console.log("Fuse Best Answers:", fuseBestAnswers);

  // ---- Merge hasil ----
  let finalAnswers = [
    ...tfidfBestAnswers.map((a) => a.answer),
    ...fuseBestAnswers.map((a) => a.answer),
  ];

  // hilangkan duplikat

  finalAnswers = [...new Set(finalAnswers)];
  let formattedAnswer = "🔎 Saya temukan beberapa jawaban terkait:\n";
  finalAnswers.forEach((ans, i) => {
    formattedAnswer += `${i + 1}. ${ans}\n`;
  });

  console.log("Final Answers:", formattedAnswer);

  // ---- TF-IDF Search ----
  // const tfidfResults = await searchWithTFIDF(query, knowledgeBaseRudal);
  // console.log("TF-IDF Results:", tfidfResults.slice(0, 3)); // top 3

  // let tfidfBest = tfidfResults[0] || null;
  // let tfidfScore = tfidfBest ? tfidfBest.score : 0;

  // // ---- Fuse.js Search ----
  // const fuse = new Fuse(knowledgeBaseRudal, {
  //   keys: ["question"],
  //   threshold: 0.4,
  //   includeScore: true,
  // });
  // const fuseResults = fuse.search(query);
  // let fuseBest = null;
  // let fuseScore = 1; // default worst
  // if (fuseResults.length > 0) {
  //   fuseBest = fuseResults[0].item;
  //   fuseScore = fuseResults[0].score; // 0 best, 1 worst
  // }

  // // // ---- Combine Scores ----
  // // // Normalize: TFIDF (higher=better), Fuse (lower=better → invert)
  // const finalScoreTFIDF = tfidfScore; // already high=good
  // const finalScoreFuse = 1 - fuseScore; // invert Fuse

  // console.log("TF-IDF Best:", tfidfBest);
  // console.log("Fuse Best:", fuseBest);
  // console.log("TF-IDF Score:", finalScoreTFIDF);
  // console.log("Fuse Score:", finalScoreFuse);

  // // Weighted combo (tweak weights as needed)
  // const combinedScore = 0.6 * finalScoreTFIDF + 0.4 * finalScoreFuse;

  // console.log("TF-IDF Best:", tfidfBest);
  // console.log("Fuse Best:", fuseBest);
  // console.log("Combined Score:", combinedScore);

  // // ---- Pick final answer ----
  // let finalAnswer;
  // if (combinedScore > 0.3) {
  //   finalAnswer = tfidfBest?.answer || fuseBest?.answer;
  // } else {
  //   finalAnswer = "⚠️ Maaf, saya belum punya jawaban untuk pertanyaan itu.";
  // }

  // console.log("Final Answer:", finalAnswer);
}

main();
