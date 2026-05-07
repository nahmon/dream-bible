import { L } from "../lang/index.js";
import { signInWithGoogle, signOut, isAdmin } from "../lib/supabase.js";

const SANS = '"Pretendard Variable",Pretendard,-apple-system,BlinkMacSystemFont,system-ui,sans-serif';
const T = {
  brand: "#1B3A6B",
  g50: "#F9FAFB", g100: "#F2F4F6", g200: "#E5E8EB",
  g400: "#B0B8C1", g500: "#8B95A1", g700: "#4E5968", g900: "#191F28",
};

const MONTH_KEY = () => `db_uses_${new Date().toISOString().slice(0, 7)}`;

function computeStreak(entries) {
  if (!entries.length) return 0;
  const days = new Set(entries.map(e => new Date(e.date).toDateString()));
  let streak = 0;
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  while (days.has(d.toDateString())) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

function exportJournal(entries) {
  if (!entries.length) return;
  const lines = entries.map(e => [
    `날짜: ${e.date || ""}`,
    `꿈: ${e.dream || e.text || ""}`,
    e.interpretation ? `해몽: ${e.interpretation}` : null,
    "---",
  ].filter(Boolean).join("\n")).join("\n\n");
  const blob = new Blob([lines], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "my-dreams.txt"; a.click();
  URL.revokeObjectURL(url);
}

export default function MeScreen({ isPaid, uses, user, userId, onReset }) {
  const admin = isAdmin(user);
  const m = L.home.me;
  const entries = JSON.parse(localStorage.getItem("db_journal") || "[]");
  const totalDreams = entries.length;
  const totalInterp = entries.filter(e => e.interpretation).length;
  const streak = computeStreak(entries);

  const stats = [
    { num: totalDreams, lbl: m.statsLabels[0] },
    { num: totalInterp, lbl: m.statsLabels[1] },
    { num: streak, lbl: m.statsLabels[2] },
  ];

  return (
    <div style={{ padding: "24px 20px 100px", fontFamily: SANS }}>

      <div style={{ background: "#fff", border: `1px solid ${T.g200}`, borderRadius: 14, padding: 18, marginBottom: 12, display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: T.brand, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0, overflow: "hidden" }}>
          {user?.user_metadata?.avatar_url
            ? <img src={user.user_metadata.avatar_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : "🙏"}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: T.g900, marginBottom: 2, fontFamily: SANS }}>
            {user?.user_metadata?.full_name || user?.email || m.profileName}
          </div>
          <div style={{ fontSize: 12.5, color: T.g500, fontWeight: 500, fontFamily: SANS }}>
            {admin ? "👑 Admin" : isPaid ? m.profileStatus.paid : m.profileStatus.free(uses)}
          </div>
        </div>
        <button
          onClick={user ? signOut : signInWithGoogle}
          style={{ flexShrink: 0, fontSize: 12.5, fontWeight: 600, color: user ? T.g500 : T.brand, background: user ? T.g100 : "#EEF2FF", border: "none", borderRadius: 8, padding: "7px 14px", cursor: "pointer", fontFamily: SANS }}>
          {user ? m.signOut : m.signIn}
        </button>
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
        {m.settings.map((row, i) => {
          const isAuth = row.action === "auth";
          const isLink = row.action === "link";
          const isExport = row.action === "export";
          const isInvite = row.action === "invite";
          const clickable = isAuth || isLink || isExport || isInvite;
          const handleClick = isAuth
            ? (user ? signOut : signInWithGoogle)
            : isLink
              ? () => window.open(row.url, "_blank")
              : isExport
                ? () => exportJournal(entries)
                : isInvite
                  ? () => {
                      const refCode = (userId || "").slice(0, 8);
                      const url = `https://dreambible.app/?ref=${refCode}`;
                      const msg = m.inviteMsg(url);
                      if (navigator.share) {
                        navigator.share({ text: msg }).catch(() => {});
                      } else {
                        navigator.clipboard.writeText(msg).catch(() => {});
                        alert("클립보드에 복사됐어요!");
                      }
                    }
                  : undefined;
          return (
            <div
              key={i}
              onClick={handleClick}
              style={{
                padding: "15px 18px", display: "flex", alignItems: "center",
                justifyContent: "space-between",
                borderTop: i > 0 ? `1px solid ${T.g100}` : "none",
                cursor: clickable ? "pointer" : "default",
                opacity: clickable ? 1 : 0.45,
              }}>
              <span style={{ fontSize: 14.5, color: isAuth ? T.brand : T.g900, fontWeight: isAuth ? 600 : 500, fontFamily: SANS }}>
                {isAuth ? (user ? m.signOut : m.signIn) : row.ttl}
              </span>
              <span style={{ fontSize: 13, color: T.g500, fontWeight: 500, fontFamily: SANS }}>{row.val}</span>
            </div>
          );
        })}
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
