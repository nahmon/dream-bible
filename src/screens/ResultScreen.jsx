import { useState } from "react";
import { useToast } from "../components/shared.jsx";

const SANS = '"Pretendard Variable",Pretendard,-apple-system,BlinkMacSystemFont,system-ui,sans-serif';
const T = {
  brand: "#6B3F1D", brand2: "#8A5A30",
  g50: "#F9FAFB", g100: "#F2F4F6", g200: "#E5E8EB",
  g400: "#B0B8C1", g500: "#8B95A1", g600: "#6B7684", g700: "#4E5968", g900: "#191F28",
};

function parseInterpretation(text) {
  if (!text) return [];
  return text.split("\n").map((line, i) => {
    const t = line.trim();
    if (t.startsWith("**") && t.endsWith("**")) return { type: "heading", text: t.slice(2, -2), key: i };
    if (t.startsWith("- ")) return { type: "bullet", text: t.slice(2), key: i };
    if (!t) return { type: "spacer", key: i };
    return { type: "text", text: t, key: i };
  });
}

export default function ResultScreen({ result, onClose }) {
  const { interpretation, dream_text, image_url } = result ?? {};
  const parsed = parseInterpretation(interpretation);
  const [imgLoaded, setImgLoaded] = useState(false);
  const { showToast } = useToast();

  const handleShare = async () => {
    const clean = interpretation?.replace(/\*\*/g, "").replace(/^- /gm, "• ") ?? "";
    const shareText = `드림바이블 — 성경적 꿈 해석\n\n내 꿈: ${dream_text}\n\n${clean}\n\nhttps://dream-bible.vercel.app`;
    if (navigator.share) {
      try { await navigator.share({ title: "드림바이블", text: shareText, url: "https://dream-bible.vercel.app" }); }
      catch (_) {}
    } else {
      await navigator.clipboard.writeText(shareText);
      showToast("클립보드에 복사됐어요", "success");
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(25,31,40,.55)", backdropFilter: "blur(2px)" }} onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          background: "#fff", borderRadius: "20px 20px 0 0",
          maxHeight: "92vh", display: "flex", flexDirection: "column",
          boxShadow: "0 -8px 40px rgba(25,31,40,.18)",
        }}
      >
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

        {/* Handle */}
        <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 4px" }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: T.g200 }} />
        </div>

        {/* Nav bar */}
        <div style={{ display: "grid", gridTemplateColumns: "56px 1fr 56px", alignItems: "center", height: 44, flexShrink: 0 }}>
          <button onClick={onClose} style={{ background: "transparent", border: 0, cursor: "pointer", width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", color: T.g900 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width={24} height={24}>
              <path d="M18 6 L6 18 M6 6 L18 18" />
            </svg>
          </button>
          <div style={{ textAlign: "center", fontFamily: SANS, fontSize: 16, fontWeight: 600, color: T.g900, letterSpacing: "-.01em", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <span style={{ width: 18, height: 18, borderRadius: 4, background: T.brand, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg viewBox="0 0 22 22" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" width={11} height={11}><path d="M11 4 V18 M5 8 H17" /></svg>
            </span>
            <span>말씀 풀이</span>
          </div>
          <button onClick={handleShare} style={{ background: "transparent", border: 0, cursor: "pointer", width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", color: T.g700, marginLeft: "auto" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={20} height={20}>
              <circle cx="18" cy="5" r="2" /><circle cx="6" cy="12" r="2" /><circle cx="18" cy="19" r="2" />
              <line x1="8" y1="10.6" x2="15.9" y2="6.4" /><line x1="8" y1="13.4" x2="15.9" y2="17.6" />
            </svg>
          </button>
        </div>

        {/* Scrollable content */}
        <div style={{ overflowY: "auto", flex: 1, scrollbarWidth: "none", padding: "0 20px 40px" }}>

          {/* Biblical image */}
          {(image_url || true) && (
            <div style={{ marginBottom: 20, borderRadius: 14, overflow: "hidden", aspectRatio: "1/1", position: "relative", background: "#2a221a" }}>
              {!imgLoaded && (
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
                  <span style={{ display: "inline-block", width: 20, height: 20, border: "2px solid rgba(255,255,255,.1)", borderTopColor: "rgba(255,255,255,.4)", borderRadius: "50%", animation: "spin 0.9s linear infinite" }} />
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,.3)", letterSpacing: ".08em", fontFamily: SANS }}>성경 일러스트 생성 중…</span>
                </div>
              )}
              {image_url ? (
                <img
                  src={image_url}
                  alt="성경 꿈 일러스트"
                  onLoad={() => setImgLoaded(true)}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", opacity: imgLoaded ? 1 : 0, transition: "opacity 0.6s ease" }}
                />
              ) : (
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg viewBox="0 0 26 26" fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="1.2" strokeLinecap="round" width={48} height={48}>
                    <circle cx="13" cy="13" r="11" strokeDasharray="2 2.5" />
                    <path d="M13 5 V21 M8 10 H18" />
                  </svg>
                </div>
              )}
            </div>
          )}

          {/* Dream recap */}
          <div style={{ background: T.g50, border: `1px solid ${T.g100}`, borderRadius: 12, padding: "14px 16px", marginBottom: 16 }}>
            <div style={{ fontSize: 10.5, letterSpacing: ".08em", color: T.g500, fontWeight: 700, marginBottom: 6, fontFamily: SANS }}>내 꿈</div>
            <p style={{ fontSize: 14, color: T.g700, lineHeight: 1.6, margin: 0, fontFamily: SANS }}>{dream_text}</p>
          </div>

          {/* Interpretation */}
          <div style={{ background: "#fff", border: `1px solid ${T.g200}`, borderRadius: 14, padding: "20px 20px" }}>
            <div style={{ fontSize: 10.5, letterSpacing: ".08em", color: T.brand, fontWeight: 700, marginBottom: 16, paddingBottom: 12, borderBottom: `1px solid ${T.g100}`, fontFamily: SANS }}>
              말씀 묵상
            </div>
            <div>
              {parsed.map(block => {
                if (block.type === "heading") return (
                  <div key={block.key} style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".08em", color: T.brand, marginTop: 20, marginBottom: 8, paddingBottom: 8, borderBottom: `1px solid ${T.g100}`, fontFamily: SANS }}>
                    {block.text}
                  </div>
                );
                if (block.type === "bullet") return (
                  <div key={block.key} style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start" }}>
                    <span style={{ flexShrink: 0, marginTop: 7, width: 4, height: 4, borderRadius: "50%", background: T.brand, display: "inline-block" }} />
                    <span style={{ fontSize: 14.5, color: T.g700, lineHeight: 1.65, fontFamily: SANS }}>{block.text}</span>
                  </div>
                );
                if (block.type === "spacer") return <div key={block.key} style={{ height: 6 }} />;
                return (
                  <p key={block.key} style={{ fontSize: 14.5, color: T.g700, lineHeight: 1.7, margin: "0 0 8px", fontFamily: SANS }}>
                    {block.text}
                  </p>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button onClick={handleShare} style={{ flex: 1, background: T.brand, color: "#fff", border: 0, borderRadius: 12, padding: "14px 20px", fontFamily: SANS, fontSize: 15, fontWeight: 700, letterSpacing: "-.01em", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={16} height={16}>
                <circle cx="18" cy="5" r="2" /><circle cx="6" cy="12" r="2" /><circle cx="18" cy="19" r="2" />
                <line x1="8" y1="10.6" x2="15.9" y2="6.4" /><line x1="8" y1="13.4" x2="15.9" y2="17.6" />
              </svg>
              친구에게 공유하기
            </button>
            <button onClick={onClose} style={{ background: "transparent", border: `1px solid ${T.g200}`, borderRadius: 12, padding: "14px 16px", fontFamily: SANS, fontSize: 14, fontWeight: 600, color: T.g600, cursor: "pointer" }}>
              닫기
            </button>
          </div>

          <p style={{ textAlign: "center", margin: "14px 0 0", fontSize: 11, color: T.g400, letterSpacing: ".04em", fontFamily: SANS }}>
            예언이 아니에요 · 말씀으로 함께 돌아보는 길잡이예요
          </p>
        </div>
      </div>
    </div>
  );
}
