import { GoogleGenAI } from "@google/genai";
import { setCors } from "./_lib/cors.js";
import { checkAndIncrementUsage, logEvent } from "./_lib/usage.js";

const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_PROMPT_KO = `당신은 성경에 뿌리를 둔 꿈 묵상 안내자입니다.
장로교, 감리교, 침례교 등 주류 개신교 신학에 기반하여 응답하세요. 신비주의, 은사주의 극단, 번영신학, 이단 교리는 절대 포함하지 마세요.
사용자가 꿈을 나누면 다음 원칙에 따라 한국어로 응답하세요:

1. 꿈과 관련된 실제 성경 구절 2–3개를 인용하세요 (예: 요엘 2:28, 창세기 37장, 다니엘 2장, 마태복음 1:20). 개역개정을 사용하세요.
2. 성경 말씀의 빛 아래에서 꿈의 핵심 상징 요소들을 설명하세요
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

const SYSTEM_PROMPT_EN = `You are a biblically-rooted dream reflection guide.
Respond from a mainstream Protestant perspective (Presbyterian, Methodist, or Baptist tradition). Never include prosperity gospel, extreme charismatic theology, New Age mysticism, or any heretical doctrine.
When someone shares a dream, respond according to these principles in English:

1. Cite 2–3 real Bible passages related to the dream (e.g. Joel 2:28, Genesis 37, Daniel 2, Matthew 1:20). Use NIV or ESV.
2. Explain the key symbolic elements of the dream in the light of Scripture
3. Approach through the lens of prayerful reflection on God's Word — not prophecy or divination
4. Avoid definitive statements like "this dream means X." Use open language: "Scripture invites us to reflect...", "we might consider...", "perhaps..."
5. Close with a prayer intention or a specific Bible verse to meditate on today
6. Write the full response in 300–500 words in English

Response format:
**Dream Reflection**
(Biblical reflection on the dream's meaning and symbols)

**Related Scripture**
- Verse 1 (Book Chapter:Verse — Translation)
- Verse 2 (Book Chapter:Verse — Translation)
- Verse 3 (Book Chapter:Verse — Translation, optional)

**Prayer Focus**
(A short prayer intention or Bible verse to carry with you today)`;

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

export default async function handler(req, res) {
  setCors(res, req);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { dream_text, skip_image, lang = "ko", userId } = req.body ?? {};
  const isEn = lang === "en";

  if (!dream_text?.trim()) return res.status(400).json({ error: isEn ? "Please enter your dream." : "꿈 내용을 입력해주세요." });
  if (dream_text.trim().length < 10) return res.status(400).json({ error: isEn ? "Please describe your dream in more detail." : "꿈을 조금 더 자세히 적어주세요." });
  if (dream_text.trim().length > 2000) return res.status(400).json({ error: isEn ? "Please keep your dream under 2,000 characters." : "꿈 설명은 2,000자 이내로 작성해주세요." });

  const usage = await checkAndIncrementUsage(userId);
  if (!usage.allowed) {
    return res.status(403).json({
      error: isEn ? "You've used all your free reflections this month." : "이번 달 무료 횟수를 모두 사용했습니다.",
      limitReached: true,
    });
  }

  const SYSTEM_PROMPT = isEn ? SYSTEM_PROMPT_EN : SYSTEM_PROMPT_KO;
  const dreamLabel = isEn ? "My dream" : "제 꿈";

  const textPromise = genai.models.generateContent({
    model: "gemini-2.5-flash",
    config: { thinkingConfig: { thinkingBudget: 0 } },
    contents: `${SYSTEM_PROMPT}\n\n${dreamLabel}:\n${dream_text.trim()}`,
  });

  const imagePromise = skip_image
    ? Promise.resolve(null)
    : generateImageWithImagen(dream_text).catch(() => null);

  const [interpretResult, imageResult] = await Promise.allSettled([textPromise, imagePromise]);

  if (interpretResult.status === "rejected") {
    console.error("Gemini error:", interpretResult.reason?.message);
    return res.status(500).json({ error: isEn ? "Failed to generate interpretation. Please try again." : "해석을 생성하는 중 오류가 발생했습니다." });
  }

  logEvent(userId, "interpret", lang);
  return res.status(200).json({
    interpretation: interpretResult.value.text ?? "",
    image_url: imageResult.status === "fulfilled" ? imageResult.value : null,
  });
}
