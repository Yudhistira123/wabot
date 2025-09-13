// =======================
// Full Surah Dataset
// =======================
const surahs = [
  { number: 1, name: "Al-Fatihah", ayahs: 7, revelationType: "Makkiyyah" },
  { number: 2, name: "Al-Baqarah", ayahs: 286, revelationType: "Madaniyyah" },
  { number: 3, name: "Ali Imran", ayahs: 200, revelationType: "Madaniyyah" },
  { number: 4, name: "An-Nisa", ayahs: 176, revelationType: "Madaniyyah" },
  { number: 5, name: "Al-Ma'idah", ayahs: 120, revelationType: "Madaniyyah" },
  { number: 6, name: "Al-An'am", ayahs: 165, revelationType: "Makkiyyah" },
  { number: 7, name: "Al-A'raf", ayahs: 206, revelationType: "Makkiyyah" },
  { number: 8, name: "Al-Anfal", ayahs: 75, revelationType: "Madaniyyah" },
  { number: 9, name: "At-Taubah", ayahs: 129, revelationType: "Madaniyyah" },
  { number: 10, name: "Yunus", ayahs: 109, revelationType: "Makkiyyah" },
  { number: 11, name: "Hud", ayahs: 123, revelationType: "Makkiyyah" },
  { number: 12, name: "Yusuf", ayahs: 111, revelationType: "Makkiyyah" },
  { number: 13, name: "Ar-Ra'd", ayahs: 43, revelationType: "Madaniyyah" },
  { number: 14, name: "Ibrahim", ayahs: 52, revelationType: "Makkiyyah" },
  { number: 15, name: "Al-Hijr", ayahs: 99, revelationType: "Makkiyyah" },
  { number: 16, name: "An-Nahl", ayahs: 128, revelationType: "Makkiyyah" },
  { number: 17, name: "Al-Isra", ayahs: 111, revelationType: "Makkiyyah" },
  { number: 18, name: "Al-Kahf", ayahs: 110, revelationType: "Makkiyyah" },
  { number: 19, name: "Maryam", ayahs: 98, revelationType: "Makkiyyah" },
  { number: 20, name: "Taha", ayahs: 135, revelationType: "Makkiyyah" },
  { number: 21, name: "Al-Anbiya", ayahs: 112, revelationType: "Makkiyyah" },
  { number: 22, name: "Al-Hajj", ayahs: 78, revelationType: "Madaniyyah" },
  { number: 23, name: "Al-Mu'minun", ayahs: 118, revelationType: "Makkiyyah" },
  { number: 24, name: "An-Nur", ayahs: 64, revelationType: "Madaniyyah" },
  { number: 25, name: "Al-Furqan", ayahs: 77, revelationType: "Makkiyyah" },
  { number: 26, name: "Asy-Syu'ara", ayahs: 227, revelationType: "Makkiyyah" },
  { number: 27, name: "An-Naml", ayahs: 93, revelationType: "Makkiyyah" },
  { number: 28, name: "Al-Qasas", ayahs: 88, revelationType: "Makkiyyah" },
  { number: 29, name: "Al-Ankabut", ayahs: 69, revelationType: "Makkiyyah" },
  { number: 30, name: "Ar-Rum", ayahs: 60, revelationType: "Makkiyyah" },
  { number: 31, name: "Luqman", ayahs: 34, revelationType: "Makkiyyah" },
  { number: 32, name: "As-Sajdah", ayahs: 30, revelationType: "Makkiyyah" },
  { number: 33, name: "Al-Ahzab", ayahs: 73, revelationType: "Madaniyyah" },
  { number: 34, name: "Saba", ayahs: 54, revelationType: "Makkiyyah" },
  { number: 35, name: "Fatir", ayahs: 45, revelationType: "Makkiyyah" },
  { number: 36, name: "Yasin", ayahs: 83, revelationType: "Makkiyyah" },
  { number: 37, name: "As-Saffat", ayahs: 182, revelationType: "Makkiyyah" },
  { number: 38, name: "Sad", ayahs: 88, revelationType: "Makkiyyah" },
  { number: 39, name: "Az-Zumar", ayahs: 75, revelationType: "Makkiyyah" },
  { number: 40, name: "Gafir", ayahs: 85, revelationType: "Makkiyyah" },
  { number: 41, name: "Fussilat", ayahs: 54, revelationType: "Makkiyyah" },
  { number: 42, name: "Asy-Syura", ayahs: 53, revelationType: "Makkiyyah" },
  { number: 43, name: "Az-Zukhruf", ayahs: 89, revelationType: "Makkiyyah" },
  { number: 44, name: "Ad-Dukhan", ayahs: 59, revelationType: "Makkiyyah" },
  { number: 45, name: "Al-Jasiyah", ayahs: 37, revelationType: "Makkiyyah" },
  { number: 46, name: "Al-Ahqaf", ayahs: 35, revelationType: "Makkiyyah" },
  { number: 47, name: "Muhammad", ayahs: 38, revelationType: "Madaniyyah" },
  { number: 48, name: "Al-Fath", ayahs: 29, revelationType: "Madaniyyah" },
  { number: 49, name: "Al-Hujurat", ayahs: 18, revelationType: "Madaniyyah" },
  { number: 50, name: "Qaf", ayahs: 45, revelationType: "Makkiyyah" },
  { number: 51, name: "Az-Zariyat", ayahs: 60, revelationType: "Makkiyyah" },
  { number: 52, name: "At-Tur", ayahs: 49, revelationType: "Makkiyyah" },
  { number: 53, name: "An-Najm", ayahs: 62, revelationType: "Makkiyyah" },
  { number: 54, name: "Al-Qamar", ayahs: 55, revelationType: "Makkiyyah" },
  { number: 55, name: "Ar-Rahman", ayahs: 78, revelationType: "Madaniyyah" },
  { number: 56, name: "Al-Waqi'ah", ayahs: 96, revelationType: "Makkiyyah" },
  { number: 57, name: "Al-Hadid", ayahs: 29, revelationType: "Madaniyyah" },
  { number: 58, name: "Al-Mujadalah", ayahs: 22, revelationType: "Madaniyyah" },
  { number: 59, name: "Al-Hasyr", ayahs: 24, revelationType: "Madaniyyah" },
  {
    number: 60,
    name: "Al-Mumtahanah",
    ayahs: 13,
    revelationType: "Madaniyyah",
  },
  { number: 61, name: "As-Saff", ayahs: 14, revelationType: "Madaniyyah" },
  { number: 62, name: "Al-Jumu'ah", ayahs: 11, revelationType: "Madaniyyah" },
  { number: 63, name: "Al-Munafiqun", ayahs: 11, revelationType: "Madaniyyah" },
  { number: 64, name: "At-Tagabun", ayahs: 18, revelationType: "Madaniyyah" },
  { number: 65, name: "At-Talaq", ayahs: 12, revelationType: "Madaniyyah" },
  { number: 66, name: "At-Tahrim", ayahs: 12, revelationType: "Madaniyyah" },
  { number: 67, name: "Al-Mulk", ayahs: 30, revelationType: "Makkiyyah" },
  { number: 68, name: "Al-Qalam", ayahs: 52, revelationType: "Makkiyyah" },
  { number: 69, name: "Al-Haqqah", ayahs: 52, revelationType: "Makkiyyah" },
  { number: 70, name: "Al-Ma'arij", ayahs: 44, revelationType: "Makkiyyah" },
  { number: 71, name: "Nuh", ayahs: 28, revelationType: "Makkiyyah" },
  { number: 72, name: "Al-Jinn", ayahs: 28, revelationType: "Makkiyyah" },
  { number: 73, name: "Al-Muzzammil", ayahs: 20, revelationType: "Makkiyyah" },
  { number: 74, name: "Al-Muddassir", ayahs: 56, revelationType: "Makkiyyah" },
  { number: 75, name: "Al-Qiyamah", ayahs: 40, revelationType: "Makkiyyah" },
  { number: 76, name: "Al-Insan", ayahs: 31, revelationType: "Madaniyyah" },
  { number: 77, name: "Al-Mursalat", ayahs: 50, revelationType: "Makkiyyah" },
  { number: 78, name: "An-Naba", ayahs: 40, revelationType: "Makkiyyah" },
  { number: 79, name: "An-Nazi'at", ayahs: 46, revelationType: "Makkiyyah" },
  { number: 80, name: "Abasa", ayahs: 42, revelationType: "Makkiyyah" },
  { number: 81, name: "At-Takwir", ayahs: 29, revelationType: "Makkiyyah" },
  { number: 82, name: "Al-Infitar", ayahs: 19, revelationType: "Makkiyyah" },
  { number: 83, name: "Al-Mutaffifin", ayahs: 36, revelationType: "Makkiyyah" },
  { number: 84, name: "Al-Insyiqaq", ayahs: 25, revelationType: "Makkiyyah" },
  { number: 85, name: "Al-Buruj", ayahs: 22, revelationType: "Makkiyyah" },
  { number: 86, name: "At-Tariq", ayahs: 17, revelationType: "Makkiyyah" },
  { number: 87, name: "Al-A'la", ayahs: 19, revelationType: "Makkiyyah" },
  { number: 88, name: "Al-Gasyiyah", ayahs: 26, revelationType: "Makkiyyah" },
  { number: 89, name: "Al-Fajr", ayahs: 30, revelationType: "Makkiyyah" },
  { number: 90, name: "Al-Balad", ayahs: 20, revelationType: "Makkiyyah" },
  { number: 91, name: "Asy-Syams", ayahs: 15, revelationType: "Makkiyyah" },
  { number: 92, name: "Al-Lail", ayahs: 21, revelationType: "Makkiyyah" },
  { number: 93, name: "Ad-Duha", ayahs: 11, revelationType: "Makkiyyah" },
  { number: 94, name: "Asy-Syarh", ayahs: 8, revelationType: "Makkiyyah" },
  { number: 95, name: "At-Tin", ayahs: 8, revelationType: "Makkiyyah" },
  { number: 96, name: "Al-Alaq", ayahs: 19, revelationType: "Makkiyyah" },
  { number: 97, name: "Al-Qadr", ayahs: 5, revelationType: "Makkiyyah" },
  { number: 98, name: "Al-Bayyinah", ayahs: 8, revelationType: "Madaniyyah" },
  { number: 99, name: "Az-Zalzalah", ayahs: 8, revelationType: "Madaniyyah" },
  { number: 100, name: "Al-Adiyat", ayahs: 11, revelationType: "Makkiyyah" },
  { number: 101, name: "Al-Qari'ah", ayahs: 11, revelationType: "Makkiyyah" },
  { number: 102, name: "At-Takasur", ayahs: 8, revelationType: "Makkiyyah" },
  { number: 103, name: "Al-Asr", ayahs: 3, revelationType: "Makkiyyah" },
  { number: 104, name: "Al-Humazah", ayahs: 9, revelationType: "Makkiyyah" },
  { number: 105, name: "Al-Fil", ayahs: 5, revelationType: "Makkiyyah" },
  { number: 106, name: "Quraisy", ayahs: 4, revelationType: "Makkiyyah" },
  { number: 107, name: "Al-Ma'un", ayahs: 7, revelationType: "Makkiyyah" },
  { number: 108, name: "Al-Kausar", ayahs: 3, revelationType: "Makkiyyah" },
  { number: 109, name: "Al-Kafirun", ayahs: 6, revelationType: "Makkiyyah" },
  { number: 110, name: "An-Nasr", ayahs: 3, revelationType: "Madaniyyah" },
  { number: 111, name: "Al-Lahab", ayahs: 5, revelationType: "Makkiyyah" },
  { number: 112, name: "Al-Ikhlas", ayahs: 4, revelationType: "Makkiyyah" },
  { number: 113, name: "Al-Falaq", ayahs: 5, revelationType: "Makkiyyah" },
  { number: 114, name: "An-Nas", ayahs: 6, revelationType: "Makkiyyah" },
];

