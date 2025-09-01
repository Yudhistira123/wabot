const { quran } = require("@quranjs/api");
const axios = require("axios");

async function main() {
  const chapters = await quran.v4.chapters.findAll({
    fetchFn: (url) => axios.get(url).then((res) => res.data),
  });

  const yudhi = await quran.v4.audio.findAllChapterRecitations("2");

  // quran.v4.audio.findAllChapterRecitations("2");

  //console.log(chapters);
  console.log(yudhi);
}

main().catch(console.error);
