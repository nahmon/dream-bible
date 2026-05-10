import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const FREE_LIMIT = 3;

const ADMIN_USER_IDS = new Set(
  (process.env.ADMIN_USER_IDS ?? "").split(",").map((s) => s.trim()).filter(Boolean)
);

function currentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export async function checkAndIncrementUsage(userId) {
  if (!userId) return { allowed: false, isPaid: false, remaining: 0 };

  if (ADMIN_USER_IDS.has(userId)) {
    return { allowed: true, isPaid: true, isAdmin: true };
  }

  // Check active subscription first
  const { data: sub } = await supabase
    .from("purchases")
    .select("expires_at, active")
    .eq("user_id", userId)
    .gt("expires_at", new Date().toISOString())
    .order("expires_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (sub) {
    return { allowed: true, isPaid: true };
  }

  // Anonymous user: check usage against free limit
  const month = currentMonth();
  const { data: usage } = await supabase
    .from("anon_usage")
    .select("count")
    .eq("user_id", userId)
    .eq("month", month)
    .maybeSingle();

  const count = usage?.count ?? 0;

  if (count >= FREE_LIMIT) {
    return { allowed: false, isPaid: false, remaining: 0 };
  }

  await supabase
    .from("anon_usage")
    .upsert(
      { user_id: userId, month, count: count + 1 },
      { onConflict: "user_id,month" }
    );

  return { allowed: true, isPaid: false, remaining: FREE_LIMIT - count - 1 };
}

export async function logEvent(userId, eventType, lang = "ko", inputText = null) {
  if (!userId) return;
  const row = { user_id: userId, event_type: eventType, lang };
  if (inputText) row.input_text = inputText.slice(0, 1000);
  await supabase.from("user_events").insert(row).catch(() => {});
}
