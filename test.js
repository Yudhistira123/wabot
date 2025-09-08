// testSurat.js
//import { getSholatByLocation } from "./utils/sholat.js";
import { getWeather, formatWeather } from "./utils/weather.cjs";

async function main() {
  let lat = "-6.897104364739567";
  let lon = "107.58028260946797";
  let apiKey = "44747099862079d031d937f5cd84a57e";

  let replyMsg = await getWeather(lat, lon, apiKey);
  replyMsg = formatWeather(replyMsg);
  console.log(replyMsg);
}

main();
