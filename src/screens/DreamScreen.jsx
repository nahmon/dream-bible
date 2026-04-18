import { useState } from "react";
import { C, F, Ic } from "../lib/constants.jsx";
import { Btn, useToast } from "../components/shared.jsx";

const EXAMPLES = [
  "I was flying through the sky when rays of light broke through the clouds",
  "I dreamed I was crossing a wide, crystal-clear river toward the other side",
  "A flock of white sheep were grazing peacefully in a sunlit meadow",
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
      showToast("Please describe your dream in a bit more detail", "error");
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
        showToast(data.error || "Something went wrong. Please try again.", "error");
        return;
      }

      go("result", { interpretation: data.interpretation, dream_text: dream, image_url: data.image_url });
    } catch (err) {
      showToast("Network error. Please check your connection.", "error");
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
          <span style={{ fontSize: 14, fontWeight: 600, color: "#fff", letterSpacing: "-0.2px" }}>Dream Bible</span>
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
            <circle cx="48" cy="52" r="34" fill="rgba(0,113,227,0.08)" />
            <circle cx="48" cy="52" r="24" fill="rgba(0,113,227,0.10)" />
            <circle cx="14" cy="18" r="1.4" fill="rgba(255,255,255,0.55)" />
            <circle cx="78" cy="14" r="1.0" fill="rgba(255,255,255,0.40)" />
            <circle cx="82" cy="36" r="1.6" fill="rgba(255,255,255,0.50)" />
            <circle cx="8"  cy="50" r="1.0" fill="rgba(255,255,255,0.35)" />
            <circle cx="88" cy="58" r="1.2" fill="rgba(255,255,255,0.45)" />
            <circle cx="20" cy="76" r="1.0" fill="rgba(255,255,255,0.30)" />
            <circle cx="74" cy="80" r="1.4" fill="rgba(255,255,255,0.35)" />
            <path d="M72 22 L73.2 25 L76 22 L73.2 19 Z" fill="rgba(255,255,255,0.6)" />
            <line x1="48" y1="18" x2="48" y2="76" stroke="rgba(255,255,255,0.90)" strokeWidth="3.5" strokeLinecap="round"/>
            <line x1="24" y1="38" x2="72" y2="38" stroke="rgba(255,255,255,0.90)" strokeWidth="3.5" strokeLinecap="round"/>
            <line x1="48" y1="18" x2="48" y2="76" stroke="rgba(0,113,227,0.5)" strokeWidth="8" strokeLinecap="round"/>
            <line x1="24" y1="38" x2="72" y2="38" stroke="rgba(0,113,227,0.5)" strokeWidth="8" strokeLinecap="round"/>
            <path d="M62 60 A12 12 0 1 1 62 72 A8 8 0 1 0 62 60 Z" fill="rgba(255,255,255,0.20)" />
          </svg>
        </div>

        <div style={{ position: "relative" }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#fff", letterSpacing: "-0.28px", marginBottom: 6 }}>Dream Bible</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", letterSpacing: "-0.12px", lineHeight: 1.5 }}>
            Reflect on your dreams through Scripture
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 560, margin: "0 auto", padding: "36px 24px 60px" }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, color: C.nearBlack, marginBottom: 8, letterSpacing: "-0.28px", lineHeight: 1.14 }}>
          Describe your dream
        </h1>
        <p style={{ fontSize: 15, color: C.body, marginBottom: 28, lineHeight: 1.47, letterSpacing: "-0.374px" }}>
          Write down the scenes, people, and feelings you remember — as much detail as you can.
        </p>

        {/* Textarea */}
        <div style={{ marginBottom: 20 }}>
          <textarea
            value={dream}
            onChange={e => setDream(e.target.value)}
            placeholder="e.g. I was walking along a riverbank at dawn when a glowing bird landed right in front of me..."
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
          <div style={{ fontSize: 12, color: C.body, marginTop: 4, textAlign: "right", letterSpacing: "-0.12px" }}>{dream.length} chars</div>
        </div>

        {/* Example prompts */}
        {!dream && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 13, color: C.body, marginBottom: 10, letterSpacing: "-0.224px" }}>Try an example</div>
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
              Searching Scripture...
            </>
          ) : (
            <>
              <Ic.Sparkle s={16} c="#fff" />
              Get Biblical Interpretation
            </>
          )}
        </Btn>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

        <div style={{ marginTop: 20, fontSize: 12, color: "rgba(0,0,0,0.36)", lineHeight: 1.47, letterSpacing: "-0.12px", textAlign: "center" }}>
          This is a biblical reflection guide — not prophecy or divination.
        </div>
      </div>
    </div>
  );
}
