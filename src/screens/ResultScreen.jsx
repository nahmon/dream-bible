import { useState } from "react";
import { C, F, Ic } from "../lib/constants.jsx";
import { Btn, useToast } from "../components/shared.jsx";

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
    if (t.startsWith("**") && t.endsWith("**")) return { type: "heading", text: t.slice(2, -2), key: i };
    if (t.startsWith("- ")) return { type: "bullet", text: t.slice(2), key: i };
    if (!t) return { type: "spacer", key: i };
    return { type: "text", text: t, key: i };
  });
}

export default function ResultScreen({ go, result }) {
  const { interpretation, dream_text, image_url } = result ?? {};
  const parsed = parseInterpretation(interpretation);
  const [imgLoaded, setImgLoaded] = useState(false);
  const { showToast } = useToast();

  const handleShare = async () => {
    const clean = interpretation?.replace(/\*\*/g, "").replace(/^- /gm, "• ") ?? "";
    const shareText = `🌙 Dream Bible — Biblical Interpretation\n\nMy dream: ${dream_text}\n\n${clean}\n\nAI-powered biblical dream interpretation → https://dream-bible.vercel.app`;
    if (navigator.share) {
      try { await navigator.share({ title: "Dream Bible", text: shareText, url: "https://dream-bible.vercel.app" }); }
      catch (_) {}
    } else {
      await navigator.clipboard.writeText(shareText);
      showToast("Copied to clipboard", "success");
    }
  };

  const handleSaveImage = () => {
    if (!image_url) return;
    const a = document.createElement("a");
    a.href = image_url;
    a.target = "_blank";
    a.rel = "noopener";
    a.click();
  };

  return (
    <div style={{ minHeight: "100vh", background: C.gray, fontFamily: F }}>
      {/* Glass Nav */}
      <nav style={NAV_STYLE}>
        <button onClick={() => go("dream")} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
          <Ic.Cross s={14} c="rgba(255,255,255,0.85)" />
          <span style={{ fontSize: 14, fontWeight: 600, color: "#fff", letterSpacing: "-0.2px" }}>Dream Bible</span>
        </button>
        <Btn size="sm" variant="primary" onClick={() => go("dream")}>New Dream</Btn>
      </nav>

      <div style={{ maxWidth: 560, margin: "0 auto", padding: "36px 24px 60px" }}>

        {/* Biblical Image */}
        <div style={{ marginBottom: 20, borderRadius: 16, overflow: "hidden", boxShadow: "rgba(0,0,0,0.18) 0px 4px 24px 0px", background: "#1a1a1a", aspectRatio: "1 / 1", position: "relative" }}>
          {!imgLoaded && (
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
              <span style={{ display: "inline-block", width: 24, height: 24, border: "2px solid rgba(255,255,255,0.15)", borderTopColor: "rgba(255,255,255,0.5)", borderRadius: "50%", animation: "spin 0.9s linear infinite" }} />
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", letterSpacing: "-0.12px" }}>Generating biblical artwork...</span>
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
          )}
          {image_url && (
            <img
              src={image_url}
              alt="Biblical dream illustration"
              onLoad={() => setImgLoaded(true)}
              style={{
                width: "100%", height: "100%", objectFit: "cover",
                display: "block",
                opacity: imgLoaded ? 1 : 0,
                transition: "opacity 0.5s ease",
              }}
            />
          )}
          {!image_url && (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Ic.Cross s={40} c="rgba(255,255,255,0.15)" />
            </div>
          )}
        </div>

        {/* Dream text recap */}
        <div style={{ background: C.white, borderRadius: 12, padding: "16px 20px", marginBottom: 14, boxShadow: "rgba(0,0,0,0.06) 0px 1px 8px 0px" }}>
          <div style={{ fontSize: 12, color: C.body, marginBottom: 6, fontWeight: 500, letterSpacing: "-0.12px" }}>Your Dream</div>
          <p style={{ fontSize: 15, color: C.nearBlack, lineHeight: 1.6, letterSpacing: "-0.224px" }}>{dream_text}</p>
        </div>

        {/* Interpretation */}
        <div style={{ background: C.white, borderRadius: 12, padding: "24px", marginBottom: 20, boxShadow: "rgba(0,0,0,0.06) 0px 1px 8px 0px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <div style={{ width: 30, height: 30, background: C.goldBg, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Ic.Sparkle s={15} c={C.blue} />
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, color: C.nearBlack, letterSpacing: "-0.224px" }}>Biblical Reflection</div>
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
                  <span style={{ color: C.blue, fontSize: 16, flexShrink: 0, marginTop: 1 }}>›</span>
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

        {/* Share buttons */}
        <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
          <Btn variant="primary" size="lg" full onClick={handleShare}>
            <svg width={16} height={16} viewBox="0 0 16 16" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="3" r="1.5"/><circle cx="3" cy="8" r="1.5"/><circle cx="12" cy="13" r="1.5"/>
              <line x1="4.4" y1="7.2" x2="10.6" y2="3.8"/><line x1="4.4" y1="8.8" x2="10.6" y2="12.2"/>
            </svg>
            Share with a Friend
          </Btn>
          {image_url && (
            <Btn variant="ghost" size="lg" full onClick={handleSaveImage}>
              <svg width={16} height={16} viewBox="0 0 16 16" fill="none" stroke={C.nearBlack} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 2v8M5 7l3 3 3-3"/><rect x="2" y="11" width="12" height="3" rx="1"/>
              </svg>
              Save Image
            </Btn>
          )}
        </div>

        {/* New dream */}
        <Btn variant="ghost" size="md" full onClick={() => go("dream")}>
          <Ic.Moon s={15} c={C.nearBlack} />
          Interpret Another Dream
        </Btn>

        {/* Disclaimer */}
        <div style={{ marginTop: 20, fontSize: 12, color: "rgba(0,0,0,0.36)", textAlign: "center", lineHeight: 1.47, letterSpacing: "-0.12px" }}>
          This reflection is a biblical meditation guide — not prophecy.<br />
          For spiritual decisions, seek guidance from your pastor or faith community.
        </div>
      </div>
    </div>
  );
}
