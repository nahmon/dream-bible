import { useState } from "react";
import { useToast } from "../components/shared.jsx";

const T = {
  ink: "#1a1814", inkSoft: "#3a342c", inkMute: "#7a7266", inkFaint: "#b8ad9d",
  paper: "#f5f0e6", paper2: "#efe8da", rule: "#d9cfba", ruleSoft: "#e8dfcc",
  accent: "#5b3a1f", card: "#fbf7ee", cta: "#c8502b", ctaHover: "#a73f1e",
};
const SANS = '"Pretendard Variable",Pretendard,-apple-system,BlinkMacSystemFont,system-ui,sans-serif';

const SUGGESTIONS = {
  en: [
    "I was flying through the sky when rays of light broke through the clouds.",
    "I dreamed I was crossing a wide, crystal-clear river toward the other side.",
  ],
  ko: [
    "하늘을 날고 있었는데 구름 사이로 빛줄기가 쏟아져 내렸습니다.",
    "넓고 맑은 강을 건너 반대편으로 가는 꿈을 꾸었습니다.",
  ],
};

const JOURNAL = [
  { mon: "Apr", day: "17", title: "A house I'd never seen, but every room felt like home.", verse: "Psalm 23 · shelter" },
  { mon: "Apr", day: "12", title: "Standing at the edge of a calm sea, waiting for someone.", verse: "Isaiah 43 · waters" },
  { mon: "Apr", day: "09", title: "A long stair of white stone, climbing into soft light.", verse: "Genesis 28 · ascent" },
  { mon: "Apr", day: "03", title: "A garden at dusk, the same voice calling me by name.", verse: "John 10 · name" },
  { mon: "Mar", day: "28", title: "Holding a small lamp while walking a dark, unfamiliar road.", verse: "Psalm 119 · lamp" },
];

async function startCheckout() {
  const res = await fetch("https://dream-bible.vercel.app/api/create-checkout", { method: "POST" });
  const data = await res.json();
  if (data.url) window.location.href = data.url;
}

function UpgradeModal({ uses, freeLimit, lang, onClose }) {
  const [loading, setLoading] = useState(false);
  const ko = lang === "ko";
  const remaining = Math.max(0, freeLimit - uses);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100,
      background: "rgba(26,24,20,0.6)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: T.paper, border: `1px solid ${T.rule}`, borderRadius: 12,
        padding: "36px 32px", maxWidth: 420, width: "100%",
        boxShadow: "0 24px 64px rgba(26,24,20,0.22)",
      }}>
        {/* Header */}
        <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: T.cta, fontWeight: 700, marginBottom: 16 }}>
          {ko ? "무료 체험 종료" : "Free limit reached"}
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", margin: "0 0 12px", color: T.ink }}>
          {ko ? "이번 달 무료 해석을 모두 사용했습니다" : `You've used all ${freeLimit} free interpretations this month`}
        </h2>
        <p style={{ fontSize: 14, color: T.inkMute, lineHeight: 1.6, margin: "0 0 28px" }}>
          {ko
            ? "월 ₩4,900으로 무제한 해석과 성경적 일러스트를 받아보세요."
            : "Unlock unlimited interpretations and biblical artwork for ₩4,900/month."}
        </p>

        {/* Feature list */}
        <div style={{ background: T.card, border: `1px solid ${T.ruleSoft}`, borderRadius: 8, padding: "16px 18px", marginBottom: 24 }}>
          {[
            ko ? "✓  무제한 꿈 해석" : "✓  Unlimited dream interpretations",
            ko ? "✓  AI 성경 일러스트 생성" : "✓  AI-generated biblical artwork",
            ko ? "✓  꿈 일지 저장" : "✓  Dream journal history",
          ].map((f, i) => (
            <div key={i} style={{ fontSize: 13.5, color: T.inkSoft, marginBottom: i < 2 ? 8 : 0, fontWeight: 500 }}>{f}</div>
          ))}
        </div>

        {/* Price */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 20 }}>
          <span style={{ fontSize: 28, fontWeight: 700, color: T.ink, letterSpacing: "-0.03em" }}>₩4,900</span>
          <span style={{ fontSize: 13, color: T.inkMute }}>{ko ? "/ 월" : "/ month"}</span>
        </div>

        <button
          disabled={loading}
          onClick={async () => { setLoading(true); await startCheckout(); setLoading(false); }}
          style={{
            width: "100%", background: loading ? "#c8a090" : T.cta,
            color: "#fff", border: 0, borderRadius: 8, padding: "15px 20px",
            fontFamily: SANS, fontSize: 15, fontWeight: 700, letterSpacing: "-0.01em",
            cursor: loading ? "default" : "pointer",
            boxShadow: "0 2px 0 rgba(100,30,10,.2), 0 6px 18px rgba(200,80,43,.18)",
            marginBottom: 10,
          }}>
          {loading ? (ko ? "이동 중…" : "Redirecting…") : (ko ? "지금 시작하기 →" : "Start for ₩4,900/month →")}
        </button>
        <button onClick={onClose} style={{
          width: "100%", background: "transparent", border: "none",
          fontFamily: SANS, fontSize: 13, color: T.inkFaint, cursor: "pointer", padding: "8px 0",
        }}>
          {ko ? "나중에 하기" : "Maybe later"}
        </button>
      </div>
    </div>
  );
}

