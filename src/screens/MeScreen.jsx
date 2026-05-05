import { L } from "../lang/index.js";

const SANS = '"Pretendard Variable",Pretendard,-apple-system,BlinkMacSystemFont,system-ui,sans-serif';
const T = {
  brand: "#1B3A6B",
  g50: "#F9FAFB", g100: "#F2F4F6", g200: "#E5E8EB",
  g400: "#B0B8C1", g500: "#8B95A1", g700: "#4E5968", g900: "#191F28",
};

const MONTH_KEY = () => `db_uses_${new Date().toISOString().slice(0, 7)}`;

export default function MeScreen({ isPaid, uses, onReset }) {
  const m = L.home.me;
  const entries = JSON.parse(localStorage.getItem("db_journal") || "[]");
  const totalDreams = entries.length;
  const totalInterp = entries.filter(e => e.interpretation).length;

  const stats = [
    { num: totalDreams, lbl: m.statsLabels[0] },
    { num: totalInterp, lbl: m.statsLabels[1] },
    { num: 0, lbl: m.statsLabels[2] },
  ];

  return (
    <div style={{ padding: "24px 20px 100px", fontFamily: SANS }}>

      <div style={{ background: "#fff", border: `1px solid ${T.g200}`, borderRadius: 14, padding: 18, marginBottom: 12, display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: T.brand, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
          🙏
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 600, color: T.g900, marginBottom: 2, fontFamily: SANS }}>{m.profileName}</div>
          <div style={{ fontSize: 12.5, color: T.g500, fontWeight: 500, fontFamily: SANS }}>
            {isPaid ? m.profileStatus.paid : m.profileStatus.free(uses)}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", background: "#fff", border: `1px solid ${T.g200}`, borderRadius: 14, overflow: "hidden", marginBottom: 18 }}>
        {stats.map((s, i) => (
          <div key={i} style={{ padding: "16px 12px", textAlign: "center", borderLeft: i > 0 ? `1px solid ${T.g200}` : "none" }}>
            <div style={{ fontSize: 22, fontWeight: 600, color: T.brand, letterSpacing: "-.02em", marginBottom: 4, fontFamily: SANS }}>{s.num}</div>
            <div style={{ fontSize: 12, color: T.g500, fontWeight: 500, fontFamily: SANS }}>{s.lbl}</div>
          </div>
        ))}
      </div>

      <div style={{ background: "#fff", border: `1px solid ${T.g200}`, borderRadius: 14, overflow: "hidden" }}>
        {m.settings.map((row, i) => (
          <div key={i} style={{ padding: "15px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: i > 0 ? `1px solid ${T.g100}` : "none", cursor: "pointer" }}>
            <span style={{ fontSize: 14.5, color: T.g900, fontWeight: 500, fontFamily: SANS }}>{row.ttl}</span>
            <span style={{ fontSize: 13, color: T.g500, fontWeight: 500, fontFamily: SANS }}>{row.val}</span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 32, textAlign: "center", fontSize: 11, color: T.g400, letterSpacing: ".06em", fontFamily: SANS }}>
        {m.appName} · MMXXVI
      </div>

      {import.meta.env.DEV && (
        <div style={{ marginTop: 24, display: "flex", gap: 8, justifyContent: "center" }}>
          <button
            onClick={() => {
              localStorage.removeItem(MONTH_KEY());
              localStorage.removeItem("db_paid");
              localStorage.removeItem("db_paid_until");
              onReset?.();
            }}
            style={{ fontSize: 12, color: T.g400, background: "transparent", border: `1px solid ${T.g200}`, borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontFamily: SANS }}>
            {m.devReset}
          </button>
          <button
            onClick={() => {
              const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
              localStorage.setItem("db_paid", "true");
              localStorage.setItem("db_paid_until", expiresAt);
              onReset?.("paid");
            }}
            style={{ fontSize: 12, color: "#fff", background: T.brand, border: "none", borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontFamily: SANS }}>
            {m.devPaid}
          </button>
        </div>
      )}
    </div>
  );
}
