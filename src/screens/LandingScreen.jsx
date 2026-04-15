import { useState } from "react";
import { C, F, Ic } from "../lib/constants.jsx";
import { Btn } from "../components/shared.jsx";

const FEATURES = [
  { icon: <Ic.Book s={22} c={C.gold} />, title: "성경 말씀 기반", desc: "요셉, 다니엘 등 성경의 꿈 사례와 구절로 해석합니다" },
  { icon: <Ic.Moon s={22} c={C.gold} />, title: "AI 묵상 가이드", desc: "꿈을 분석하고 기도 방향과 말씀 묵상을 제안합니다" },
  { icon: <Ic.History s={22} c={C.gold} />, title: "꿈 일기 보관", desc: "내 꿈과 해석을 기록하고 언제든 돌아볼 수 있습니다" },
];

export default function LandingScreen({ go, user }) {
  return (
    <div style={{ minHeight: "100vh", background: C.cream, fontFamily: F }}>
      {/* Nav */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", borderBottom: `1px solid ${C.border}`, background: C.white }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Ic.Star s={20} c={C.gold} />
          <span style={{ fontSize: 17, fontWeight: 700, color: C.navy, letterSpacing: "-0.3px" }}>꿈묵상</span>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {user
            ? <Btn size="sm" variant="gold" onClick={() => go("dream")}>꿈 기록하기</Btn>
            : <Btn size="sm" variant="ghost" onClick={() => go("auth")}>로그인</Btn>
          }
        </div>
      </nav>

      {/* Hero */}
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "64px 24px 40px", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: C.goldBg, border: `1px solid ${C.goldLight}`, borderRadius: 9999, padding: "5px 14px", fontSize: 13, color: C.gold, fontWeight: 500, marginBottom: 24 }}>
          <Ic.Sparkle s={14} c={C.gold} />
          성경 기반 꿈 묵상 AI
        </div>

        <h1 style={{ fontSize: 36, fontWeight: 800, color: C.navy, lineHeight: 1.2, marginBottom: 16, letterSpacing: "-0.8px" }}>
          꿈을 기록하면<br />
          <span style={{ color: C.gold }}>성경 말씀</span>으로<br />
          묵상 가이드를 드립니다
        </h1>

        <p style={{ fontSize: 17, color: C.body, lineHeight: 1.65, marginBottom: 36 }}>
          예언이 아닌 묵상입니다.<br />
          하나님의 말씀 위에서 꿈을 함께 돌아봅니다.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
          <Btn size="lg" variant="gold" onClick={() => go(user ? "dream" : "auth")} style={{ minWidth: 220 }}>
            <Ic.Moon s={18} c="#fff" />
            {user ? "오늘 꿈 기록하기" : "무료로 시작하기"}
          </Btn>
          <span style={{ fontSize: 13, color: C.body }}>매달 3회 무료 · 신용카드 불필요</span>
        </div>
      </div>

      {/* Features */}
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "0 24px 80px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {FEATURES.map((f, i) => (
            <div key={i} style={{ display: "flex", gap: 16, alignItems: "flex-start", background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: "18px 20px" }}>
              <div style={{ flexShrink: 0, width: 40, height: 40, background: C.goldBg, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {f.icon}
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: C.navy, marginBottom: 4 }}>{f.title}</div>
                <div style={{ fontSize: 14, color: C.body, lineHeight: 1.5 }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: "center", padding: "24px", borderTop: `1px solid ${C.border}`, background: C.white }}>
        <span style={{ fontSize: 13, color: C.body }}>
          © 2026 꿈묵상 · 이 서비스는 점술이나 예언이 아닌 성경적 묵상 가이드입니다
        </span>
      </div>
    </div>
  );
}
