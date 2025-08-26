
const axios = require("axios");
async function getCalendar(year, month) {
  const url = `https://libur.deno.dev/api?year=${year}&month=${month}`;
  const res = await axios.get(url);
  return res.data;
}

// Format pesan kalender
function formatCalendar(data, year, month) {
  if (!data || data.length === 0) {
    return `❌ Tidak ada data LIBUR untuk ${month}/${year}`;
  }
   data.forEach(day => {
    reply += `📌 ${day.date} → ${day.name}\n`;
  });
  return reply;
}


module.exports = { getCalendar, formatCalendar };