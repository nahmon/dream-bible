import { C, F, Ic } from "../lib/constants.jsx";
import { Btn } from "../components/shared.jsx";

function parseInterpretation(text) {
  if (!text) return [];
  return text.split("\n").map((line, i) => {
    const t = line.trim();
    if (t.startsWith("**") && t.endsWith("**")) {
      return { type: "heading", text: t.slice(2, -2), key: i };
    }
    if (t.startsWith("- ")) {
      return { type: "bullet", text: t.slice(2), key: i };
    }
    if (!t) {
      return { type: "spacer", key: i };
    }
    return { type: "text", text: t, key: i };
  });
}

export default function ResultScreen({ go, result }) {
  const { interpretation, dream_text, usage_remaining } = result ?? {};
  const parsed = parseInterpretation(interpretation);

  return (
    <div style={{ minHeight: "100vh", background: C.cream, fontFamily: F }}>
      {/* Nav */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", background: C.white, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Ic.Star s={18} c={C.gold} />
          <span style={{ fontSize: 16, fontWeight: 700, color: C.navy }}>꿈묵상</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn size="sm" variant="ghost" onClick={() => go("history")}>기록 보기</Btn>
          <Btn size="sm" variant="gold" onClick={() => go("dream")}>새 꿈 기록</Btn>
        </div>
      </nav>

      <div style={{ maxWidth: 560, margin: "0 auto", padding: "36px 24px 60px" }}>
        {/* Dream text recap */}
        <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: "16px 20px", marginBottom: 24 }}>
          <div style={{ fontSize: 12, color: C.body, marginBottom: 6, fontWeight: 500, letterSpacing: "0.3px" }}>꿈 내용</div>
          <p style={{ fontSize: 15, color: C.label, lineHeight: 1.6 }}>{dream_text}</p>
        </div>

        {/* Interpretation */}
        <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, padding: "24px", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <div style={{ width: 32, height: 32, background: C.goldBg, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Ic.Sparkle s={16} c={C.gold} />
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.navy }}>성경적 묵상</div>
          </div>

          <div style={{ lineHeight: 1.8 }}>
            {parsed.map(block => {
              if (block.type === "heading") return (
                <div key={block.key} style={{ fontSize: 15, fontWeight: 700, color: C.navy, marginTop: 20, marginBottom: 8, paddingBottom: 8, borderBottom: `1px solid ${C.border}` }}>
                  {block.text}
                </div>
              );
              if (block.type === "bullet") return (
                <div key={block.key} style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "flex-start" }}>
                  <span style={{ color: C.gold, fontSize: 16, flexShrink: 0, marginTop: 1 }}>✦</span>
                  <span style={{ fontSize: 15, color: C.label, lineHeight: 1.65 }}>{block.text}</span>
                </div>
              );
              if (block.type === "spacer") return <div key={block.key} style={{ height: 8 }} />;
              return (
                <p key={block.key} style={{ fontSize: 15, color: C.label, lineHeight: 1.75, marginBottom: 4 }}>
                  {block.text}
                </p>
              );
            })}
          </div>
        </div>

        {/* Usage remaining */}
        {usage_remaining !== undefined && (
          <div style={{ textAlign: "center", fontSize: 13, color: C.body, marginBottom: 20 }}>
            이번 달 남은 무료 해석:{" "}
            <strong style={{ color: usage_remaining > 0 ? C.gold : C.error }}>{usage_remaining}회</strong>
            {usage_remaining === 0 && (
              <>
                {" · "}
                <button onClick={() => go("pricing")} style={{ color: C.gold, background: "none", border: "none", cursor: "pointer", fontFamily: F, fontSize: 13, fontWeight: 600, textDecoration: "underline" }}>
                  무제한 플랜 보기
                </button>
              </>
            )}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: 12 }}>
          <Btn variant="ghost" full onClick={() => go("dream")}>
            <Ic.Moon s={16} c={C.navy} />
            새 꿈 기록하기
          </Btn>
          <Btn variant="gold" full onClick={() => go("history")}>
            <Ic.History s={16} c="#fff" />
            기록 모아보기
          </Btn>
        </div>

        {/* Disclaimer */}
        <div style={{ marginTop: 24, fontSize: 12, color: C.body, textAlign: "center", lineHeight: 1.5 }}>
          이 해석은 예언이 아닌 성경적 묵상 가이드입니다.<br />
          영적 결정은 담임 목사님 또는 신앙 공동체와 함께 하세요.
        </div>
      </div>
    </div>
  );
}
