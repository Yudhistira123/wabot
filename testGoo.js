import googleTTS from "google-tts-api";
import { Client, DefaultMediaReceiver } from "castv2-client";

function castTTS(text) {
  const url = googleTTS.getAudioUrl(text, {
    lang: "id",
    slow: false,
    host: "https://translate.google.com",
  });

  const host = "192.168.100.6"; // your Google Home IP
  const client = new Client();

  client.connect(host, () => {
    client.launch(DefaultMediaReceiver, (err, player) => {
      if (err) throw err;

      const media = {
        contentId: url,
        contentType: "audio/mp3",
        streamType: "BUFFERED",
      };

      player.load(media, { autoplay: true }, (err, status) => {
        if (err) throw err;
        console.log("TTS Playing:", status);
      });
    });
  });
}

//castTTS(" tabungan Faraz udah habis loh di bapak, terus gimana nih?");

// castTTS(
//   "ya Allah, sehatkanlah, lindungilah, jauhkanlah dari segala bencana dan marabahaya, serta lancarkanlah segala urusan hamba-hamba-Mu ini, aamiin"
// );

castTTS(
  "Wahai paduka raja, hamba datang membawa titah suci dari negeri seberang."
);
