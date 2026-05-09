import { useState, useEffect } from "react";
import { T, SANS } from "../lib/theme.js";

function Stat({ label, value, sub }) {
  return (
    <div style={{ background: "#fff", border: `1px solid ${T.g200}`, borderRadius: 12, padding: "16px 14px", textAlign: "center" }}>
      <div style={{ fontSize: 26, fontWeight: 700, color: T.brand, letterSpacing: "-.02em", fontFamily: SANS }}>{value ?? "—"}</div>
      <div style={{ fontSize: 12, fontWeight: 600, color: T.g700, marginTop: 2, fontFamily: SANS }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: T.g400, marginTop: 2, fontFamily: SANS }}>{sub}</div>}
    </div>
  );
}

function RetentionBadge({ label, rate, cohort }) {
  const color = rate == null ? T.g400 : rate >= 40 ? "#16A34A" : rate >= 20 ? "#D97706" : "#DC2626";
  return (
    <div style={{ background: "#fff", border: `1px solid ${T.g200}`, borderRadius: 12, padding: "16px 14px", textAlign: "center" }}>
      <div style={{ fontSize: 26, fontWeight: 700, color, fontFamily: SANS }}>
        {rate == null ? "—" : `${rate}%`}
      </div>
      <div style={{ fontSize: 12, fontWeight: 600, color: T.g700, marginTop: 2, fontFamily: SANS }}>{label}</div>
      {cohort > 0 && <div style={{ fontSize: 11, color: T.g400, marginTop: 2, fontFamily: SANS }}>코호트 {cohort}명</div>}
      {cohort === 0 && <div style={{ fontSize: 11, color: T.g400, marginTop: 2, fontFamily: SANS }}>데이터 없음</div>}
    </div>
  );
}

function MiniBarChart({ data }) {
  if (!data?.length) return null;
  const maxVal = Math.max(...data.map((d) => d.dau), 1);
  const last14 = data.slice(-14);
  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 48 }}>
        {last14.map((d) => (
          <div key={d.date} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <div
              style={{
                width: "100%",
                height: `${Math.max(2, (d.dau / maxVal) * 44)}px`,
                background: T.brand,
                borderRadius: 2,
                opacity: 0.75,
              }}
            />
          </div>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
        <span style={{ fontSize: 10, color: T.g400, fontFamily: SANS }}>{last14[0]?.date?.slice(5)}</span>
        <span style={{ fontSize: 10, color: T.g400, fontFamily: SANS }}>{last14[last14.length - 1]?.date?.slice(5)}</span>
      </div>
    </div>
  );
}

export default function AdminScreen({ userId, onClose }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/admin-stats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    })
      .then((r) => { if (!r.ok) throw new Error("forbidden"); return r.json(); })
      .then(setStats)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [userId]);

  return (
    <div style={{
      position: "fixed", inset: 0, background: T.g50, zIndex: 100,
      overflowY: "auto", fontFamily: SANS,
    }}>
      {/* Header */}
      <div style={{
        position: "sticky", top: 0, background: "#fff", borderBottom: `1px solid ${T.g200}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 16px", height: 52, zIndex: 10,
      }}>
        <span style={{ fontSize: 16, fontWeight: 700, color: T.g900 }}>Admin</span>
        <button
          onClick={onClose}
          style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: 22, color: T.g500, padding: "4px 8px" }}
        >
          ×
        </button>
      </div>

      <div style={{ padding: "20px 16px 80px" }}>
        {loading && (
          <div style={{ textAlign: "center", color: T.g400, marginTop: 80, fontSize: 14 }}>불러오는 중...</div>
        )}
        {error && (
          <div style={{ textAlign: "center", color: "#DC2626", marginTop: 80, fontSize: 14 }}>{error}</div>
        )}
        {stats && (
          <>
            {/* Active Users */}
            <div style={{ fontSize: 12, fontWeight: 700, color: T.g500, letterSpacing: ".06em", marginBottom: 10, textTransform: "uppercase" }}>활성 유저</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 20 }}>
              <Stat label="DAU" value={stats.dau} sub="오늘" />
              <Stat label="WAU" value={stats.wau} sub="7일" />
              <Stat label="MAU" value={stats.mau} sub="30일" />
            </div>

            {/* Retention */}
            <div style={{ fontSize: 12, fontWeight: 700, color: T.g500, letterSpacing: ".06em", marginBottom: 10, textTransform: "uppercase" }}>리텐션</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20 }}>
              <RetentionBadge label="D7 리텐션" rate={stats.d7?.rate} cohort={stats.d7?.cohort} />
              <RetentionBadge label="D30 리텐션" rate={stats.d30?.rate} cohort={stats.d30?.cohort} />
            </div>

            {/* Revenue & Usage */}
            <div style={{ fontSize: 12, fontWeight: 700, color: T.g500, letterSpacing: ".06em", marginBottom: 10, textTransform: "uppercase" }}>수익 / 사용량</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20 }}>
              <Stat label="유료 유저" value={stats.paidCount} sub="활성 구독" />
              <Stat label="총 유저" value={stats.totalUsers} sub="60일 기준" />
              <Stat label="꿈 해몽" value={stats.interpretCount} sub="60일" />
              <Stat label="기도 상담" value={stats.counselCount} sub="60일" />
            </div>

            {/* Daily Chart */}
            {stats.daily?.length > 0 && (
              <>
                <div style={{ fontSize: 12, fontWeight: 700, color: T.g500, letterSpacing: ".06em", marginBottom: 10, textTransform: "uppercase" }}>DAU (최근 14일)</div>
                <div style={{ background: "#fff", border: `1px solid ${T.g200}`, borderRadius: 12, padding: "16px 14px", marginBottom: 20 }}>
                  <MiniBarChart data={stats.daily} />
                </div>
              </>
            )}

            {/* Recent Events */}
            {stats.recent?.length > 0 && (
              <>
                <div style={{ fontSize: 12, fontWeight: 700, color: T.g500, letterSpacing: ".06em", marginBottom: 10, textTransform: "uppercase" }}>최근 이벤트</div>
                <div style={{ background: "#fff", border: `1px solid ${T.g200}`, borderRadius: 12, overflow: "hidden" }}>
                  {stats.recent.map((e, i) => (
                    <div key={i} style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "10px 14px",
                      borderTop: i > 0 ? `1px solid ${T.g100}` : "none",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{
                          fontSize: 10, fontWeight: 700, color: "#fff",
                          background: e.event_type === "interpret" ? T.brand : T.gold,
                          borderRadius: 4, padding: "2px 6px",
                        }}>
                          {e.event_type === "interpret" ? "꿈" : "상담"}
                        </span>
                        <span style={{ fontSize: 12, color: T.g700, fontFamily: "monospace" }}>{e.user_id}</span>
                        <span style={{ fontSize: 11, color: T.g400 }}>{e.lang}</span>
                      </div>
                      <span style={{ fontSize: 11, color: T.g400 }}>
                        {new Date(e.created_at).toLocaleDateString("ko-KR", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {stats.recent?.length === 0 && (
              <div style={{ textAlign: "center", color: T.g400, marginTop: 40, fontSize: 13 }}>
                아직 이벤트 데이터가 없어요.<br />앱 사용 시 자동으로 기록돼요.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
