import { createClient } from "@supabase/supabase-js";
import { setCors } from "./_lib/cors.js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? process.env.VITE_ADMIN_EMAIL ?? "";

export default async function handler(req, res) {
  setCors(res, req.headers.origin);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { userId } = req.body ?? {};
  if (!userId || !ADMIN_EMAIL) return res.status(403).json({ error: "Forbidden" });

  // Verify user identity via Supabase admin API
  const { data: { user: authUser }, error: authErr } = await supabase.auth.admin.getUserById(userId);
  if (authErr || !authUser || authUser.email !== ADMIN_EMAIL) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const now = new Date();
  const ago = (days) => new Date(now - days * 86400000).toISOString();

  // Fetch last 60 days of events for all calculations
  const { data: events = [] } = await supabase
    .from("user_events")
    .select("user_id, event_type, lang, created_at, input_text")
    .gte("created_at", ago(60))
    .order("created_at", { ascending: false });

  // DAU / WAU / MAU
  const dau = countDistinct(events, ago(1));
  const wau = countDistinct(events, ago(7));
  const mau = countDistinct(events, ago(30));

  // D7 retention: cohort = first used 7–14 days ago; retained = used again in last 7 days
  const { rate: d7Rate, cohortSize: d7Cohort } = retention(events, ago(14), ago(7), ago(7), now.toISOString());

  // D30 retention: cohort = first used 30–60 days ago; retained = used again in last 30 days
  const { rate: d30Rate, cohortSize: d30Cohort } = retention(events, ago(60), ago(30), ago(30), now.toISOString());

  // Daily breakdown last 30 days
  const daily = dailyBreakdown(events, ago(30));

  // Paid users
  const { count: paidCount } = await supabase
    .from("purchases")
    .select("*", { count: "exact", head: true })
    .gt("expires_at", now.toISOString());

  // Totals
  const totalEvents = events.length;
  const totalUsers = new Set(events.map((e) => e.user_id)).size;

  // Recent 20 events
  const recent = events.slice(0, 20).map((e) => ({
    user_id: e.user_id.slice(0, 8) + "…",
    event_type: e.event_type,
    lang: e.lang,
    created_at: e.created_at,
    input_text: e.input_text ?? null,
  }));

  // Breakdown by type
  const interpretCount = events.filter((e) => e.event_type === "interpret").length;
  const counselCount = events.filter((e) => e.event_type === "counsel").length;

  return res.status(200).json({
    dau, wau, mau,
    d7: { rate: d7Rate, cohort: d7Cohort },
    d30: { rate: d30Rate, cohort: d30Cohort },
    paidCount: paidCount ?? 0,
    totalEvents,
    totalUsers,
    interpretCount,
    counselCount,
    daily,
    recent,
  });
}

function countDistinct(events, since) {
  return new Set(events.filter((e) => e.created_at >= since).map((e) => e.user_id)).size;
}

function retention(events, cohortStart, cohortEnd, retainStart, retainEnd) {
  // Users who had ANY event in cohort window
  const cohortUsers = new Set(
    events.filter((e) => e.created_at >= cohortStart && e.created_at < cohortEnd).map((e) => e.user_id)
  );
  if (cohortUsers.size === 0) return { rate: null, cohortSize: 0 };

  // Of those, who also used in the retain window
  const retained = new Set(
    events
      .filter((e) => e.created_at >= retainStart && e.created_at <= retainEnd && cohortUsers.has(e.user_id))
      .map((e) => e.user_id)
  );

  return {
    rate: Math.round((retained.size / cohortUsers.size) * 100),
    cohortSize: cohortUsers.size,
  };
}

function dailyBreakdown(events, since) {
  const map = {};
  events.filter((e) => e.created_at >= since).forEach((e) => {
    const d = e.created_at.slice(0, 10);
    if (!map[d]) map[d] = { users: new Set(), events: 0 };
    map[d].users.add(e.user_id);
    map[d].events++;
  });
  return Object.entries(map)
    .map(([date, v]) => ({ date, dau: v.users.size, events: v.events }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
