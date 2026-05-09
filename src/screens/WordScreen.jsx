import { L } from "../lang/index.js";

const SANS = '"Pretendard Variable",Pretendard,-apple-system,BlinkMacSystemFont,system-ui,sans-serif';
const T = {
  brand: "#1B3A6B",
  g100: "#F2F4F6", g200: "#E5E8EB", g500: "#8B95A1", g900: "#191F28",
};

const w = L.home.word;

async function shareVerse(v) {
  const shareUrl = L.home.result.shareUrl;
  const text = `${v.quote}\n— ${v.cite}\n\n${w.shareFooter(shareUrl)}`;
  if (navigator.share) {
    try { await navigator.share({ title: w.shareTitle, text, url: shareUrl }); }
    catch (_) {}
  } else {
    try { await navigator.clipboard.writeText(text); } catch (_) {}
  }
}

export default function WordScreen() {
  const todayIndex = new Date().getDate() % w.verses.length;
  const featured = w.verses[todayIndex];
  const rest = w.verses.filter((_, i) => i !== todayIndex);

  return (
    <div style={{ padding: "8px 20px 100px", fontFamily: SANS }}>
      <div style={{ padding: "16px 0 20px" }}>
        <h2 style={{ fontWeight: 600, fontSize: 24, margin: "0 0 6px", letterSpacing: "-.02em", color: T.g900, fontFamily: SANS }}>
          {w.heroBefore} <span style={{ color: T.brand, fontWeight: 700 }}>{w.heroHighlight}</span>
        </h2>
        <p style={{ margin: 0, fontSize: 13.5, color: T.g500, lineHeight: 1.55, fontFamily: SANS }}>
          {w.heroSub}
        </p>
      </div>

      {/* Today's featured verse */}
      <div style={{ background: T.brand, borderRadius: 20, padding: "24px 24px 20px", marginBottom: 20 }}>
        <div style={{ fontSize: 10.5, fontWeight: 700, color: "rgba(255,255,255,.55)", letterSpacing: ".1em", marginBottom: 14, fontFamily: SANS }}>
          {featured.stamp.toUpperCase()}
        </div>
        <p style={{ fontWeight: 600, fontSize: 17, lineHeight: 1.7, color: "#fff", margin: "0 0 18px", letterSpacing: "-.01em", fontFamily: SANS }}>
          {featured.quote}
        </p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,.65)", fontWeight: 600, fontFamily: SANS }}>{featured.cite}</span>
          <button
            onClick={() => shareVerse(featured)}
            style={{ background: "rgba(255,255,255,.15)", border: "1px solid rgba(255,255,255,.25)", borderRadius: 8, padding: "5px 12px", display: "flex", alignItems: "center", gap: 5, cursor: "pointer", color: "#fff", fontSize: 12, fontWeight: 600, fontFamily: SANS }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={13} height={13}>
              <circle cx="18" cy="5" r="2" /><circle cx="6" cy="12" r="2" /><circle cx="18" cy="19" r="2" />
              <line x1="8" y1="10.6" x2="15.9" y2="6.4" /><line x1="8" y1="13.4" x2="15.9" y2="17.6" />
            </svg>
            {w.shareBtn}
          </button>
        </div>
      </div>

      {/* Rest of verses */}
      {rest.map((v, i) => (
        <div key={i} style={{ background: "#fff", border: `1px solid ${T.g200}`, borderRadius: 14, padding: "18px 20px 14px", marginBottom: 12, position: "relative" }}>
          <span style={{
            position: "absolute", top: -9, left: 18,
            background: "#fff", fontSize: 10.5, letterSpacing: ".08em",
            padding: "2px 10px", color: T.brand,
            border: `1px solid ${T.g200}`, fontWeight: 600, borderRadius: 4,
            fontFamily: SANS,
          }}>
            {v.stamp}
          </span>
          <p style={{ fontWeight: 500, fontSize: 16, lineHeight: 1.6, color: T.g900, margin: "6px 0 12px", letterSpacing: "-.01em", fontFamily: SANS }}>
            {v.quote}
          </p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontSize: 12, color: T.g500, fontWeight: 600, fontFamily: SANS }}>{v.cite}</div>
            <button
              onClick={() => shareVerse(v)}
              style={{ background: "transparent", border: `1px solid ${T.g200}`, borderRadius: 8, padding: "5px 12px", display: "flex", alignItems: "center", gap: 5, cursor: "pointer", color: T.g500, fontSize: 12, fontWeight: 600, fontFamily: SANS }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={13} height={13}>
                <circle cx="18" cy="5" r="2" /><circle cx="6" cy="12" r="2" /><circle cx="18" cy="19" r="2" />
                <line x1="8" y1="10.6" x2="15.9" y2="6.4" /><line x1="8" y1="13.4" x2="15.9" y2="17.6" />
              </svg>
              {w.shareBtn}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
