import { useState, useEffect } from "react";
import { C, F, Ic } from "../lib/constants.jsx";
import { Btn, Skeleton } from "../components/shared.jsx";
import { supabase } from "../supabase.js";

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
      <div style={{ minHeight: "100vh", background: C.cream, fontFamily: F }}>
        <nav style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 24px", background: C.white, borderBottom: `1px solid ${C.border}` }}>
          <button onClick={() => setSelected(null)} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", fontFamily: F, fontSize: 14, color: C.navy, padding: 0 }}>
            ← 목록으로
          </button>
          <span style={{ fontSize: 14, color: C.body }}>{formatDate(selectedDream.created_at)}</span>
        </nav>
        <div style={{ maxWidth: 560, margin: "0 auto", padding: "32px 24px" }}>
          <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: "16px 20px", marginBottom: 20 }}>
            <div style={{ fontSize: 12, color: C.body, marginBottom: 6, fontWeight: 500 }}>꿈 내용</div>
            <p style={{ fontSize: 15, color: C.label, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{selectedDream.dream_text}</p>
          </div>
          <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, padding: "20px 24px" }}>
            <div style={{ fontSize: 12, color: C.body, marginBottom: 12, fontWeight: 500 }}>성경적 묵상</div>
            <p style={{ fontSize: 15, color: C.label, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{selectedDream.interpretation}</p>
          </div>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div style={{ minHeight: "100vh", background: C.cream, fontFamily: F }}>
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", background: C.white, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Ic.Star s={18} c={C.gold} />
          <span style={{ fontSize: 16, fontWeight: 700, color: C.navy }}>꿈묵상</span>
        </div>
        <Btn size="sm" variant="gold" onClick={() => go("dream")}>새 꿈 기록</Btn>
      </nav>

      <div style={{ maxWidth: 560, margin: "0 auto", padding: "32px 24px" }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: C.navy, marginBottom: 24, letterSpacing: "-0.4px" }}>
          내 꿈 기록
        </h1>

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[1, 2, 3].map(i => <Skeleton key={i} height={88} borderRadius={12} />)}
          </div>
        ) : dreams.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🌙</div>
            <div style={{ fontSize: 16, color: C.navy, fontWeight: 600, marginBottom: 8 }}>아직 기록된 꿈이 없습니다</div>
            <div style={{ fontSize: 14, color: C.body, marginBottom: 24 }}>오늘 꿈을 기록해 성경으로 돌아보세요</div>
            <Btn variant="gold" onClick={() => go("dream")}>첫 꿈 기록하기</Btn>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {dreams.map(d => (
              <div
                key={d.id}
                onClick={() => setSelected(d.id)}
                style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: "16px 20px", cursor: "pointer", transition: "box-shadow 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(27,42,74,0.10)"; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: C.body }}>{formatDate(d.created_at)}</span>
                  <Ic.ChevronRight s={14} c={C.body} />
                </div>
                <p style={{ fontSize: 15, color: C.navy, lineHeight: 1.5, marginBottom: 6 }}>
                  {truncate(d.dream_text)}
                </p>
                <p style={{ fontSize: 13, color: C.body, lineHeight: 1.4 }}>
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
