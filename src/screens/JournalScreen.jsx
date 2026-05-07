import { useState } from "react";
import { L } from "../lang/index.js";

const SANS = '"Pretendard Variable",Pretendard,-apple-system,BlinkMacSystemFont,system-ui,sans-serif';
const T = {
  brand: "#1B3A6B", brandLight: "#E8EEF8",
  g50: "#F9FAFB", g100: "#F2F4F6", g200: "#E5E8EB",
  g400: "#B0B8C1", g500: "#8B95A1", g600: "#6B7684", g700: "#4E5968", g900: "#191F28",
};

const j = L.home.journal;

function buildMonthFilters() {
  const now = new Date();
  const filters = [
    { id: "all", label: j.months[0]?.label ?? "All" },
    { id: "thisMonth", label: j.months[1]?.label ?? "This month" },
  ];
  for (let i = 1; i <= 3; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    filters.push({
      id: `m${i}`,
      label: d.toLocaleString("default", { month: "long" }),
      monthIndex: d.getMonth(),
      year: d.getFullYear(),
    });
  }
  return filters;
}

const MONTH_FILTERS = buildMonthFilters();

function formatDate(isoStr) {
  const d = new Date(isoStr);
  return {
    mon: d.toLocaleString("en-US", { month: "short" }).toUpperCase(),
    day: d.getDate(),
  };
}

function getVerseLabel(interpretation) {
  if (!interpretation) return j.verseLabel;
  // English: "John 3:16" or "Psalm 94:19 — NIV"
  const enMatch = interpretation.match(/[A-Z][a-z]+\.?\s+\d+:\d+/);
  if (enMatch) return enMatch[0].split(" — ")[0].trim();
  // Korean: "시편 94편 19절"
  const koMatch = interpretation.match(/[가-힣]+\s*\d+[편장:]\s*\d*/);
  if (koMatch) return koMatch[0].trim();
  return j.verseLabel;
}

function isThisMonth(isoStr) {
  const now = new Date();
  const d = new Date(isoStr);
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

export default function JournalScreen({ onOpenResult }) {
  const [filterId, setFilterId] = useState("all");
  const entries = JSON.parse(localStorage.getItem("db_journal") || "[]");

  const selectedMonth = MONTH_FILTERS.find(m => m.id === filterId);

  const filtered = entries.filter(e => {
    if (!selectedMonth || selectedMonth.id === "all") return true;
    if (selectedMonth.id === "thisMonth") return isThisMonth(e.date);
    const d = new Date(e.date);
    return d.getMonth() === selectedMonth.monthIndex && d.getFullYear() === selectedMonth.year;
  });

  return (
    <div style={{ paddingBottom: 24 }}>
      <div style={{ padding: "24px 20px 16px" }}>
        <h2 style={{ fontFamily: SANS, fontWeight: 700, fontSize: 28, margin: "0 0 8px", letterSpacing: "-.025em", color: T.g900, lineHeight: 1.3 }}>
          {j.heroBefore} <span style={{ color: T.brand }}>{j.heroHighlight}</span>{j.heroAfter.split("\n").map((line, i) => i === 0 ? line : <><br key={i} />{line}</>)}
        </h2>
        <p style={{ margin: 0, fontSize: 15, color: T.g500, lineHeight: 1.65, fontFamily: SANS }}>
          {j.heroSub}
        </p>
      </div>

      <div style={{ display: "flex", gap: 8, padding: "4px 20px 16px", overflowX: "auto", scrollbarWidth: "none" }}>
        {MONTH_FILTERS.map(m => (
          <button key={m.id} onClick={() => setFilterId(m.id)} style={{
            flexShrink: 0, background: filterId === m.id ? T.g900 : "transparent",
            border: `1.5px solid ${filterId === m.id ? T.g900 : T.g200}`,
            borderRadius: 999, padding: "8px 16px",
            fontSize: 14, color: filterId === m.id ? "#fff" : T.g700,
            fontWeight: 600, cursor: "pointer", fontFamily: SANS, transition: "all .15s",
          }}>{m.label}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ padding: "72px 24px", textAlign: "center" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke={T.g400} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width={48} height={48} style={{ marginBottom: 20 }}>
            <path d="M5 3 H17 A2 2 0 0 1 19 5 V21 L12 17 L5 21 Z" />
          </svg>
          <p style={{ fontSize: 17, fontWeight: 700, color: T.g700, margin: "0 0 8px", fontFamily: SANS }}>{j.emptyTitle}</p>
          <p style={{ fontSize: 15, color: T.g500, margin: 0, lineHeight: 1.6, fontFamily: SANS }}>{j.emptySub}</p>
        </div>
      ) : (
        filtered.map((entry, i) => {
          const { mon, day } = formatDate(entry.date);
          return (
            <div key={entry.id || i} onClick={() => onOpenResult(entry)} style={{
              display: "grid", gridTemplateColumns: "60px 1fr 24px",
              gap: 16, padding: "18px 20px", alignItems: "flex-start",
              borderBottom: `1px solid ${T.g100}`, cursor: "pointer",
            }}>
              <div style={{ paddingTop: 2 }}>
                <div style={{ fontSize: 11, color: T.g500, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", fontFamily: SANS }}>{mon}</div>
                <div style={{ fontSize: 26, color: T.g900, fontWeight: 700, letterSpacing: "-.02em", lineHeight: 1.2, marginTop: 2, fontFamily: SANS }}>{day}</div>
              </div>
              <div>
                <p style={{ fontSize: 15, color: T.g900, lineHeight: 1.6, margin: "0 0 8px", fontWeight: 500, fontFamily: SANS }}>{entry.dream_text}</p>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: T.brandLight, borderRadius: 6, padding: "4px 10px" }}>
                  <svg viewBox="0 0 14 14" fill="none" stroke={T.brand} strokeWidth="1.8" strokeLinecap="round" width={12} height={12}><path d="M4 3 H10 A1 1 0 0 1 11 4 V11 L7 9 L3 11 V4 A1 1 0 0 1 4 3 Z"/></svg>
                  <span style={{ fontSize: 13, color: T.brand, fontWeight: 700, fontFamily: SANS }}>{getVerseLabel(entry.interpretation)}</span>
                </div>
              </div>
              <span style={{ color: T.g400, fontSize: 18, paddingTop: 4, fontWeight: 300 }}>›</span>
            </div>
          );
        })
      )}
    </div>
  );
}
