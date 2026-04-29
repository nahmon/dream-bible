import { useState } from "react";
import { useToast } from "../components/shared.jsx";

const SANS = '"Pretendard Variable",Pretendard,-apple-system,BlinkMacSystemFont,system-ui,sans-serif';
const T = {
  brand: "#6B3F1D", brand2: "#8A5A30", brandRing: "rgba(107,63,29,.18)",
  g50: "#F9FAFB", g100: "#F2F4F6", g200: "#E5E8EB", g400: "#B0B8C1",
  g500: "#8B95A1", g600: "#6B7684", g700: "#4E5968", g900: "#191F28", paper: "#FFFFFF",
};

const CHIPS = [
  { label: "하늘 · 빛", fill: "하늘을 날고 있었는데 구름 사이로 빛줄기가 쏟아져 내렸어요." },
  { label: "물 · 건너감", fill: "넓고 맑은 강을 건너 반대편으로 가는 꿈을 꾸었어요." },
  { label: "들녘 · 평안", fill: "햇살이 가득한 풀밭에서 흰 양 떼가 평화로이 풀을 뜯고 있었어요." },
  { label: "집 · 친숙함", fill: "한 번도 본 적 없는 집인데 모든 방이 집처럼 느껴졌어요." },
  { label: "이름 · 부름", fill: "해질녘 정원에서 누군가 내 이름을 부르는 소리를 들었어요." },
];

const COMMUNITY = [
  {
    avatar: "ㅂ", who: "빛나는밤*", when: "2시간 전",
    dream: "한 번도 본 적 없는 집인데, 모든 방이 집처럼 느껴졌어요.",
    verseRef: "시편 23:6", likes: 24, comments: 3,
    verseText: "제가 어디에 있어도 주님이 준비해두신 쉴 자리가 따로 있다는 말씀이 떠올랐어요.",
  },
  {
    avatar: "ㅇ", who: "오후에기도*", when: "5시간 전",
    dream: "잔잔한 바다 가장자리에 서서 누군가를 기다리고 있었어요.",
    verseRef: "이사야 43:2", likes: 18, comments: 1,
    verseText: "그 기다림이 헛되지 않다는 점, 물을 건너도 함께하시겠다는 약속에서 위로받았어요.",
  },
  {
    avatar: "ㅅ", who: "새벽기도*", when: "어제",
    dream: "하얀 돌계단이 부드러운 빛 속으로 길게 이어져 있었어요.",
    verseRef: "창세기 28:12", likes: 12, comments: 0,
    verseText: "야곱의 사다리 꿈처럼, 지금 걷는 길 위에 높으신 분이 함께 계시다는 신호로 읽었어요.",
  },
];

async function startCheckout() {
  const res = await fetch("/api/create-checkout", { method: "POST" });
  const data = await res.json();
  if (data.url) window.location.href = data.url;
}

function UpgradeModal({ onClose }) {
  const [loading, setLoading] = useState(false);
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(25,31,40,.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 20, padding: "32px 28px", maxWidth: 420, width: "100%", boxShadow: "0 24px 64px rgba(25,31,40,.22)" }}>
        <div style={{ fontSize: 12, letterSpacing: ".04em", color: T.brand, fontWeight: 700, marginBottom: 12 }}>무료 체험 종료</div>
        <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-.02em", margin: "0 0 12px", color: T.g900, fontFamily: SANS }}>
          이번 달 무료 해석을<br />모두 사용했어요
        </h2>
        <p style={{ fontSize: 14, color: T.g600, lineHeight: 1.6, margin: "0 0 24px", fontFamily: SANS }}>
          월 ₩4,900으로 무제한 해석과 성경적 일러스트를 받아보세요.
        </p>
        <div style={{ background: T.g50, border: `1px solid ${T.g200}`, borderRadius: 10, padding: "16px 18px", marginBottom: 20 }}>
          {["무제한 꿈 해석", "AI 성경 일러스트 생성", "꿈 일지 저장"].map((f, i) => (
            <div key={i} style={{ fontSize: 13.5, color: T.g700, marginBottom: i < 2 ? 8 : 0, fontWeight: 500, fontFamily: SANS }}>✓ {f}</div>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 16 }}>
          <span style={{ fontSize: 28, fontWeight: 700, color: T.g900, letterSpacing: "-.03em", fontFamily: SANS }}>₩4,900</span>
          <span style={{ fontSize: 13, color: T.g500, fontFamily: SANS }}>/ 월</span>
        </div>
        <button
          disabled={loading}
          onClick={async () => { setLoading(true); await startCheckout(); setLoading(false); }}
          style={{ width: "100%", background: loading ? T.brand2 : T.brand, color: "#fff", border: 0, borderRadius: 12, padding: "14px 20px", fontFamily: SANS, fontSize: 15.5, fontWeight: 700, letterSpacing: "-.01em", cursor: loading ? "default" : "pointer", marginBottom: 10 }}>
          {loading ? "이동 중…" : "지금 시작하기 →"}
        </button>
        <button onClick={onClose} style={{ width: "100%", background: "transparent", border: "none", fontFamily: SANS, fontSize: 13, color: T.g400, cursor: "pointer", padding: "8px 0" }}>나중에 하기</button>
      </div>
    </div>
  );
}

