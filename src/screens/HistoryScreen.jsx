import { useState, useEffect } from "react";
import { C, F, Ic } from "../lib/constants.jsx";
import { Btn, Skeleton } from "../components/shared.jsx";
import { supabase } from "../supabase.js";

const NAV_STYLE = {
  position: "sticky", top: 0, zIndex: 100,
  height: 48,
  background: "rgba(0,0,0,0.8)",
  backdropFilter: "saturate(180%) blur(20px)",
  WebkitBackdropFilter: "saturate(180%) blur(20px)",
  display: "flex", alignItems: "center", justifyContent: "space-between",
  padding: "0 24px",
};

function formatDate(iso) {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

function truncate(text, len = 70) {
  if (!text) return "";
  return text.length > len ? text.slice(0, len) + "..." : text;
}

export default function HistoryScreen({ go, user }) {
  const [dreams, setDreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!user) return;
    let isMounted = true;
    supabase
      .from("dreams")
      .select("id, dream_text, interpretation, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!isMounted) return;
        if (!error) setDreams(data ?? []);
        setLoading(false);
      });
    return () => { isMounted = false; };
  }, [user]);

  const selectedDream = dreams.find(d => d.id === selected);

  // Detail view
  if (selected && selectedDream) {
    return (
      <div style={{ minHeight: "100vh", background: C.gray, fontFamily: F }}>
        <nav style={NAV_STYLE}>
          <button onClick={() => setSelected(null)} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
            <span style={{ fontSize: 16, color: "rgba(255,255,255,0.85)" }}>←</span>
            <span style={{ fontSize: 14, fontWeight: 400, color: "rgba(255,255,255,0.85)", letterSpacing: "-0.2px" }}>목록으로</span>
          </button>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", letterSpacing: "-0.12px" }}>{formatDate(selectedDream.created_at)}</span>
        </nav>
        <div style={{ maxWidth: 560, margin: "0 auto", padding: "32px 24px 60px" }}>
          <div style={{ background: C.white, borderRadius: 12, padding: "16px 20px", marginBottom: 14, boxShadow: "rgba(0,0,0,0.06) 0px 1px 8px 0px" }}>
            <div style={{ fontSize: 12, color: C.body, marginBottom: 6, fontWeight: 500, letterSpacing: "-0.12px" }}>꿈 내용</div>
            <p style={{ fontSize: 15, color: C.nearBlack, lineHeight: 1.6, whiteSpace: "pre-wrap", letterSpacing: "-0.224px" }}>{selectedDream.dream_text}</p>
          </div>
          <div style={{ background: C.white, borderRadius: 12, padding: "20px 24px", boxShadow: "rgba(0,0,0,0.06) 0px 1px 8px 0px" }}>
            <div style={{ fontSize: 12, color: C.body, marginBottom: 12, fontWeight: 500, letterSpacing: "-0.12px" }}>성경적 묵상</div>
            <p style={{ fontSize: 15, color: C.nearBlack, lineHeight: 1.8, whiteSpace: "pre-wrap", letterSpacing: "-0.224px" }}>{selectedDream.interpretation}</p>
          </div>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div style={{ minHeight: "100vh", background: C.gray, fontFamily: F }}>
      <nav style={NAV_STYLE}>
        <button onClick={() => go("landing")} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
          <Ic.Cross s={14} c="rgba(255,255,255,0.85)" />
          <span style={{ fontSize: 14, fontWeight: 600, color: "#fff", letterSpacing: "-0.2px" }}>꿈묵상</span>
        </button>
        <Btn size="sm" variant="primary" onClick={() => go("dream")}>새 꿈 기록</Btn>
      </nav>

      <div style={{ maxWidth: 560, margin: "0 auto", padding: "36px 24px 60px" }}>
        <h1 style={{ fontSize: 28, fontWeight: 600, color: C.nearBlack, marginBottom: 24, letterSpacing: "-0.28px", lineHeight: 1.14 }}>
          내 꿈 기록
        </h1>

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[1, 2, 3].map(i => <Skeleton key={i} height={88} borderRadius={12} />)}
          </div>
        ) : dreams.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🌙</div>
            <div style={{ fontSize: 17, color: C.nearBlack, fontWeight: 600, marginBottom: 8, letterSpacing: "-0.374px" }}>아직 기록된 꿈이 없습니다</div>
            <div style={{ fontSize: 14, color: C.body, marginBottom: 28, letterSpacing: "-0.224px" }}>오늘 꿈을 기록해 성경으로 돌아보세요</div>
            <Btn variant="primary" onClick={() => go("dream")}>첫 꿈 기록하기</Btn>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {dreams.map(d => (
              <div
                key={d.id}
                onClick={() => setSelected(d.id)}
                style={{ background: C.white, borderRadius: 12, padding: "16px 20px", cursor: "pointer", boxShadow: "rgba(0,0,0,0.06) 0px 1px 8px 0px", transition: "box-shadow 0.18s" }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = "rgba(0,0,0,0.14) 0px 4px 20px 0px"; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = "rgba(0,0,0,0.06) 0px 1px 8px 0px"; }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: C.body, letterSpacing: "-0.12px" }}>{formatDate(d.created_at)}</span>
                  <Ic.ChevronRight s={14} c={C.body} />
                </div>
                <p style={{ fontSize: 15, color: C.nearBlack, lineHeight: 1.5, marginBottom: 5, letterSpacing: "-0.224px" }}>
                  {truncate(d.dream_text)}
                </p>
                <p style={{ fontSize: 13, color: C.body, lineHeight: 1.4, letterSpacing: "-0.224px" }}>
                  {truncate(d.interpretation?.replace(/\*\*/g, "").replace(/^- /gm, ""), 80)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