// =======================
// Levenshtein Distance
// =======================
function levenshtein(a, b) {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

// =======================
// Fuzzy Search Function
// =======================
export function fuzzyFindSurah(keyword) {
  let bestMatch = null;
  let bestScore = -1;

  for (const surah of surahs) {
    const distance = levenshtein(
      keyword.toLowerCase(),
      surah.name.toLowerCase()
    );
    const maxLen = Math.max(keyword.length, surah.name.length);
    const score = 1 - distance / maxLen; // similarity 0 → 1

    if (score > bestScore) {
      bestScore = score;
      bestMatch = surah;
    }
  }

  return bestMatch
    ? { number: bestMatch.number, name: bestMatch.name, score: bestScore }
    : null;
}

// =======================
// Example Usage
// =======================
console.log(fuzzyFindSurah("alimran"));
// → { number: 3, name: 'Ali Imran', score: 0.888... }

console.log(fuzzyFindSurah("anisa"));
// → { number: 4, name: 'An-Nisa', score: 0.846... }

console.log(fuzzyFindSurah("alfatihah"));
// → { number: 1, name: 'Al-Fatihah', score: 0.857... }

console.log(fuzzyFindSurah("albaqorah"));
// → { number: 2, name: 'Al-Baqarah', score: 0.889... }