export default function HomeScreen({ isPaid, uses, freeLimit, canInterpret, onUsed, onResult }) {
  const [dream, setDream] = useState("");
  const [loading, setLoading] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const { showToast } = useToast();

  const remaining = Math.max(0, freeLimit - uses);

  const handleSubmit = async () => {
    if (dream.trim().length < 10) {
      showToast("꿈을 조금 더 자세히 적어 주세요", "error");
      return;
    }
    if (!canInterpret) {
      setShowUpgrade(true);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/interpret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dream_text: dream, skip_image: !isPaid }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "오류가 발생했습니다. 다시 시도해 주세요.", "error");
        return;
      }
      onUsed();
      const entry = { id: Date.now(), date: new Date().toISOString(), dream_text: dream, interpretation: data.interpretation, image_url: data.image_url };
      const prev = JSON.parse(localStorage.getItem("db_journal") || "[]");
      localStorage.setItem("db_journal", JSON.stringify([entry, ...prev]));
      onResult({ interpretation: data.interpretation, dream_text: dream, image_url: data.image_url });
    } catch {
      showToast("네트워크 오류. 연결을 확인해 주세요.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ paddingBottom: 20 }}>
      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}

      {/* Hero */}
      <div style={{ padding: "14px 24px 8px", textAlign: "center" }}>
        <h1 style={{ fontFamily: SANS, fontWeight: 700, fontSize: 28, lineHeight: 1.3, letterSpacing: "-.03em", margin: "0 0 10px", color: T.g900 }}>
          어젯밤 꿈을 적어보세요<br />
          <span style={{ color: T.brand }}>성경 말씀</span>으로 풀어드려요
        </h1>
        <p style={{ fontSize: 15, lineHeight: 1.5, color: T.g600, margin: 0, fontWeight: 500, fontFamily: SANS }}>
          잘 기억나지 않아도 괜찮아요.<br />생각나는 장면만 적어도 돼요.
        </p>
      </div>

      {/* Composer */}
      <div style={{ padding: "8px 20px 6px" }}>
        <div style={{ background: T.paper, border: `1.5px solid ${T.g900}`, borderRadius: 14, padding: "14px 16px 10px", boxShadow: `0 2px 0 ${T.g100}` }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: T.brand }}>오늘의 꿈</span>
            <span style={{ fontSize: 12, color: T.g500, fontWeight: 500 }}>{dream.length}자</span>
          </div>
          <textarea
            value={dream}
            onChange={e => setDream(e.target.value)}
            placeholder="새벽 강가를 걷고 있었는데, 빛나는 새 한 마리가 내 앞에 내려앉았어요…"
            rows={4}
            maxLength={2000}
            style={{ width: "100%", border: 0, background: "transparent", resize: "none", fontFamily: SANS, fontSize: 14.5, lineHeight: 1.55, color: T.g900, outline: "none", minHeight: 70, padding: 0 }}
          />
          <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px dashed ${T.g200}`, display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 11.5, color: T.g500, fontWeight: 500, fontFamily: SANS }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.brand, animation: "pulse 1.6s ease-in-out infinite", display: "inline-block", flexShrink: 0 }} />
              일지에 자동으로 저장하고 있어요
            </span>
            <span>2,000자까지</span>
          </div>
        </div>
      </div>

      {/* Chips */}
      <div style={{ padding: "0 20px 6px" }}>
        <div style={{ fontSize: 11.5, fontWeight: 600, color: T.g500, margin: "4px 4px 8px", fontFamily: SANS }}>
          어디서부터 적을지 막막하면, 이렇게 시작해보세요
        </div>
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, margin: "0 -20px", paddingLeft: 20, paddingRight: 20, scrollbarWidth: "none" }}>
          {CHIPS.map((chip, i) => (
            <button key={i} onClick={() => setDream(chip.fill)} style={{
              flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 6,
              background: "#fff", border: `1px solid ${T.g200}`, borderRadius: 999,
              padding: "7px 12px", fontSize: 12.5, color: T.g700, fontWeight: 500,
              cursor: "pointer", fontFamily: SANS, transition: "border-color .15s",
            }}>
              <span style={{ color: T.brand, fontSize: 14, lineHeight: 1, fontWeight: 600 }}>+</span>
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: "6px 20px 12px" }}>
        <button
          disabled={loading}
          onClick={handleSubmit}
          style={{
            width: "100%", background: loading ? T.brand2 : T.brand, color: "#fff",
            border: 0, borderRadius: 12, padding: "14px 20px", fontFamily: SANS,
            fontSize: 15.5, fontWeight: 700, letterSpacing: "-.01em",
            cursor: loading ? "default" : "pointer",
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
            transition: "background .15s",
          }}>
          {loading ? (
            <>
              <span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite", display: "inline-block" }} />
              말씀을 찾고 있어요…
            </>
          ) : (
            <>
              말씀으로 풀어보기
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width={16} height={16}><path d="M3 8 H13 M9 4 L13 8 L9 12" /></svg>
            </>
          )}
        </button>
        <p style={{ fontSize: 11.5, color: T.g500, textAlign: "center", margin: "8px 4px 0", fontWeight: 500, lineHeight: 1.45, fontFamily: SANS }}>
          {isPaid ? "Pro · 무제한 · 성경 일러스트 포함" : remaining > 0 ? `이번 달 ${remaining}회 무료 · 이미지 제외` : "이번 달 무료 해석을 모두 사용했어요"}
        </p>
      </div>

      {/* Community feed */}
      <div style={{ borderTop: `8px solid ${T.g100}` }}>
        <div style={{ padding: "24px 20px 14px", display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <h3 style={{ fontFamily: SANS, fontWeight: 600, fontSize: 17, margin: 0, color: T.g900, letterSpacing: "-.015em" }}>다른 분들의 해몽</h3>
          <span style={{ fontSize: 12, color: T.g500, fontWeight: 500, fontFamily: SANS }}>오늘 새로 풀린 3편</span>
        </div>
        {COMMUNITY.map((item, i) => (
          <div key={i} style={{ padding: "16px 20px", display: "grid", gridTemplateColumns: "1fr 16px", gap: 10, alignItems: "flex-start", borderBottom: `1px solid ${T.g100}` }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ width: 22, height: 22, borderRadius: "50%", background: T.g200, color: T.g700, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{item.avatar}</span>
                <span style={{ fontSize: 12, color: T.g700, fontWeight: 600, fontFamily: SANS }}>{item.who}</span>
                <span style={{ fontSize: 11.5, color: T.g400, fontWeight: 500, fontFamily: SANS }}>· {item.when}</span>
              </div>
              <p style={{ fontSize: 14, color: T.g900, lineHeight: 1.55, margin: "0 0 10px", fontWeight: 500, fontFamily: SANS }}>{item.dream}</p>
              <div style={{ background: T.g50, borderLeft: `3px solid ${T.brand}`, padding: "10px 12px", borderRadius: 4, marginBottom: 8 }}>
                <div style={{ fontSize: 11, color: T.brand, fontWeight: 700, letterSpacing: ".02em", marginBottom: 3, fontFamily: SANS }}>{item.verseRef}</div>
                <p style={{ fontSize: 12.5, color: T.g700, lineHeight: 1.5, margin: 0, fontFamily: SANS }}>{item.verseText}</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 12, color: T.g500, fontWeight: 500, fontFamily: SANS }}>
                <span>♡ 공감 {item.likes}</span>
                <span>댓글 {item.comments}</span>
              </div>
            </div>
            <span style={{ color: T.g400, fontSize: 16, paddingTop: 2 }}>→</span>
          </div>
        ))}
      </div>
    </div>
  );
}
