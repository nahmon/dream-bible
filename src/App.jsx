import { useState } from "react";
import { C, F } from "./lib/constants.jsx";
import { ToastProvider } from "./components/shared.jsx";

import LandingScreen from "./screens/LandingScreen.jsx";
import DreamScreen from "./screens/DreamScreen.jsx";
import ResultScreen from "./screens/ResultScreen.jsx";

export default function App() {
  const [screen, setScreen] = useState("landing");
  const [result, setResult] = useState(null);

  const go = (s, data) => {
    if (s === "result" && data) setResult(data);
    setScreen(s);
  };

  return (
    <ToastProvider>
      <div style={{ fontFamily: F, color: C.navy }}>
        {screen === "landing" && <LandingScreen go={go} />}
        {screen === "dream"   && <DreamScreen go={go} />}
        {screen === "result"  && <ResultScreen go={go} result={result} />}
        {screen === "pricing" && (
          <div style={{ minHeight: "100vh", background: C.heroBlack, fontFamily: F, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
            <div style={{ maxWidth: 400, textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 16, color: "#fff" }}>✦</div>
              <h1 style={{ fontSize: 28, fontWeight: 600, color: "#fff", marginBottom: 12, letterSpacing: "-0.28px" }}>무제한 플랜</h1>
              <p style={{ fontSize: 17, color: "rgba(255,255,255,0.7)", lineHeight: 1.47, marginBottom: 24, letterSpacing: "-0.374px" }}>
                월 <strong style={{ color: "#fff", fontSize: 20 }}>₩4,900</strong>으로<br />
                꿈 해석을 무제한으로 받아보세요
              </p>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginBottom: 24 }}>
                결제 기능은 곧 추가될 예정입니다.
              </p>
              <button onClick={() => go("dream")} style={{ background: "none", border: "none", color: C.blueBright, fontFamily: F, fontSize: 14, cursor: "pointer", textDecoration: "underline" }}>
                돌아가기
              </button>
            </div>
          </div>
        )}
      </div>
    </ToastProvider>
  );
}
