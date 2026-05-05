import { GoogleGenAI } from "@google/genai";

const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

function buildImagePrompt(dreamText) {
  const trimmed = dreamText.trim().slice(0, 200);
  return `A serene biblical illuminated manuscript illustration inspired by this dream: "${trimmed}". Style: classical Renaissance painting with gold leaf accents, warm heavenly amber light streaming from above, soft celestial clouds, symbolic Christian imagery, peaceful and contemplative atmosphere, rich jewel-toned colors, detailed spiritual artwork. No text, no writing, no letters.`;
}

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

export default async function handler(req, res) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();

  const { dream_text } = req.body ?? {};
  if (!dream_text?.trim()) return res.status(400).json({ error: "dream_text required" });

  try {
    const response = await genai.models.generateImages({
      model: "imagen-4.0-fast-generate-001",
      prompt: buildImagePrompt(dream_text),
      config: { numberOfImages: 1, outputMimeType: "image/jpeg", aspectRatio: "1:1" },
    });
    const imageBytes = response.generatedImages?.[0]?.image?.imageBytes;
    if (!imageBytes) return res.status(500).json({ error: "이미지 생성 실패" });
    return res.status(200).json({ image_url: `data:image/jpeg;base64,${imageBytes}` });
  } catch (err) {
    console.error("Image generation error:", err?.message);
    return res.status(500).json({ error: "이미지 생성 실패" });
  }
}
