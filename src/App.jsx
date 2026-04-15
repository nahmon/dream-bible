import { useState, useEffect } from "react";
import { supabase } from "./supabase.js";
import { C, F } from "./lib/constants.jsx";
import { ToastProvider } from "./components/shared.jsx";

import LandingScreen from "./screens/LandingScreen.jsx";
import AuthScreen from "./screens/AuthScreen.jsx";
import DreamScreen from "./screens/DreamScreen.jsx";
import ResultScreen from "./screens/ResultScreen.jsx";
import HistoryScreen from "./screens/HistoryScreen.jsx";

const FREE_LIMIT = 3;
const currentMonth = () => new Date().toISOString().slice(0, 7);

export default function App() {
  const [screen, setScreen] = useState("landing");
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [usageRemaining, setUsageRemaining] = useState(FREE_LIMIT);

  const go = (s, data) => {
    if (s === "result" && data) setResult(data);
    setScreen(s);
  };

  const loadUsage = async (uid) => {
    const { data } = await supabase
      .from("dream_usage")
      .select("count")
      .eq("user_id", uid)
      .eq("month", currentMonth())
      .single();
    setUsageRemaining(FREE_LIMIT - (data?.count ?? 0));
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) loadUsage(u.id);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        loadUsage(u.id);
        setScreen("dream");
      } else {
        setScreen("landing");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setScreen("landing");
  };

  if (authLoading) {
    return (
      <div style={{ minHeight: "100vh", background: C.cream, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F }}>
        <div style={{ fontSize: 15, color: "#6B7B8F" }}>잠시만요...</div>
      </div>
    );
  }

  const guardedScreen = (s) => {
    if (!user && ["dream", "history"].includes(s)) return "auth";
    return s;
  };

  const active = guardedScreen(screen);

  return (
    <ToastProvider>
      <div style={{ fontFamily: F, color: C.navy }}>
        {active === "landing"  && <LandingScreen go={go} user={user} logout={logout} />}
        {active === "auth"     && <AuthScreen go={go} />}
        {active === "dream"    && <DreamScreen go={go} usageRemaining={usageRemaining} />}
        {active === "result"   && <ResultScreen go={go} result={result} />}
        {active === "history"  && <HistoryScreen go={go} user={user} />}
        {active === "pricing"  && (
          <div style={{ minHeight: "100vh", background: C.cream, fontFamily: F, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
            <div style={{ maxWidth: 400, textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>✦</div>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: C.navy, marginBottom: 12 }}>무제한 플랜</h1>
              <p style={{ fontSize: 15, color: "#6B7B8F", lineHeight: 1.6, marginBottom: 24 }}>
                월 <strong style={{ color: C.navy, fontSize: 20 }}>₩4,900</strong>으로<br />
                꿈 해석을 무제한으로 받아보세요
              </p>
              <p style={{ fontSize: 13, color: "#6B7B8F", marginBottom: 24 }}>
                결제 기능은 곧 추가될 예정입니다.<br />
                출시 알림을 받으시려면 이메일을 등록해 주세요.
              </p>
              <button onClick={() => go("dream")} style={{ background: "none", border: "none", color: "#C9A84C", fontFamily: F, fontSize: 14, cursor: "pointer", textDecoration: "underline" }}>
                돌아가기
              </button>
            </div>
          </div>
        )}
      </div>
    </ToastProvider>
  );
}
