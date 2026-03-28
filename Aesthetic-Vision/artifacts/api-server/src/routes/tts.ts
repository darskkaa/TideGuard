import { Router, type IRouter } from "express";

const router: IRouter = Router();

router.post("/tts", async (req, res) => {
  const { text } = req.body as { text?: string };

  if (!text || typeof text !== "string") {
    return res.status(400).json({ error: "text is required" });
  }

  const apiKey = process.env["ELEVENLABS_API_KEY"];
  const voiceId = process.env["ELEVENLABS_VOICE_ID"] ?? "21m00Tcm4TlvDq8ikWAM";

  if (!apiKey || apiKey === "your_elevenlabs_api_key_here") {
    return res.status(503).json({
      error: "ElevenLabs API key not configured. Set ELEVENLABS_API_KEY in your environment.",
    });
  }

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          Accept: "audio/mpeg",
          "Content-Type": "application/json",
          "xi-api-key": apiKey,
        },
        body: JSON.stringify({
          text: text.slice(0, 2500),
          model_id: "eleven_monolingual_v1",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
        signal: AbortSignal.timeout(30000),
      }
    );

    if (!response.ok) {
      const body = await response.text();
      req.log.error({ status: response.status, body }, "ElevenLabs API error");
      return res.status(response.status).json({ error: "TTS API error" });
    }

    const audioBuffer = await response.arrayBuffer();
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Length", audioBuffer.byteLength);
    return res.send(Buffer.from(audioBuffer));
  } catch (err) {
    req.log.error({ err }, "TTS fetch failed");
    return res.status(500).json({ error: "TTS request failed" });
  }
});

export default router;
