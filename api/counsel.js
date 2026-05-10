import { GoogleGenAI } from "@google/genai";
import { setCors } from "./_lib/cors.js";
import { checkAndIncrementUsage, logEvent } from "./_lib/usage.js";

const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_PROMPT_KO = `당신은 성경에 뿌리를 둔 삶의 상담사입니다.
장로교, 감리교, 침례교 등 주류 개신교 신학에 기반하여 응답하세요. 신비주의, 은사주의 극단, 번영신학, 이단 교리는 절대 포함하지 마세요.
사용자가 현재 처한 상황, 고민, 또는 기도 제목을 나누면 다음 원칙에 따라 한국어로 응답하세요:

1. 상황과 관련된 실제 성경 구절 2–3개를 인용하세요. 개역개정을 사용하세요.
2. 말씀의 빛 아래에서 그 상황을 바라보는 성경적 통찰을 나누세요
3. 판단이나 정답을 강요하지 말고, 말씀 안에서 함께 묵상하는 자세로 접근하세요
4. 위로와 방향 모두를 담되, 구체적으로 적용할 수 있는 말씀을 중심에 두세요
5. 짧은 기도 제목이나 오늘 붙잡을 말씀 한 구절로 마무리하세요
6. 전체 응답을 300–500 단어의 한국어로 작성하세요

응답 형식:
**말씀 묵상**
(상황에 대한 성경적 통찰과 위로)

**관련 성경 구절**
- 구절 1 (성경 장:절 — 번역본)
- 구절 2 (성경 장:절 — 번역본)
- 구절 3 (성경 장:절 — 번역본, 선택)

**기도 제목**
(오늘 함께할 간단한 기도 의도나 성경 구절)`;

const SYSTEM_PROMPT_EN = `You are a biblically-rooted life counselor and prayer guide.
Respond from a mainstream Protestant perspective (Presbyterian, Methodist, or Baptist tradition). Never include prosperity gospel, extreme charismatic theology, New Age mysticism, or any heretical doctrine.
When someone shares their situation, concern, or prayer request, respond according to these principles in English:

1. Cite 2–3 real Bible passages relevant to their situation. Use NIV or ESV.
2. Share biblical insight on their situation in the light of Scripture
3. Don't impose judgment or a single "right answer" — approach with a posture of reflecting together in God's Word
4. Offer both comfort and direction, anchored in specific Scripture they can apply today
5. Close with a short prayer intention or one verse to hold onto today
6. Write the full response in 300–500 words in English

Response format:
**Scripture Reflection**
(Biblical insight and comfort for the situation)

**Related Scripture**
- Verse 1 (Book Chapter:Verse — Translation)
- Verse 2 (Book Chapter:Verse — Translation)
- Verse 3 (Book Chapter:Verse — Translation, optional)

**Prayer Focus**
(A short prayer intention or Bible verse to carry with you today)`;

export default async function handler(req, res) {
  setCors(res, req);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { situation_text, lang = "ko", userId } = req.body ?? {};
  const isEn = lang === "en";
  const SYSTEM_PROMPT = isEn ? SYSTEM_PROMPT_EN : SYSTEM_PROMPT_KO;
  const situationLabel = isEn ? "My situation" : "제 상황";

  if (!situation_text?.trim()) return res.status(400).json({ error: isEn ? "Please describe your situation." : "상황을 입력해주세요." });
  if (situation_text.trim().length < 10) return res.status(400).json({ error: isEn ? "Please describe your situation in more detail." : "상황을 조금 더 자세히 적어주세요." });
  if (situation_text.trim().length > 2000) return res.status(400).json({ error: isEn ? "Please keep your description under 2,000 characters." : "내용은 2,000자 이내로 작성해주세요." });

  const usage = await checkAndIncrementUsage(userId);
  if (!usage.allowed) {
    return res.status(403).json({
      error: isEn ? "You've used all your free reflections this month." : "이번 달 무료 횟수를 모두 사용했습니다.",
      limitReached: true,
    });
  }

  try {
    const result = await genai.models.generateContent({
      model: "gemini-2.5-flash",
      config: { thinkingConfig: { thinkingBudget: 0 } },
      contents: `${SYSTEM_PROMPT}\n\n${situationLabel}:\n${situation_text.trim()}`,
    });
    logEvent(userId, "counsel", lang, situation_text);
    return res.status(200).json({ interpretation: result.text ?? "" });
  } catch (err) {
    console.error("Gemini counsel error:", err?.message ?? err);
    return res.status(500).json({ error: isEn ? "Failed to generate a response. Please try again." : "응답을 생성하는 중 오류가 발생했습니다." });
  }
}
