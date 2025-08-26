const axios = require("axios");
const { MessageMedia } = require("whatsapp-web.js");

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
    const response = await axios.get(avatarUrl, { responseType: "arraybuffer" });
    const media = new MessageMedia(
      "image/jpeg",
      Buffer.from(response.data, "binary").toString("base64"),
      `${name}.jpg`
    );
    await client.sendMessage(`${toNumber}@c.us`, media, {
      caption: `📸 ${name} (📞 ${phone})`
    });
    console.log(`✅ Avatar of ${name} sent to ${toNumber}`);
  } catch (err) {
    console.error(`❌ Failed for ${name}:`, err.message);
  }
}

module.exports = { sendAvatar };
