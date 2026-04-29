import { useState, useEffect, useRef } from "react";
import { ToastProvider } from "./components/shared.jsx";
import HomeScreen from "./screens/HomeScreen.jsx";
import JournalScreen from "./screens/JournalScreen.jsx";
import WordScreen from "./screens/WordScreen.jsx";
import MeScreen from "./screens/MeScreen.jsx";
import ResultScreen from "./screens/ResultScreen.jsx";

const SANS = '"Pretendard Variable",Pretendard,-apple-system,BlinkMacSystemFont,system-ui,sans-serif';
const T = {
  brand: "#6B3F1D",
  g100: "#F2F4F6", g200: "#E5E8EB", g400: "#B0B8C1", g900: "#191F28",
};

const MONTH_KEY = () => `db_uses_${new Date().toISOString().slice(0, 7)}`;
const FREE_LIMIT = 3;

function getUses() {
  return parseInt(localStorage.getItem(MONTH_KEY()) || "0");
}
function incrementUses() {
  const k = MONTH_KEY();
  localStorage.setItem(k, (getUses() + 1).toString());
}

const TABS = [
  {
    id: "home", label: "오늘", navLabel: "드림바이블",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={24} height={24}><path d="M3 11 L12 4 L21 11 V20 A1 1 0 0 1 20 21 H15 V14 H9 V21 H4 A1 1 0 0 1 3 20 Z" /></svg>,
  },
  {
    id: "journal", label: "일지", navLabel: "일지",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={24} height={24}><path d="M5 3 H17 A2 2 0 0 1 19 5 V21 L12 17 L5 21 Z" /></svg>,
  },
  {
    id: "word", label: "말씀", navLabel: "오늘의 말씀",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={24} height={24}><path d="M4 5 A2 2 0 0 1 6 3 H20 V19 H6 A2 2 0 0 0 4 21 Z M4 5 V21 M8 8 H16 M8 12 H14" /></svg>,
  },
  {
    id: "me", label: "내정보", navLabel: "내정보",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={24} height={24}><circle cx="12" cy="8" r="4" /><path d="M4 21 A8 8 0 0 1 20 21" /></svg>,
  },
];

export default function App() {
  const [tab, setTab] = useState("home");
  const [result, setResult] = useState(null);
  const [isPaid, setIsPaid] = useState(() => localStorage.getItem("db_paid") === "true");
  const [uses, setUses] = useState(getUses);
  const [scrolled, setScrolled] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    if (!sessionId) return;
    window.history.replaceState({}, "", "/");
    fetch("/api/verify-sub", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.active) {
          localStorage.setItem("db_paid", "true");
          if (data.customer_id) localStorage.setItem("db_customer_id", data.customer_id);
          setIsPaid(true);
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

  const canInterpret = isPaid || uses < FREE_LIMIT;
  const activeTab = TABS.find(t => t.id === tab);

  return (
    <ToastProvider>
      <div style={{ minHeight: "100vh", background: "#fff", fontFamily: SANS, WebkitFontSmoothing: "antialiased" }}>
        <style>{`
          * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
          html, body { margin: 0; padding: 0; background: #fff; }
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes pulse { 0%,100%{opacity:.4;transform:scale(1);} 50%{opacity:1;transform:scale(1.2);} }
        `}</style>

        {/* TDS mini-app nav bar */}
        <div style={{
          position: "sticky", top: 0, zIndex: 50,
          height: 44, display: "grid", gridTemplateColumns: "56px 1fr 56px",
          alignItems: "center", background: "#fff",
          borderBottom: scrolled ? `1px solid ${T.g200}` : "1px solid transparent",
          transition: "border-color .2s",
        }}>
          <button style={{ background: "transparent", border: 0, cursor: "pointer", width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", color: T.g900 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width={24} height={24}>
              <path d="M15 18 L9 12 L15 6" />
            </svg>
          </button>
          <div style={{ textAlign: "center", fontFamily: SANS, fontSize: 16, fontWeight: 600, color: T.g900, letterSpacing: "-.01em", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <span style={{ width: 18, height: 18, borderRadius: 4, background: T.brand, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg viewBox="0 0 22 22" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" width={11} height={11}><path d="M11 4 V18 M5 8 H17" /></svg>
            </span>
            <span>{activeTab?.navLabel || "드림바이블"}</span>
          </div>
          <button style={{ background: "transparent", border: 0, cursor: "pointer", width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", color: T.g900, justifySelf: "end" }}>
            <svg viewBox="0 0 24 24" fill="currentColor" width={20} height={20}>
              <circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" />
            </svg>
          </button>
        </div>

        {/* Scrollable tab content */}
        <div
          ref={scrollRef}
          onScroll={e => setScrolled(e.currentTarget.scrollTop > 4)}
          style={{ overflowY: "auto", height: "calc(100vh - 44px - 65px)", WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}
        >
          {tab === "home" && (
            <HomeScreen
              isPaid={isPaid}
              uses={uses}
              freeLimit={FREE_LIMIT}
              canInterpret={canInterpret}
              onUsed={onUsed}
              onResult={setResult}
            />
          )}
          {tab === "journal" && <JournalScreen onOpenResult={setResult} />}
          {tab === "word" && <WordScreen />}
          {tab === "me" && <MeScreen isPaid={isPaid} uses={uses} />}
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
        {result && <ResultScreen result={result} onClose={() => setResult(null)} />}
      </div>
    </ToastProvider>
  );
}
