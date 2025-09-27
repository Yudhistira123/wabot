//const axios = require("axios");
import axios from "axios";

export async function sendMessages(client, topic, message) {
  const text = `Lampu ${topic} : ${message.toString()}`;
  //const jids = ["628122132341@c.us", "6285183819833@c.us"]; // your WA targets
  const jids = [
    "628122132341@c.us",
    "6285183819833@c.us",
    // "6285220757725@c.us",
    // "628122233610@c.us",
    // "6285975386345@c.us",
    // "628121462983@c.us",
  ];
  for (const jid of jids) {
    try {
      await client.sendMessage(jid, { text }); // <-- FIX: must be { text: "..." }

      // await client.sendMessage(
      //   number,
      //   ` Lampu ${topic} : ${message.toString()}`
      // );
      console.log(`✅ Sent to ${jid}: ${text}`);
      //   console.log(`✅ Message sent to ${number}`);
    } catch (err) {
      console.error(`❌ Failed to send to ${number}:`, err);
    }
  }
}

// module.exports = { sendMessages };
