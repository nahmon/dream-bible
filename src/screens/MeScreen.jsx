const SANS = '"Pretendard Variable",Pretendard,-apple-system,BlinkMacSystemFont,system-ui,sans-serif';
const T = {
  brand: "#6B3F1D",
  g50: "#F9FAFB", g100: "#F2F4F6", g200: "#E5E8EB",
  g400: "#B0B8C1", g500: "#8B95A1", g700: "#4E5968", g900: "#191F28",
};

const SETTINGS = [
  { ttl: "알림 받기", val: "밤 10시" },
  { ttl: "즐겨찾는 구절", val: "0개" },
  { ttl: "내보내기", val: "PDF로 받기" },
  { ttl: "개인정보 처리방침", val: "→" },
  { ttl: "이용약관", val: "→" },
  { ttl: "로그아웃", val: "" },
];

export default function MeScreen({ isPaid, uses }) {
  const entries = JSON.parse(localStorage.getItem("db_journal") || "[]");
  const totalDreams = entries.length;
  const totalInterp = entries.filter(e => e.interpretation).length;

  const stats = [
    { num: totalDreams, lbl: "기록한 꿈" },
    { num: totalInterp, lbl: "받은 풀이" },
    { num: 0, lbl: "즐겨찾기" },
  ];

  return (
    <div style={{ padding: "24px 20px 100px", fontFamily: SANS }}>

      {/* Profile card */}
      <div style={{ background: "#fff", border: `1px solid ${T.g200}`, borderRadius: 14, padding: 18, marginBottom: 12, display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: T.brand, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
          🙏
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 600, color: T.g900, marginBottom: 2, fontFamily: SANS }}>꿈을 기록하는 분</div>
          <div style={{ fontSize: 12.5, color: T.g500, fontWeight: 500, fontFamily: SANS }}>
            {isPaid ? "Pro 멤버 · 무제한" : `무료 멤버 · 이번 달 ${uses}회 사용`}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", background: "#fff", border: `1px solid ${T.g200}`, borderRadius: 14, overflow: "hidden", marginBottom: 18 }}>
        {stats.map((s, i) => (
          <div key={i} style={{ padding: "16px 12px", textAlign: "center", borderLeft: i > 0 ? `1px solid ${T.g200}` : "none" }}>
            <div style={{ fontSize: 22, fontWeight: 600, color: T.brand, letterSpacing: "-.02em", marginBottom: 4, fontFamily: SANS }}>{s.num}</div>
            <div style={{ fontSize: 12, color: T.g500, fontWeight: 500, fontFamily: SANS }}>{s.lbl}</div>
          </div>
        ))}
      </div>

      {/* Settings list */}
      <div style={{ background: "#fff", border: `1px solid ${T.g200}`, borderRadius: 14, overflow: "hidden" }}>
        {SETTINGS.map((row, i) => (
          <div key={i} style={{ padding: "15px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: i > 0 ? `1px solid ${T.g100}` : "none", cursor: "pointer" }}>
            <span style={{ fontSize: 14.5, color: T.g900, fontWeight: 500, fontFamily: SANS }}>{row.ttl}</span>
            <span style={{ fontSize: 13, color: T.g500, fontWeight: 500, fontFamily: SANS }}>{row.val}</span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 32, textAlign: "center", fontSize: 11, color: T.g400, letterSpacing: ".06em", fontFamily: SANS }}>
        드림바이블 · MMXXVI
      </div>
    </div>
  );
}
