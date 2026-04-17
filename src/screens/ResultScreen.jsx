import { C, F, Ic } from "../lib/constants.jsx";
import { Btn } from "../components/shared.jsx";

const NAV_STYLE = {
  position: "sticky", top: 0, zIndex: 100,
  height: 48,
  background: "rgba(0,0,0,0.8)",
  backdropFilter: "saturate(180%) blur(20px)",
  WebkitBackdropFilter: "saturate(180%) blur(20px)",
  display: "flex", alignItems: "center", justifyContent: "space-between",
  padding: "0 24px",
};

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

export default function ResultScreen({ go, result, user }) {
  const { interpretation, dream_text, usage_remaining } = result ?? {};
  const parsed = parseInterpretation(interpretation);

  return (
    <div style={{ minHeight: "100vh", background: C.gray, fontFamily: F }}>
      {/* Glass Nav */}
      <nav style={NAV_STYLE}>
        <button onClick={() => go("dream")} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
          <Ic.Cross s={14} c="rgba(255,255,255,0.85)" />
          <span style={{ fontSize: 14, fontWeight: 600, color: "#fff", letterSpacing: "-0.2px" }}>꿈묵상</span>
        </button>
        <div style={{ display: "flex", gap: 8 }}>
          {user && <Btn size="sm" variant="ghostDark" onClick={() => go("history")}>기록 보기</Btn>}
          <Btn size="sm" variant="primary" onClick={() => go("dream")}>새 꿈 기록</Btn>
        </div>
      </nav>

      <div style={{ maxWidth: 560, margin: "0 auto", padding: "36px 24px 60px" }}>
        {/* Dream text recap */}
        <div style={{ background: C.white, borderRadius: 12, padding: "16px 20px", marginBottom: 16, boxShadow: "rgba(0,0,0,0.06) 0px 1px 8px 0px" }}>
          <div style={{ fontSize: 12, color: C.body, marginBottom: 6, fontWeight: 500, letterSpacing: "-0.12px" }}>꿈 내용</div>
          <p style={{ fontSize: 15, color: C.nearBlack, lineHeight: 1.6, letterSpacing: "-0.224px" }}>{dream_text}</p>
        </div>

        {/* Interpretation */}
        <div style={{ background: C.white, borderRadius: 12, padding: "24px", marginBottom: 16, boxShadow: "rgba(0,0,0,0.06) 0px 1px 8px 0px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <div style={{ width: 30, height: 30, background: C.goldBg, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Ic.Sparkle s={15} c={C.blue} />
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, color: C.nearBlack, letterSpacing: "-0.224px" }}>성경적 묵상</div>
          </div>

          <div style={{ lineHeight: 1.8 }}>
            {parsed.map(block => {
              if (block.type === "heading") return (
                <div key={block.key} style={{ fontSize: 14, fontWeight: 600, color: C.nearBlack, marginTop: 20, marginBottom: 8, paddingBottom: 8, borderBottom: `1px solid ${C.border}`, letterSpacing: "-0.224px" }}>
                  {block.text}
                </div>
              );
              if (block.type === "bullet") return (
                <div key={block.key} style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "flex-start" }}>
                  <span style={{ color: C.blue, fontSize: 14, flexShrink: 0, marginTop: 2 }}>›</span>
                  <span style={{ fontSize: 15, color: C.nearBlack, lineHeight: 1.65, letterSpacing: "-0.224px" }}>{block.text}</span>
                </div>
              );
              if (block.type === "spacer") return <div key={block.key} style={{ height: 8 }} />;
              return (
                <p key={block.key} style={{ fontSize: 15, color: C.nearBlack, lineHeight: 1.75, marginBottom: 4, letterSpacing: "-0.224px" }}>
                  {block.text}
                </p>
              );
            })}
          </div>
        </div>

        {/* Usage remaining — logged-in only */}
        {user && usage_remaining !== undefined && usage_remaining !== null && (
          <div style={{ textAlign: "center", fontSize: 13, color: C.body, marginBottom: 20, letterSpacing: "-0.224px" }}>
            이번 달 남은 무료 해석:{" "}
            <strong style={{ color: usage_remaining > 0 ? C.nearBlack : C.error }}>{usage_remaining}회</strong>
            {usage_remaining === 0 && (
              <>
                {" · "}
                <button onClick={() => go("pricing")} style={{ color: C.blue, background: "none", border: "none", cursor: "pointer", fontFamily: F, fontSize: 13, fontWeight: 500, textDecoration: "underline" }}>
                  무제한 플랜 보기
                </button>
              </>
            )}
          </div>
        )}

        {/* Guest nudge */}
        {!user && (
          <div style={{ textAlign: "center", fontSize: 13, color: C.body, marginBottom: 20, letterSpacing: "-0.224px" }}>
            <button onClick={() => go("auth")} style={{ color: C.blue, background: "none", border: "none", cursor: "pointer", fontFamily: F, fontSize: 13, fontWeight: 500, textDecoration: "underline" }}>
              로그인
            </button>
            {" "}하면 이 해석이 기록에 저장됩니다
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: 10 }}>
          <Btn variant="ghost" full onClick={() => go("dream")}>
            <Ic.Moon s={15} c={C.nearBlack} />
            새 꿈 기록하기
          </Btn>
          {user && (
            <Btn variant="primary" full onClick={() => go("history")}>
              <Ic.History s={15} c="#fff" />
              기록 모아보기
            </Btn>
          )}
        </div>

        {/* Disclaimer */}
        <div style={{ marginTop: 24, fontSize: 12, color: "rgba(0,0,0,0.36)", textAlign: "center", lineHeight: 1.47, letterSpacing: "-0.12px" }}>
          이 해석은 예언이 아닌 성경적 묵상 가이드입니다.<br />
          영적 결정은 담임 목사님 또는 신앙 공동체와 함께 하세요.
        </div>
      </div>
    </div>
  );
}
