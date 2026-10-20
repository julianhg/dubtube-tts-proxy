const express = require("express");
const cors = require("cors");
const { MsEdgeTTS, OUTPUT_FORMAT } = require("msedge-tts");

const app = express();
app.use(cors());

app.get("/", (req, res) => {
  res.json({ status: "ok", message: "DubTube Edge TTS proxy funcionando" });
});

app.get("/tts", async (req, res) => {
  const text = req.query.text;
  const voice = req.query.voice || "es-MX-DaliaNeural";
  const rate = req.query.rate || "+0%";
  const pitch = req.query.pitch || "+0Hz";
  const volume = req.query.volume || "+0%";

  if (!text) {
    return res.status(400).json({ error: "Falta el parametro text" });
  }

  try {
    const tts = new MsEdgeTTS();
    await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

    const { audioStream } = await tts.toStream(text, { rate, pitch, volume });

    const chunks = [];
    audioStream.on("data", (chunk) => chunks.push(chunk));
    audioStream.on("end", () => {
      const audioBuffer = Buffer.concat(chunks);
      res.setHeader("Content-Type", "audio/mpeg");
      res.status(200).send(audioBuffer);
    });
    audioStream.on("error", (err) => {
      res.status(500).json({ error: String(err) });
    });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Servidor DubTube TTS escuchando en puerto " + PORT);
});
