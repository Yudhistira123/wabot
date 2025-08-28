const axios = require("axios");
const { MessageMedia } = require("whatsapp-web.js");
const cheerio = require("cheerio");

async function sendAvatar(client, participant, toNumber, name, avatarUrl) {
  try {
    if (!avatarUrl) {
      console.log(`⚠️ ${name} has no avatar.`);
      return;
    }
    // 🔹 Ambil nomor WA dari JID
    let phone = participant.id._serialized.replace("@c.us", "");
    if (phone.startsWith("62")) {
      phone = "0" + phone.substring(2);
    }
    const response = await axios.get(avatarUrl, {
      responseType: "arraybuffer",
    });
    const media = new MessageMedia(
      "image/jpeg",
      Buffer.from(response.data, "binary").toString("base64"),
      `${name}.jpg`
    );
    await client.sendMessage(`${toNumber}@c.us`, media, {
      caption: `📸 ${name} (📞 ${phone})`,
    });
    console.log(`✅ Avatar of ${name} sent to ${toNumber}`);
  } catch (err) {
    console.error(`❌ Failed for ${name}:`, err.message);
  }
}

const penerima = [
  "628122132341@c.us",
  "6285183819833@c.us", //robot
  // "6281220000306@c.us", // pa sahmudin
  //"6281224733362@c.us", // risma
  // "6281806000781@c.us", //yanti
  // "6282124609104@c.us", // pa Er
];

const number = "628122132341"; // ganti ke nomor tujuan
const chatId = number + "@c.us";

function sanitizeUrl(url) {
  // ganti underscore jadi dash
  url = url.replace(/_/g, "-");
  return url.replace(/,/g, "-");
}

async function sendNewsMessage(client, newsUrl) {
  try {
    // 1. Fetch HTML
    const { data } = await axios.get(newsUrl);

    // 2. Load ke cheerio
    const $ = cheerio.load(data);

    // 3. Ambil meta image (Open Graph)
    let imageUrl = $("meta[property='og:image']").attr("content");

    // fallback kalau og:image ga ada → cari img pertama di artikel
    if (!imageUrl) {
      imageUrl = $("img").first().attr("src");
    }

    // pastikan absolute URL
    if (imageUrl && !imageUrl.startsWith("http")) {
      const base = new URL(newsUrl).origin;
      imageUrl = base + imageUrl;
    }

    // 4. Ambil judul berita
    let title =
      $("meta[property='og:title']").attr("content") || $("title").text();

    // 5. Ambil deskripsi / paragraf pertama
    // let description =
    //   $("meta[name='description']").attr("content") ||
    //   $("article p").first().text() ||
    //   $("p").first().text();

    let description =
      $("meta[name='description']").attr("content") ||
      $("article p")
        .slice(0, 3)
        .map((i, el) => $(el).text())
        .get()
        .join(" ") ||
      $("p")
        .slice(0, 3)
        .map((i, el) => $(el).text())
        .get()
        .join(" ");

    console.log("Deskripsi lebih panjang:", description);

    console.log("Deskripsi asli:", description);
    if (description.length > 500) {
      description = description.substring(0, 447) + "...";
    }

    // 6. Buat media WhatsApp
    const media = await MessageMedia.fromUrl(imageUrl);

    // // 6. Kirim dengan caption
    // await client.sendMessage(chatId, media, {
    //   caption: `📰 *${title}*\n\nBaca selengkapnya:\n${newsUrl}`,
    // });

    // 6. Bersihkan URL (trim & pastikan ada http)
    newsUrl = newsUrl.trim();
    if (!newsUrl.startsWith("http")) {
      newsUrl = "https://" + newsUrl;
    }

    const safeUrl = sanitizeUrl(newsUrl);

    // 7. Kirim dengan caption
    for (const number of penerima) {
      try {
        await client.sendMessage(number, media, {
          //   //  caption: `📰 *${title}*\n\n${description}....\n\nselengkapnya:\n${newsUrl}`
          caption: `📰 *${title}*\n\n${description}\n\n🔗 Baca selengkapnya:\n\n${safeUrl}`,
        });
        //console.log(`✅ Message sent to ${number}`);
        //  await client.sendMessage(number, media, {
        //    caption: `📰 *${title}*\n\n${description}`,
        //  });
        // await new Promise((r) => setTimeout(r, 1500));
        // await client.sendMessage(number, safeUrl, { linkPreview: true });
      } catch (err) {
        console.error(`❌ Failed to send to ${number}:`, err);
      }
    }
  } catch (err) {
    console.error("❌ Gagal ambil berita:", err.message);
    // fallback: kirim link saja
    await client.sendMessage(chatId, `📰 Berita selengkapnya:\n${safeUrl}`);
  }
}

module.exports = { sendAvatar, sendNewsMessage };
