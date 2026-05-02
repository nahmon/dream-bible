import { GoogleGenAI } from "@google/genai";

const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_PROMPT = `당신은 성경에 뿌리를 둔 꿈 묵상 안내자입니다.
사용자가 꿈을 나누면 다음 원칙에 따라 한국어로 응답하세요:

1. 꿈과 관련된 실제 성경 구절 2–3개를 인용하세요 (예: 요엘 2:28, 창세기 37장, 다니엘 2장, 마태복음 1:20). 개역개정 또는 NIV를 사용하세요.
2. 성경적 관점에서 꿈의 핵심 상징 요소들을 설명하세요
3. 예언이나 점술이 아닌, 하나님의 말씀에 대한 기도하는 묵상의 렌즈로 접근하세요
4. "이 꿈은 X를 의미합니다"와 같은 단정적 표현을 피하세요. 열린 언어를 사용하세요: "성경은 우리를 묵상으로 초대합니다...", "우리는 묵상할 수 있습니다...", "이것은 어쩌면..."
5. 기도 제목이나 오늘 묵상할 특정 성경 구절을 제안하며 마무리하세요
6. 전체 응답을 300–500 단어의 한국어로 작성하세요

응답 형식:
**꿈 묵상**
(꿈의 의미와 상징에 대한 성경적 묵상)

**관련 성경 구절**
- 구절 1 (성경 장:절 — 번역본)
- 구절 2 (성경 장:절 — 번역본)
- 구절 3 (성경 장:절 — 번역본, 선택)

**기도 제목**
(오늘 함께할 간단한 기도 의도나 성경 구절)`;

function buildImagePrompt(dreamText) {
  const trimmed = dreamText.trim().slice(0, 200);
  return `A serene biblical illuminated manuscript illustration inspired by this dream: "${trimmed}". Style: classical Renaissance painting with gold leaf accents, warm heavenly amber light streaming from above, soft celestial clouds, symbolic Christian imagery, peaceful and contemplative atmosphere, rich jewel-toned colors, detailed spiritual artwork. No text, no writing, no letters.`;
}

async function generateImageWithImagen(dreamText) {
  const response = await genai.models.generateImages({
    model: "imagen-3.0-generate-002",
    prompt: buildImagePrompt(dreamText),
    config: { numberOfImages: 1, outputMimeType: "image/jpeg", aspectRatio: "1:1" },
  });
  const imageBytes = response.generatedImages?.[0]?.image?.imageBytes;
  if (!imageBytes) return null;
  return `data:image/jpeg;base64,${imageBytes}`;
}

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

export default async function handler(req, res) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { dream_text, skip_image } = req.body ?? {};

  if (!dream_text?.trim()) {
    return res.status(400).json({ error: "꿈 내용을 입력해주세요." });
  }
  if (dream_text.trim().length < 10) {
    return res.status(400).json({ error: "꿈을 조금 더 자세히 적어주세요 (10자 이상)." });
  }
  if (dream_text.trim().length > 2000) {
    return res.status(400).json({ error: "꿈 설명은 2,000자 이내로 작성해주세요." });
  }

  const textPromise = genai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: `${SYSTEM_PROMPT}\n\n제 꿈:\n${dream_text.trim()}`,
  });

  const imagePromise = skip_image
    ? Promise.resolve(null)
    : generateImageWithImagen(dream_text).catch(() => null);

  const [interpretResult, imageResult] = await Promise.allSettled([textPromise, imagePromise]);

  if (interpretResult.status === "rejected") {
    console.error("Gemini interpret error:", interpretResult.reason);
    return res.status(500).json({ error: "해석을 생성하는 중 오류가 발생했습니다. 다시 시도해주세요." });
  }

  const interpretation = interpretResult.value.text ?? "";
  const image_url = imageResult.status === "fulfilled" ? imageResult.value : null;

  if (imageResult.status === "rejected") {
    console.warn("Image generation failed (non-fatal):", imageResult.reason?.message);
  }

  return res.status(200).json({ interpretation, image_url });
}
