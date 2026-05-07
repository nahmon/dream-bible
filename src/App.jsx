import { useState, useEffect, useRef } from "react";
import { ToastProvider } from "./components/shared.jsx";
import HomeScreen from "./screens/HomeScreen.jsx";
import JournalScreen from "./screens/JournalScreen.jsx";
import WordScreen from "./screens/WordScreen.jsx";
import MeScreen from "./screens/MeScreen.jsx";
import ResultScreen from "./screens/ResultScreen.jsx";
import { L } from "./lang/index.js";
import { supabase, isAdmin } from "./lib/supabase.js";

const SANS = '"Pretendard Variable",Pretendard,-apple-system,BlinkMacSystemFont,system-ui,sans-serif';
const T = {
  brand: "#1B3A6B",
  g100: "#F2F4F6", g200: "#E5E8EB", g400: "#B0B8C1", g900: "#191F28",
};

const MONTH_KEY = () => {
  const d = new Date();
  return `db_uses_${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};
const FREE_LIMIT = 3;

function getUses() {
  return parseInt(localStorage.getItem(MONTH_KEY()) || "0");
}
function incrementUses() {
  const k = MONTH_KEY();
  localStorage.setItem(k, (getUses() + 1).toString());
}
function getUserId() {
  let id = localStorage.getItem("db_user_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("db_user_id", id);
  }
  return id;
}

const TAB_ICONS = [
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={24} height={24}><path d="M3 11 L12 4 L21 11 V20 A1 1 0 0 1 20 21 H15 V14 H9 V21 H4 A1 1 0 0 1 3 20 Z" /></svg>,
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={24} height={24}><path d="M5 3 H17 A2 2 0 0 1 19 5 V21 L12 17 L5 21 Z" /></svg>,
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={24} height={24}><path d="M4 5 A2 2 0 0 1 6 3 H20 V19 H6 A2 2 0 0 0 4 21 Z M4 5 V21 M8 8 H16 M8 12 H14" /></svg>,
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={24} height={24}><circle cx="12" cy="8" r="4" /><path d="M4 21 A8 8 0 0 1 20 21" /></svg>,
];
const TABS = L.tabs.map((t, i) => ({ ...t, icon: TAB_ICONS[i] }));

export default function App() {
  const [tab, setTab] = useState("home");
  const [result, setResult] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const [isPaid, setIsPaid] = useState(() => {
    const paidUntil = localStorage.getItem("db_paid_until");
    if (paidUntil && new Date(paidUntil) > new Date()) return true;
    return localStorage.getItem("db_paid") === "true";
  });
  const [uses, setUses] = useState(getUses);
  const [scrolled, setScrolled] = useState(false);
  const scrollRef = useRef(null);

  // History API: result 화면을 "페이지"로 등록해 Toss 뒤로가기가 닫기로 동작하게 함
  const openResult = (data) => {
    window.history.pushState({ resultOpen: true }, "");
    setResult(data);
  };
  const closeResult = () => {
    if (window.history.state?.resultOpen) {
      window.history.back();
    } else {
      setResult(null);
    }
  };
  useEffect(() => {
    const onPop = () => setResult(null);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const searchParams = new URLSearchParams(window.location.search);
  const isDevReset = searchParams.get("reset_uses") === "1";
  const stripeSessionId = searchParams.get("session_id");

  useEffect(() => {
    if (stripeSessionId) {
      localStorage.setItem("db_paid", "true");
      setIsPaid(true);
      window.history.replaceState({}, "", "/");
      return;
    }
    if (isDevReset) {
      localStorage.removeItem(MONTH_KEY());
      localStorage.removeItem("db_paid");
      localStorage.removeItem("db_paid_until");
      setUses(0);
      setIsPaid(false);
      window.history.replaceState({}, "", "/");
      return;
    }
    const userId = getUserId();
    fetch("/api/check-subscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    })
      .then(r => { if (!r.ok) throw new Error("server error"); return r.json(); })
      .then(data => {
        if (data.isPaid) {
          localStorage.setItem("db_paid", "true");
          if (data.expiresAt) localStorage.setItem("db_paid_until", data.expiresAt);
          setIsPaid(true);
        } else if (data.isPaid === false) {
          // 서버가 명시적으로 만료 확인 시 — db_paid_until이 이미 지난 경우만 다운그레이드
          const paidUntil = localStorage.getItem("db_paid_until");
          const expired = paidUntil && new Date(paidUntil) <= new Date();
          if (expired) {
            localStorage.removeItem("db_paid");
            localStorage.removeItem("db_paid_until");
            setIsPaid(false);
          }
        }
      })
      .catch(() => {});
  }, []);

  const onUsed = () => {
    incrementUses();
    setUses(getUses());
  };

  const handleTabChange = (id) => {
    setTab(id);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  };

  const adminMode = isAdmin(user);
  const effectiveIsPaid = adminMode || isPaid;
  const canInterpret = adminMode || isPaid || uses < FREE_LIMIT;
  const activeTab = TABS.find(t => t.id === tab);

  return (
    <ToastProvider>
      <div style={{ minHeight: "100vh", background: "#fff", fontFamily: SANS, WebkitFontSmoothing: "antialiased" }}>
        <style>{`
          * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
          html, body { margin: 0; padding: 0; background: #fff; }
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes pulse { 0%,100%{opacity:.4;transform:scale(1);} 50%{opacity:1;transform:scale(1.2);} }
          button:active { transform: scale(0.97); transition: transform 0.08s ease; }
        `}</style>

        {/* TDS mini-app nav bar */}
        <div style={{
          position: "sticky", top: 0, zIndex: 50,
          height: 44, display: "grid", gridTemplateColumns: "56px 1fr 56px",
          alignItems: "center", background: "#fff",
          borderBottom: scrolled ? `1px solid ${T.g200}` : "1px solid transparent",
          transition: "border-color .2s",
        }}>
          <div style={{ width: 44 }} />
          <div style={{ textAlign: "center", fontFamily: SANS, fontSize: 16, fontWeight: 600, color: T.g900, letterSpacing: "-.01em", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <span style={{ width: 18, height: 18, borderRadius: 4, background: T.brand, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg viewBox="0 0 22 22" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" width={11} height={11}><path d="M11 4 V18 M5 8 H17" /></svg>
            </span>
            <span>{activeTab?.navLabel || "드림바이블"}</span>
          </div>
          <div />
        </div>

        {/* Scrollable tab content */}
        <div
          ref={scrollRef}
          onScroll={e => setScrolled(e.currentTarget.scrollTop > 4)}
          style={{ overflowY: "auto", height: "calc(100vh - 44px - 65px)", WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}
        >
          {tab === "home" && (
            <HomeScreen
              isPaid={effectiveIsPaid}
              uses={uses}
              freeLimit={FREE_LIMIT}
              canInterpret={canInterpret}
              onUsed={onUsed}
              onResult={openResult}
              onPurchaseSuccess={() => setIsPaid(true)}
              userId={getUserId()}
              user={user}
            />
          )}
          {tab === "journal" && <JournalScreen onOpenResult={openResult} />}
          {tab === "word" && <WordScreen />}
          {tab === "me" && <MeScreen isPaid={effectiveIsPaid} uses={uses} user={user} userId={getUserId()} onReset={(mode) => { if (mode === "paid") { setIsPaid(true); } else { setUses(0); setIsPaid(false); } }} />}
        </div>

        {/* Bottom tab bar */}
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#fff", borderTop: `1px solid ${T.g200}`, zIndex: 40 }}>
          <div style={{ display: "flex", padding: "6px 8px calc(6px + env(safe-area-inset-bottom))" }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => handleTabChange(t.id)} style={{
                flex: 1, background: "transparent", border: 0, cursor: "pointer",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                gap: 3, padding: "8px 4px 6px", borderRadius: 8,
                color: tab === t.id ? T.brand : T.g400,
                fontFamily: SANS, fontSize: 11, fontWeight: 600, letterSpacing: "-.01em",
                transition: "color .18s",
              }}>
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Result overlay */}
        {result && <ResultScreen result={result} onClose={closeResult} />}
      </div>
    </ToastProvider>
  );
}
