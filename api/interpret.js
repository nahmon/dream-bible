import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const FREE_LIMIT = 3;
const CURRENT_MONTH = () => new Date().toISOString().slice(0, 7); // 'YYYY-MM'

const SYSTEM_PROMPT = `당신은 성경에 기반한 꿈 묵상 가이드입니다.
사용자가 꿈 내용을 공유하면, 다음 원칙에 따라 응답하세요:

1. 성경에서 꿈과 관련된 실제 구절을 2~3개 인용하세요 (요엘 2:28, 창세기 37장, 다니엘서 등)
2. 꿈의 주요 상징 요소를 성경적 관점에서 설명하세요
3. 예언이나 점술이 아닌, 하나님의 말씀 위에서의 묵상 관점으로 접근하세요
4. "이 꿈이 반드시 ~를 의미한다"는 단정적 표현을 피하고, "성경은 ~라고 말합니다", "묵상해볼 수 있습니다"처럼 열린 표현을 사용하세요
5. 마지막에 적용 가능한 기도 제목이나 말씀 묵상 방향을 제안하세요
6. 전체 응답은 한국어로, 300~500자 내외로 작성하세요

응답 형식:
**꿈의 묵상**
(꿈의 의미와 상징에 대한 성경적 성찰)

**관련 말씀**
- 구절 1 (책 장:절)
- 구절 2 (책 장:절)
- 구절 3 (책 장:절, 선택사항)

**오늘의 기도 방향**
(짧은 기도 제목 또는 묵상 방향)`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { dream_text } = req.body ?? {};

  if (!dream_text?.trim()) {
    return res.status(400).json({ error: "dream_text is required" });
  }

  if (dream_text.trim().length < 10) {
    return res.status(400).json({ error: "꿈 내용을 좀 더 자세히 입력해 주세요 (10자 이상)" });
  }

  if (dream_text.trim().length > 2000) {
    return res.status(400).json({ error: "꿈 내용은 2000자 이내로 입력해 주세요" });
  }

  // Verify user from JWT
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ error: "로그인이 필요합니다" });
  }
  const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
  if (authErr || !user) {
    return res.status(401).json({ error: "인증이 만료되었습니다. 다시 로그인해 주세요." });
  }
  const user_id = user.id;

  // Check monthly usage limit
  const month = CURRENT_MONTH();
  const { data: usage } = await supabase
    .from("dream_usage")
    .select("count")
    .eq("user_id", user_id)
    .eq("month", month)
    .single();

  const currentCount = usage?.count ?? 0;
  if (currentCount >= FREE_LIMIT) {
    return res.status(403).json({
      error: "이번 달 무료 해석 횟수(3회)를 모두 사용하셨습니다",
      code: "LIMIT_REACHED",
    });
  }

  // Call OpenAI
  let interpretation;
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `꿈 내용:\n${dream_text.trim()}` },
      ],
      max_tokens: 800,
      temperature: 0.7,
    });
    interpretation = completion.choices[0]?.message?.content ?? "";
  } catch (err) {
    console.error("OpenAI error:", err);
    return res.status(500).json({ error: "AI 해석 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요." });
  }

  // Save dream to DB
  const { data: dream, error: dreamErr } = await supabase
    .from("dreams")
    .insert({ user_id, dream_text: dream_text.trim(), interpretation })
    .select("id")
    .single();

  if (dreamErr) {
    console.error("DB insert error:", dreamErr);
    return res.status(500).json({ error: "저장 중 오류가 발생했습니다" });
  }

  // Upsert usage count
  const { error: upsertErr } = await supabase.from("dream_usage").upsert(
    { user_id, month, count: currentCount + 1 },
    { onConflict: "user_id,month" }
  );
  if (upsertErr) {
    console.error("Usage upsert error (dream saved, count not incremented):", upsertErr, { dream_id: dream.id });
  }

  return res.status(200).json({
    interpretation,
    dream_id: dream.id,
    usage_remaining: FREE_LIMIT - (currentCount + 1),
  });
}
