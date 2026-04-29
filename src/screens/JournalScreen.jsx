import { useState } from "react";

const SANS = '"Pretendard Variable",Pretendard,-apple-system,BlinkMacSystemFont,system-ui,sans-serif';
const T = {
  brand: "#6B3F1D",
  g50: "#F9FAFB", g100: "#F2F4F6", g200: "#E5E8EB",
  g400: "#B0B8C1", g500: "#8B95A1", g600: "#6B7684", g700: "#4E5968", g900: "#191F28",
};

const MONTHS = ["전체", "이번 달", "3월", "2월", "1월"];

function formatDate(isoStr) {
  const d = new Date(isoStr);
  return {
    mon: d.toLocaleString("en-US", { month: "short" }).toUpperCase(),
    day: d.getDate(),
  };
}

function getVerseLabel(interpretation) {
  const match = interpretation?.match(/[가-힣]+\s*\d+[편장:]\s*\d*/);
  return match ? match[0].trim() : "말씀";
}

function isThisMonth(isoStr) {
  const now = new Date();
  const d = new Date(isoStr);
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

function isMonth(isoStr, label) {
  const monthMap = { "3월": 2, "2월": 1, "1월": 0 };
  if (!(label in monthMap)) return false;
  const d = new Date(isoStr);
  return d.getMonth() === monthMap[label];
}

export default function JournalScreen({ onOpenResult }) {
  const [filter, setFilter] = useState("전체");
  const entries = JSON.parse(localStorage.getItem("db_journal") || "[]");

  const filtered = entries.filter(e => {
    if (filter === "전체") return true;
    if (filter === "이번 달") return isThisMonth(e.date);
    return isMonth(e.date, filter);
  });

  return (
    <div style={{ paddingBottom: 20 }}>
      <div style={{ padding: "24px 20px 16px" }}>
        <h2 style={{ fontFamily: SANS, fontWeight: 600, fontSize: 24, margin: "0 0 6px", letterSpacing: "-.02em", color: T.g900 }}>
          당신의 <span style={{ color: T.brand, fontWeight: 700 }}>밤들</span>이<br />이곳에 모여요
        </h2>
        <p style={{ margin: 0, fontSize: 13.5, color: T.g500, lineHeight: 1.55, fontFamily: SANS }}>
          이곳에 적은 꿈은 조용히 보관돼요. 언제든 다시 꺼내볼 수 있어요.
        </p>
      </div>

      {/* Month filter */}
      <div style={{ display: "flex", gap: 10, padding: "4px 20px 14px", overflowX: "auto", scrollbarWidth: "none" }}>
        {MONTHS.map(m => (
          <button key={m} onClick={() => setFilter(m)} style={{
            flexShrink: 0, background: filter === m ? T.g900 : "transparent",
            border: `1px solid ${filter === m ? T.g900 : T.g200}`,
            borderRadius: 999, padding: "7px 14px",
            fontSize: 12.5, color: filter === m ? "#fff" : T.g700,
            fontWeight: 500, cursor: "pointer", fontFamily: SANS, transition: "all .15s",
          }}>{m}</button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div style={{ padding: "60px 24px", textAlign: "center" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke={T.g400} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width={40} height={40} style={{ marginBottom: 16 }}>
            <path d="M5 3 H17 A2 2 0 0 1 19 5 V21 L12 17 L5 21 Z" />
          </svg>
          <p style={{ fontSize: 15, fontWeight: 600, color: T.g600, margin: "0 0 8px", fontFamily: SANS }}>아직 기록된 꿈이 없어요</p>
          <p style={{ fontSize: 13.5, color: T.g400, margin: 0, lineHeight: 1.55, fontFamily: SANS }}>오늘 탭에서 첫 번째 꿈을 적어보세요.</p>
        </div>
      ) : (
        filtered.map((entry, i) => {
          const { mon, day } = formatDate(entry.date);
          return (
            <div key={entry.id || i} onClick={() => onOpenResult(entry)} style={{
              display: "grid", gridTemplateColumns: "56px 1fr 18px",
              gap: 14, padding: "14px 20px", alignItems: "flex-start",
              borderBottom: `1px solid ${T.g100}`, cursor: "pointer",
            }}>
              <div style={{ fontSize: 11, color: T.g500, fontWeight: 600, letterSpacing: ".04em", paddingTop: 3, textTransform: "uppercase", fontFamily: SANS }}>
                {mon}
                <span style={{ display: "block", fontSize: 18, color: T.g900, fontWeight: 600, letterSpacing: "-.01em", textTransform: "none", marginTop: 2 }}>{day}</span>
              </div>
              <div>
                <p style={{ fontSize: 14.5, color: T.g900, lineHeight: 1.5, margin: "0 0 6px", fontWeight: 500, fontFamily: SANS }}>{entry.dream_text}</p>
                <span style={{ fontSize: 11.5, color: T.brand, fontWeight: 600, fontFamily: SANS }}>{getVerseLabel(entry.interpretation)}</span>
              </div>
              <span style={{ color: T.g400, fontSize: 14, paddingTop: 6 }}>→</span>
            </div>
          );
        })
      )}
    </div>
  );
}
