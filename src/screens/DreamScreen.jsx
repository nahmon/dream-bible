import { useState } from "react";
import { C, F, Ic } from "../lib/constants.jsx";
import { Btn, useToast } from "../components/shared.jsx";

const EXAMPLES = [
  "하늘을 날고 있었는데 구름 사이로 빛이 비쳤어요",
  "맑은 강물을 건너가는 꿈을 꿨습니다",
  "흰 양 떼가 초원에서 노는 꿈이었어요",
];

const NAV_STYLE = {
  position: "sticky", top: 0, zIndex: 100,
  height: 48,
  background: "rgba(0,0,0,0.8)",
  backdropFilter: "saturate(180%) blur(20px)",
  WebkitBackdropFilter: "saturate(180%) blur(20px)",
  display: "flex", alignItems: "center", justifyContent: "space-between",
  padding: "0 24px",
};

export default function DreamScreen({ go }) {
  const [dream, setDream] = useState("");
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async () => {
    if (dream.trim().length < 10) {
      showToast("꿈 내용을 10자 이상 입력해 주세요", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/interpret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dream_text: dream }),
      });
      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || "오류가 발생했습니다", "error");
        return;
      }

      go("result", { interpretation: data.interpretation, dream_text: dream, image_url: data.image_url });
    } catch (err) {
      showToast("네트워크 오류가 발생했습니다", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: C.white, fontFamily: F }}>
      {/* Glass Nav */}
      <nav style={NAV_STYLE}>
        <button onClick={() => go("landing")} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
          <Ic.Cross s={14} c="rgba(255,255,255,0.85)" />
          <span style={{ fontSize: 14, fontWeight: 600, color: "#fff", letterSpacing: "-0.2px" }}>꿈묵상</span>
        </button>
      </nav>

      {/* Brand Hero */}
      <div style={{
        background: "linear-gradient(180deg, #000000 0%, #0a0a14 100%)",
        padding: "36px 24px 32px", textAlign: "center", position: "relative", overflow: "hidden",
      }}>
        {/* Radial glow */}
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 80% at 50% 60%, rgba(0,113,227,0.18) 0%, transparent 70%)", pointerEvents: "none" }} />

        {/* SVG illustration */}
        <div style={{ position: "relative", display: "inline-block", marginBottom: 16 }}>
          <svg width="96" height="96" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Outer glow ring */}
            <circle cx="48" cy="52" r="34" fill="rgba(0,113,227,0.08)" />
            <circle cx="48" cy="52" r="24" fill="rgba(0,113,227,0.10)" />
            {/* Stars */}
            <circle cx="14" cy="18" r="1.4" fill="rgba(255,255,255,0.55)" />
            <circle cx="78" cy="14" r="1.0" fill="rgba(255,255,255,0.40)" />
            <circle cx="82" cy="36" r="1.6" fill="rgba(255,255,255,0.50)" />
            <circle cx="8"  cy="50" r="1.0" fill="rgba(255,255,255,0.35)" />
            <circle cx="88" cy="58" r="1.2" fill="rgba(255,255,255,0.45)" />
            <circle cx="20" cy="76" r="1.0" fill="rgba(255,255,255,0.30)" />
            <circle cx="74" cy="80" r="1.4" fill="rgba(255,255,255,0.35)" />
            {/* Sparkle top-right */}
            <path d="M72 22 L73.2 25 L76 22 L73.2 19 Z" fill="rgba(255,255,255,0.6)" />
            {/* Cross */}
            <line x1="48" y1="18" x2="48" y2="76" stroke="rgba(255,255,255,0.90)" strokeWidth="3.5" strokeLinecap="round"/>
            <line x1="24" y1="38" x2="72" y2="38" stroke="rgba(255,255,255,0.90)" strokeWidth="3.5" strokeLinecap="round"/>
            {/* Cross glow */}
            <line x1="48" y1="18" x2="48" y2="76" stroke="rgba(0,113,227,0.5)" strokeWidth="8" strokeLinecap="round"/>
            <line x1="24" y1="38" x2="72" y2="38" stroke="rgba(0,113,227,0.5)" strokeWidth="8" strokeLinecap="round"/>
            {/* Moon */}
            <path d="M62 60 A12 12 0 1 1 62 72 A8 8 0 1 0 62 60 Z" fill="rgba(255,255,255,0.20)" />
          </svg>
        </div>

        <div style={{ position: "relative" }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#fff", letterSpacing: "-0.28px", marginBottom: 6 }}>꿈묵상</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", letterSpacing: "-0.12px", lineHeight: 1.5 }}>
            성경 말씀으로 꿈을 돌아보는 공간
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 560, margin: "0 auto", padding: "36px 24px 60px" }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, color: C.nearBlack, marginBottom: 8, letterSpacing: "-0.28px", lineHeight: 1.14 }}>
          오늘 꿈을 기록해 보세요
        </h1>
        <p style={{ fontSize: 15, color: C.body, marginBottom: 28, lineHeight: 1.47, letterSpacing: "-0.374px" }}>
          구체적으로 기억나는 장면, 인물, 감정을 자유롭게 적어주세요
        </p>

        {/* Textarea */}
        <div style={{ marginBottom: 20 }}>
          <textarea
            value={dream}
            onChange={e => setDream(e.target.value)}
            placeholder="예: 맑은 강가를 걷고 있는데 빛나는 새 한 마리가 내 앞에 날아와 앉았습니다..."
            rows={7}
            style={{
              width: "100%", padding: "14px 16px", borderRadius: 8,
              border: `1px solid ${dream.length > 0 ? C.blue : C.border}`,
              fontSize: 16, fontFamily: F, color: C.nearBlack,
              resize: "vertical", outline: "none", background: C.white,
              lineHeight: 1.65, boxSizing: "border-box",
              transition: "border-color 0.15s", letterSpacing: "-0.224px",
            }}
            onFocus={e => { e.target.style.border = `1.5px solid ${C.blue}`; e.target.style.outline = `3px solid rgba(0,113,227,0.12)`; }}
            onBlur={e => { e.target.style.border = `1px solid ${dream.length > 0 ? C.blue : C.border}`; e.target.style.outline = "none"; }}
          />
          <div style={{ fontSize: 12, color: C.body, marginTop: 4, textAlign: "right", letterSpacing: "-0.12px" }}>{dream.length}자</div>
        </div>

        {/* Example prompts */}
        {!dream && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 13, color: C.body, marginBottom: 10, letterSpacing: "-0.224px" }}>예시로 시작해 보세요</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {EXAMPLES.map((ex, i) => (
                <button key={i} onClick={() => setDream(ex)}
                  style={{ textAlign: "left", background: C.gray, border: "none", borderRadius: 8, padding: "10px 14px", fontSize: 14, color: C.nearBlack, fontFamily: F, cursor: "pointer", lineHeight: 1.47, letterSpacing: "-0.224px", transition: "background 0.12s" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "#e5e5ea"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = C.gray; }}
                >
                  "{ex}"
                </button>
              ))}
            </div>
          </div>
        )}

        <Btn variant="gold" size="lg" full disabled={loading || dream.trim().length < 10} onClick={handleSubmit}>
          {loading ? (
            <>
              <span style={{ display: "inline-block", width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              성경으로 묵상 중...
            </>
          ) : (
            <>
              <Ic.Sparkle s={16} c="#fff" />
              꿈 해석 받기
            </>
          )}
        </Btn>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

        <div style={{ marginTop: 20, fontSize: 12, color: "rgba(0,0,0,0.36)", lineHeight: 1.47, letterSpacing: "-0.12px", textAlign: "center" }}>
          이 서비스는 예언이나 점술이 아닌 성경적 묵상 가이드입니다.
        </div>
      </div>
    </div>
  );
}
