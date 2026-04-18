import { C, F, S, Ic } from "../lib/constants.jsx";
import { Btn } from "../components/shared.jsx";

const FEATURES = [
  { icon: <Ic.Book s={22} c={C.blue} />, title: "Scripture-Based", desc: "Interpreted through the lens of Joseph, Daniel, and real biblical dream passages" },
  { icon: <Ic.Moon s={22} c={C.blue} />, title: "AI Reflection Guide", desc: "Analyzes your dream and suggests a prayer focus and Scripture to meditate on" },
  { icon: <Ic.Sparkle s={22} c={C.blue} />, title: "Biblical Dream Art", desc: "Receive a stunning illuminated-manuscript illustration inspired by your dream" },
];

export default function LandingScreen({ go }) {
  return (
    <div style={{ fontFamily: F }}>
      {/* Glass Nav */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        height: 48,
        background: "rgba(0,0,0,0.8)",
        backdropFilter: "saturate(180%) blur(20px)",
        WebkitBackdropFilter: "saturate(180%) blur(20px)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 24px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <Ic.Cross s={15} c="rgba(255,255,255,0.85)" />
          <span style={{ fontSize: 14, fontWeight: 600, color: "#fff", letterSpacing: "-0.2px" }}>Dream Bible</span>
        </div>
        <Btn size="sm" variant="primary" onClick={() => go("dream")}>Try It Free</Btn>
      </nav>

      {/* Hero — Dark */}
      <div style={{ background: "#000000", padding: "88px 24px 80px", textAlign: "center" }}>
        <div style={{ maxWidth: 620, margin: "0 auto" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "rgba(255,255,255,0.08)", borderRadius: 9999,
            padding: "5px 14px", fontSize: 12, color: "rgba(255,255,255,0.6)",
            fontWeight: 400, marginBottom: 28, letterSpacing: "-0.12px",
          }}>
            AI-Powered Biblical Dream Interpretation
          </div>

          <h1 style={{
            fontSize: "clamp(40px, 8vw, 56px)", fontWeight: 600,
            color: "#ffffff", lineHeight: 1.07,
            marginBottom: 20, letterSpacing: "-0.28px",
          }}>
            Record your dream.<br />
            Reflect through<br />
            Scripture.
          </h1>

          <p style={{
            fontSize: 21, color: "rgba(255,255,255,0.64)",
            lineHeight: 1.47,
            fontWeight: 400, letterSpacing: "-0.374px",
            maxWidth: 480, margin: "0 auto 40px",
          }}>
            Not prophecy — reflection.<br />
            Explore what God's Word says about your dreams.
          </p>

          <Btn size="lg" variant="primary" onClick={() => go("dream")}>
            <Ic.Moon s={16} c="#fff" />
            Start for Free
          </Btn>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", marginTop: 18, letterSpacing: "-0.224px" }}>
            No sign-in required · Free
          </div>
        </div>
      </div>

      {/* Features — Light */}
      <div style={{ background: C.gray, padding: "80px 24px 88px" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <h2 style={{
            fontSize: "clamp(28px, 5vw, 40px)", fontWeight: 600,
            color: C.nearBlack, lineHeight: 1.10,
            textAlign: "center", marginBottom: 52,
            letterSpacing: "-0.28px",
          }}>
            Your dreams,<br />through Scripture
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {FEATURES.map((f, i) => (
              <div key={i} style={{
                background: C.white, borderRadius: 12,
                padding: "22px 24px", boxShadow: S.card,
                display: "flex", gap: 18, alignItems: "flex-start",
              }}>
                <div style={{
                  flexShrink: 0, width: 44, height: 44,
                  background: C.goldBg, borderRadius: 10,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {f.icon}
                </div>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 600, color: C.nearBlack, marginBottom: 5, letterSpacing: "-0.374px" }}>{f.title}</div>
                  <div style={{ fontSize: 14, color: C.body, lineHeight: 1.47, letterSpacing: "-0.224px" }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: 52 }}>
            <Btn size="lg" variant="primary" onClick={() => go("dream")}>
              Interpret Your Dream
            </Btn>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ background: "#000000", padding: "32px 24px", textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 10 }}>
          <Ic.Cross s={13} c="rgba(255,255,255,0.4)" />
          <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.4)" }}>Dream Bible</span>
        </div>
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", letterSpacing: "-0.12px" }}>
          © 2026 Dream Bible · A biblical reflection guide — not prophecy or divination
        </span>
      </div>
    </div>
  );
}
