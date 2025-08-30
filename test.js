const puppeteer = require("puppeteer");
(async () => {
  const browser = await puppeteer.launch({ headless: true });
  console.log("Chromium launched OK!");
  await browser.close();
})();
