import { useState } from "react";
import { C, F, Ic } from "../lib/constants.jsx";
import { Btn, useToast } from "../components/shared.jsx";
import { supabase } from "../supabase.js";

const EXAMPLES = [
  "하늘을 날고 있었는데 구름 사이로 빛이 비쳤어요",
  "맑은 강물을 건너가는 꿈을 꿨습니다",
  "흰 양 떼가 초원에서 노는 꿈이었어요",
];

export default function DreamScreen({ go, usageRemaining }) {
  const [dream, setDream] = useState("");
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const remaining = usageRemaining ?? 3;

  const handleSubmit = async () => {
    if (dream.trim().length < 10) {
      showToast("꿈 내용을 10자 이상 입력해 주세요", "error");
      return;
    }
    if (remaining <= 0) {
      go("pricing");
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        showToast("로그인이 필요합니다", "error");
        go("auth");
        return;
      }

      const res = await fetch("/api/interpret", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
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
    <div style={{ minHeight: "100vh", background: C.cream, fontFamily: F }}>
      {/* Nav */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", background: C.white, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Ic.Star s={18} c={C.gold} />
          <span style={{ fontSize: 16, fontWeight: 700, color: C.navy }}>꿈묵상</span>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 13, color: C.body }}>
            이번 달 남은 횟수: <strong style={{ color: remaining > 0 ? C.gold : C.error }}>{remaining}회</strong>
          </span>
          <Btn size="sm" variant="ghost" onClick={() => go("history")}>기록 보기</Btn>
        </div>
      </nav>

      <div style={{ maxWidth: 560, margin: "0 auto", padding: "40px 24px" }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: C.navy, marginBottom: 8, letterSpacing: "-0.5px" }}>
          오늘 꿈을 기록해 보세요
        </h1>
        <p style={{ fontSize: 15, color: C.body, marginBottom: 28 }}>
          구체적으로 기억나는 장면, 인물, 감정을 자유롭게 적어주세요
        </p>

        {/* Textarea */}
        <div style={{ marginBottom: 20 }}>
          <textarea
            value={dream}
            onChange={e => setDream(e.target.value)}
            placeholder="예: 맑은 강가를 걷고 있는데 빛나는 새 한 마리가 내 앞에 날아와 앉았습니다..."
            rows={7}
            style={{ width: "100%", padding: "14px 16px", borderRadius: 12, border: `1px solid ${dream.length > 0 ? C.gold : C.border}`, fontSize: 16, fontFamily: F, color: C.navy, resize: "vertical", outline: "none", background: C.white, lineHeight: 1.65, boxSizing: "border-box", transition: "border-color 0.15s" }}
            onFocus={e => { e.target.style.border = `1.5px solid ${C.gold}`; }}
            onBlur={e => { e.target.style.border = `1px solid ${dream.length > 0 ? C.gold : C.border}`; }}
          />
          <div style={{ fontSize: 12, color: C.body, marginTop: 4, textAlign: "right" }}>{dream.length}자</div>
        </div>

        {/* Example prompts */}
        {!dream && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 13, color: C.body, marginBottom: 10 }}>예시로 시작해 보세요</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {EXAMPLES.map((ex, i) => (
                <button key={i} onClick={() => setDream(ex)}
                  style={{ textAlign: "left", background: C.white, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", fontSize: 14, color: C.navy, fontFamily: F, cursor: "pointer", lineHeight: 1.4, transition: "border-color 0.15s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = C.gold; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; }}
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
              <Ic.Sparkle s={18} c="#fff" />
              꿈 해석 받기
            </>
          )}
        </Btn>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

        {remaining <= 0 && (
          <div style={{ marginTop: 16, padding: "12px 16px", background: C.errorBg, border: `1px solid rgba(217,48,37,0.2)`, borderRadius: 8, fontSize: 14, color: C.error, textAlign: "center" }}>
            이번 달 무료 해석 횟수를 모두 사용했습니다.{" "}
            <button onClick={() => go("pricing")} style={{ color: C.gold, background: "none", border: "none", cursor: "pointer", fontFamily: F, fontSize: 14, fontWeight: 600, textDecoration: "underline" }}>
              무제한 플랜 보기
            </button>
          </div>
        )}

        {/* Disclaimer */}
        <div style={{ marginTop: 24, padding: "12px 16px", background: C.goldBg, borderRadius: 8, fontSize: 13, color: C.body, lineHeight: 1.5 }}>
          이 서비스는 예언이나 점술이 아닌 성경적 묵상 가이드입니다. 해석은 영적 참고 자료로만 활용하세요.
        </div>
      </div>
    </div>
  );
}
