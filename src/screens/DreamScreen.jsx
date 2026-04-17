import { useState } from "react";
import { C, F, Ic } from "../lib/constants.jsx";
import { Btn, useToast } from "../components/shared.jsx";
import { supabase } from "../supabase.js";

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

export default function DreamScreen({ go, user, usageRemaining }) {
  const [dream, setDream] = useState("");
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const remaining = usageRemaining ?? 3;

  const handleSubmit = async () => {
    if (dream.trim().length < 10) {
      showToast("꿈 내용을 10자 이상 입력해 주세요", "error");
      return;
    }
    if (user && remaining <= 0) {
      go("pricing");
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("/api/interpret", {
        method: "POST",
        headers,
        body: JSON.stringify({ dream_text: dream }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.code === "LIMIT_REACHED") {
          showToast("이번 달 무료 해석을 모두 사용했습니다", "warning");
          go("pricing");
          return;
        }
        showToast(data.error || "오류가 발생했습니다", "error");
        return;
      }

      go("result", { interpretation: data.interpretation, dream_text: dream, dream_id: data.dream_id, usage_remaining: data.usage_remaining });
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
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {user && (
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", letterSpacing: "-0.12px" }}>
              남은 횟수 <strong style={{ color: remaining > 0 ? "rgba(255,255,255,0.85)" : "#ff6b6b" }}>{remaining}회</strong>
            </span>
          )}
          {user
            ? <Btn size="sm" variant="ghostDark" onClick={() => go("history")}>기록 보기</Btn>
            : <Btn size="sm" variant="ghostDark" onClick={() => go("auth")}>로그인</Btn>
          }
        </div>
      </nav>

      <div style={{ maxWidth: 560, margin: "0 auto", padding: "44px 24px 60px" }}>
        <h1 style={{ fontSize: 28, fontWeight: 600, color: C.nearBlack, marginBottom: 8, letterSpacing: "-0.28px", lineHeight: 1.14 }}>
          오늘 꿈을 기록해 보세요
        </h1>
        <p style={{ fontSize: 17, color: C.body, marginBottom: 28, lineHeight: 1.47, letterSpacing: "-0.374px" }}>
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

        {user && remaining <= 0 && (
          <div style={{ marginTop: 16, padding: "12px 16px", background: C.errorBg, borderRadius: 8, fontSize: 14, color: C.error, textAlign: "center", letterSpacing: "-0.224px" }}>
            이번 달 무료 해석 횟수를 모두 사용했습니다.{" "}
            <button onClick={() => go("pricing")} style={{ color: C.blue, background: "none", border: "none", cursor: "pointer", fontFamily: F, fontSize: 14, fontWeight: 600, textDecoration: "underline" }}>
              무제한 플랜 보기
            </button>
          </div>
        )}

        {/* Login nudge for guests */}
        {!user && (
          <div style={{ marginTop: 16, padding: "12px 16px", background: C.goldBg, borderRadius: 8, fontSize: 13, color: C.body, textAlign: "center", letterSpacing: "-0.224px" }}>
            <button onClick={() => go("auth")} style={{ color: C.blue, background: "none", border: "none", cursor: "pointer", fontFamily: F, fontSize: 13, fontWeight: 500, textDecoration: "underline" }}>
              로그인
            </button>
            {" "}하면 꿈 기록이 저장됩니다
          </div>
        )}

        {/* Disclaimer */}
        <div style={{ marginTop: 20, fontSize: 12, color: "rgba(0,0,0,0.36)", lineHeight: 1.47, letterSpacing: "-0.12px", textAlign: "center" }}>
          이 서비스는 예언이나 점술이 아닌 성경적 묵상 가이드입니다.
        </div>
      </div>
    </div>
  );
}