export default function DreamScreen({ go, isPaid, uses, freeLimit, canInterpret, onUsed }) {
  const [dream, setDream] = useState("");
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState("ko");
  const [hoveredSugg, setHoveredSugg] = useState(null);
  const [ctaHovered, setCtaHovered] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const { showToast } = useToast();

  const ko = lang === "ko";
  const suggestions = SUGGESTIONS[lang];
  const remaining = Math.max(0, freeLimit - uses);
  const canSubmit = !loading && dream.trim().length >= 10;

  const handleSubmit = async () => {
    if (dream.trim().length < 10) {
      showToast(ko ? "꿈을 조금 더 자세히 적어 주세요" : "Please describe your dream in a bit more detail", "error");
      return;
    }
    if (!canInterpret) {
      setShowUpgrade(true);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("https://dream-bible.vercel.app/api/interpret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dream_text: dream, skip_image: !isPaid }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || (ko ? "오류가 발생했습니다. 다시 시도해 주세요." : "Something went wrong. Please try again."), "error");
        return;
      }
      onUsed();
      go("result", { interpretation: data.interpretation, dream_text: dream, image_url: data.image_url, isPaid });
    } catch {
      showToast(ko ? "네트워크 오류. 연결을 확인해 주세요." : "Network error. Please check your connection.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: T.paper, minHeight: "100vh", fontFamily: SANS, color: T.ink, fontSize: 15, lineHeight: 1.6, WebkitFontSmoothing: "antialiased" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .edb-grid { display: grid; grid-template-columns: 1fr 320px; max-width: 1200px; margin: 0 auto; min-height: calc(100vh - 65px); }
        @media (max-width: 900px) {
          .edb-grid { grid-template-columns: 1fr; }
          .edb-main { border-right: 0 !important; border-bottom: 1px solid ${T.ruleSoft}; padding: 40px 24px 72px !important; }
          .edb-aside { padding: 40px 24px !important; }
        }
      `}</style>

      {showUpgrade && (
        <UpgradeModal uses={uses} freeLimit={freeLimit} lang={lang} onClose={() => setShowUpgrade(false)} />
      )}

      {/* Topbar */}
      <header style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 32px", height: 65,
        borderBottom: `1px solid ${T.ruleSoft}`,
        background: T.paper, position: "sticky", top: 0, zIndex: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 24, height: 24 }}>
            <svg viewBox="0 0 26 26" fill="none" stroke={T.accent} strokeWidth="1.4" strokeLinecap="round" style={{ width: "100%", height: "100%" }}>
              <circle cx="13" cy="13" r="11" strokeDasharray="2 2.5" opacity=".4" />
              <path d="M13 5 V21 M8 10 H18" />
            </svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: "-0.02em" }}>Dream Bible</span>
          <span style={{ fontSize: 12, color: T.inkFaint, paddingLeft: 10, borderLeft: `1px solid ${T.rule}`, marginLeft: 4 }}>
            {ko ? "고요한 동반자" : "A reflective companion"}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Usage badge */}
          {!isPaid && (
            <button onClick={() => setShowUpgrade(true)} style={{
              background: remaining === 0 ? T.cta : T.card,
              border: `1px solid ${remaining === 0 ? T.cta : T.rule}`,
              borderRadius: 6, padding: "5px 12px",
              fontFamily: SANS, fontSize: 12, fontWeight: 600,
              color: remaining === 0 ? "#fff" : T.inkMute, cursor: "pointer",
            }}>
              {remaining === 0
                ? (ko ? "업그레이드" : "Upgrade")
                : (ko ? `무료 ${remaining}회 남음` : `${remaining} free left`)}
            </button>
          )}
          {isPaid && (
            <span style={{ fontSize: 12, fontWeight: 600, color: T.accent, background: T.card, border: `1px solid ${T.rule}`, borderRadius: 6, padding: "5px 12px" }}>
              {ko ? "Pro" : "Pro ✓"}
            </span>
          )}
          {/* Lang toggle */}
          <div style={{ display: "inline-flex", border: `1px solid ${T.rule}`, borderRadius: 6, overflow: "hidden" }}>
            {["en", "ko"].map(l => (
              <button key={l} onClick={() => setLang(l)} style={{
                background: lang === l ? T.ink : "transparent",
                color: lang === l ? T.paper : T.inkMute,
                border: 0, padding: "5px 11px", cursor: "pointer",
                fontFamily: SANS, fontWeight: 600, fontSize: 11, letterSpacing: "0.06em",
              }}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Grid */}
      <div className="edb-grid">
        <section className="edb-main" style={{ padding: "52px 64px 100px", borderRight: `1px solid ${T.ruleSoft}` }}>
          <div style={{ maxWidth: 600, margin: "0 auto" }}>

            {/* Label chip */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: T.paper2, border: `1px solid ${T.rule}`,
              borderRadius: 4, padding: "4px 12px", marginBottom: 28,
              fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase",
              color: T.inkMute, fontWeight: 600,
            }}>
              <svg viewBox="0 0 14 14" fill={T.cta} width={9} height={9}>
                <path d="M7 0 L8.2 5.8 L14 7 L8.2 8.2 L7 14 L5.8 8.2 L0 7 L5.8 5.8 Z" />
              </svg>
              {ko ? "성경적 꿈 해석" : "Biblical Dream Interpretation"}
            </div>

            <h1 style={{ fontWeight: 700, fontSize: "clamp(32px, 5vw, 48px)", lineHeight: 1.1, letterSpacing: "-0.03em", margin: "0 0 16px", color: T.ink }}>
              {ko ? <>어젯밤 꿈,<br />성경으로 읽어 보기</> : <>Last night's dream,<br />read through Scripture.</>}
            </h1>
            <p style={{ fontSize: 15, lineHeight: 1.65, color: T.inkMute, margin: "0 0 36px", maxWidth: 480 }}>
              {ko
                ? "간밤에 본 것을 적어 보세요. 조각이어도 괜찮습니다. 말씀으로 함께 읽어 드립니다."
                : "Write what the night showed you — even fragments. We'll read it through Scripture together."}
            </p>

            {/* Input box */}
            <div style={{
              background: "#fff", border: `2px solid ${T.ink}`, borderRadius: 10,
              padding: "20px 22px 16px", position: "relative",
              boxShadow: `0 3px 0 ${T.ink}, 0 10px 32px rgba(40,25,10,0.08)`,
              marginBottom: 20,
            }}>
              <span style={{
                position: "absolute", top: -10, left: 16,
                background: T.ink, padding: "2px 10px",
                fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase",
                color: T.paper, fontWeight: 700, borderRadius: 3,
              }}>
                {ko ? "당신의 꿈" : "Your dream"}
              </span>
              <textarea
                value={dream}
                onChange={e => setDream(e.target.value)}
                placeholder={ko
                  ? "새벽의 강가를 걷고 있는데 빛나는 새 한 마리가 내 앞에 내려앉았습니다…"
                  : "I was walking along a riverbank at dawn when a glowing bird landed right in front of me…"}
                rows={6}
                style={{
                  width: "100%", border: 0, background: "transparent", resize: "vertical",
                  fontFamily: SANS, fontSize: 16, lineHeight: 1.65, color: T.ink,
                  outline: "none", minHeight: 160, padding: 0,
                }}
              />
              {!dream && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px dashed ${T.rule}` }}>
                  <div style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: T.inkFaint, fontWeight: 600, marginBottom: 8 }}>
                    {ko ? "예시로 시작하기" : "Try an example"}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    {suggestions.map((s, i) => (
                      <button key={i} type="button"
                        onClick={() => setDream(s)}
                        onMouseEnter={() => setHoveredSugg(i)}
                        onMouseLeave={() => setHoveredSugg(null)}
                        style={{
                          display: "flex", alignItems: "center", gap: 8, textAlign: "left", width: "100%",
                          background: hoveredSugg === i ? T.paper2 : "transparent",
                          border: `1px solid ${hoveredSugg === i ? T.rule : "transparent"}`,
                          borderRadius: 6, padding: "7px 10px",
                          fontFamily: SANS, fontSize: 13, color: T.inkSoft,
                          lineHeight: 1.45, cursor: "pointer", transition: "all 0.12s",
                        }}>
                        <span style={{ color: T.cta, fontWeight: 700, flexShrink: 0 }}>+</span>
                        <span>{s}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                marginTop: 12, paddingTop: 10, borderTop: `1px dashed ${T.rule}`,
                fontSize: 11, color: T.inkFaint, fontWeight: 500,
              }}>
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ display: "inline-block", width: 5, height: 5, borderRadius: "50%", background: T.cta }} />
                  {isPaid ? (ko ? "Pro · 무제한" : "Pro · Unlimited") : (ko ? `무료 ${remaining}회 남음` : `${remaining} free left this month`)}
                </span>
                <span style={{ color: dream.length > 1800 ? T.cta : T.inkFaint }}>{dream.length} / 2000</span>
              </div>
            </div>

            {/* CTA */}
            <button
              disabled={!canSubmit}
              onClick={handleSubmit}
              onMouseEnter={() => setCtaHovered(true)}
              onMouseLeave={() => setCtaHovered(false)}
              style={{
                width: "100%",
                background: !canSubmit ? "#c8a090" : ctaHovered ? T.ctaHover : T.cta,
                color: "#fff", border: 0, borderRadius: 8, padding: "16px 24px",
                fontFamily: SANS, fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em",
                cursor: canSubmit ? "pointer" : "default",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                boxShadow: canSubmit ? "0 2px 0 rgba(100,30,10,.2), 0 8px 20px rgba(200,80,43,.15)" : "none",
                transform: ctaHovered && canSubmit ? "translateY(-1px)" : "none",
                transition: "background 0.15s, transform 0.1s",
              }}>
              {loading ? (
                <>
                  <span style={{ display: "inline-block", width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                  {ko ? "말씀을 찾는 중…" : "Searching Scripture…"}
                </>
              ) : !canInterpret ? (
                <>{ko ? "업그레이드하고 계속하기 →" : "Upgrade to continue →"}</>
              ) : (
                <>
                  <svg viewBox="0 0 14 14" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" width={14} height={14}>
                    <path d="M2 7 H12 M7 2 L12 7 L7 12" />
                  </svg>
                  {ko ? "말씀으로 읽어 보기" : "Read it through Scripture"}
                </>
              )}
            </button>

            {!isPaid && (
              <p style={{ textAlign: "center", margin: "10px 0 0", color: T.inkFaint, fontSize: 12 }}>
                {remaining > 0
                  ? (ko ? `이번 달 ${remaining}회 무료 · 이미지 제외` : `${remaining} free this month · no artwork`)
                  : (ko ? "이번 달 무료 해석을 모두 사용했습니다" : "Free limit reached for this month")}
              </p>
            )}

            {/* Scripture callout */}
            <div style={{
              marginTop: 36, padding: "14px 18px",
              background: T.card, border: `1px solid ${T.ruleSoft}`, borderRadius: 8,
              display: "flex", gap: 12, alignItems: "flex-start",
            }}>
              <div style={{ flexShrink: 0, width: 28, height: 28, border: `1px solid ${T.rule}`, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg viewBox="0 0 26 26" fill="none" stroke={T.accent} strokeWidth="1.4" strokeLinecap="round" width={14} height={14}>
                  <path d="M13 5 V21 M8 10 H18" />
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 13.5, color: T.inkSoft, lineHeight: 1.6, marginBottom: 4 }}>
                  {ko ? '"그 후에 내가 내 영을 만민에게 부어 주리니 너희 늙은이는 꿈을 꾸며"' : '"Your old men will dream dreams, your young men will see visions."'}
                </div>
                <div style={{ fontSize: 10.5, letterSpacing: "0.1em", textTransform: "uppercase", color: T.inkFaint, fontWeight: 600 }}>
                  {ko ? "요엘 2:28 · 개역개정" : "Joel 2:28 · NIV"}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Aside */}
        <aside className="edb-aside" style={{ padding: "52px 28px 80px 32px", background: `linear-gradient(180deg, ${T.paper} 0%, ${T.paper2} 100%)` }}>
          <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: T.inkFaint, fontWeight: 600, marginBottom: 24 }}>
            {ko ? "꿈 일지" : "Dream Journal"}
          </div>
          <h3 style={{ fontWeight: 700, fontSize: 20, lineHeight: 1.2, margin: "0 0 8px", letterSpacing: "-0.02em" }}>
            {ko ? "당신의 밤들" : "Your nights,"}<br />
            <span style={{ color: T.accent }}>{ko ? "여기 모입니다." : "collected."}</span>
          </h3>
          <p style={{ color: T.inkMute, margin: "0 0 28px", fontSize: 13, lineHeight: 1.6 }}>
            {ko ? "이곳에 쓰여진 꿈들은 당신이 돌아올 때를 기다립니다." : "Every dream you write here is kept for you to return to."}
          </p>
          <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px", borderTop: `1px solid ${T.rule}` }}>
            {JOURNAL.map((e, i) => (
              <li key={i} style={{ borderBottom: `1px solid ${T.ruleSoft}`, padding: "14px 0", display: "grid", gridTemplateColumns: "44px 1fr", gap: 12 }}>
                <span style={{ fontSize: 10, letterSpacing: "0.06em", color: T.inkFaint, textTransform: "uppercase", paddingTop: 2, fontWeight: 700, lineHeight: 1.4 }}>
                  {e.mon}<br />{e.day}
                </span>
                <div>
                  <div style={{ fontSize: 13, color: T.ink, lineHeight: 1.5, marginBottom: 3 }}>{e.title}</div>
                  <div style={{ fontSize: 10, letterSpacing: "0.1em", color: T.inkFaint, textTransform: "uppercase", fontWeight: 600 }}>{e.verse}</div>
                </div>
              </li>
            ))}
          </ul>
          <div style={{ background: T.card, border: `1px solid ${T.rule}`, borderRadius: 6, padding: "16px 18px", position: "relative" }}>
            <div style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: T.inkFaint, fontWeight: 600, marginBottom: 10, paddingBottom: 8, borderBottom: `1px solid ${T.ruleSoft}` }}>
              {ko ? "밤의 말씀" : "Reading of the night"}
            </div>
            <p style={{ margin: "0 0 10px", fontSize: 14, lineHeight: 1.6, color: T.inkSoft }}>
              {ko ? '"내 속에 생각이 많을 때에 주의 위안이 내 영혼을 즐겁게 하시나이다."' : '"In the multitude of my anxieties within me, Your comforts delight my soul."'}
            </p>
            <div style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: T.accent, fontWeight: 700 }}>
              {ko ? "시편 94:19" : "Psalm 94:19"}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
