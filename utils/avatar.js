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

async function sendNewsMessage(client, chatId, newsUrl) {
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
    let description =
      $("meta[name='description']").attr("content") ||
      $("article p").first().text() ||
      $("p").first().text();

    if (description.length > 250) {
      description = description.substring(0, 247) + "...";
    }

    // 6. Buat media WhatsApp
    const media = await MessageMedia.fromUrl(imageUrl);

    // // 6. Kirim dengan caption
    // await client.sendMessage(chatId, media, {
    //   caption: `📰 *${title}*\n\nBaca selengkapnya:\n${newsUrl}`,
    // });

    // 7. Kirim dengan caption
    await client.sendMessage(chatId, media, {
      caption: `📰 *${title}*\n\n${description}\n\nBaca selengkapnya:\n${newsUrl}`,
    });

    console.log("✅ Berita terkirim dengan gambar:", imageUrl);
  } catch (err) {
    console.error("❌ Gagal ambil berita:", err.message);
    // fallback: kirim link saja
    await client.sendMessage(chatId, `📰 Berita selengkapnya:\n${newsUrl}`);
  }
}

module.exports = { sendAvatar, sendNewsMessage };
