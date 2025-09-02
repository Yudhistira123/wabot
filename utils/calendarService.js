// const axios = require("axios");
import axios from "axios";
// const https = require("https");
// const agent = new https.Agent({ family: 4 }); // IPv4 only

let reply = "";
//Yudhi
export async function getCalendar(year, month) {
  const url = `https://libur.deno.dev/api?year=${year}&month=${month}`;
  console.log(url);

  const res = await axios.get(url);
  console.log(res.data);
  return res.data;
}

// Format pesan kalender
export function formatCalendar(data, year, month) {
  let reply = "";
  if (!data || data.length === 0) {
    return `❌ Tidak ada data LIBUR untuk ${month}/${year}`;
  }
  data.forEach((day) => {
    reply += `📌 ${day.date} → ${day.name}\n`;
  });
  return reply;
}

//module.exports = { getCalendar, formatCalendar };
