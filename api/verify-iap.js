import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

export default async function handler(req, res) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();

  const { orderId, userId } = req.body ?? {};
  if (!orderId || !userId) return res.status(400).json({ error: "orderId and userId required" });

  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const { error } = await supabase.from("purchases").upsert(
    { user_id: userId, order_id: orderId, expires_at: expiresAt },
    { onConflict: "order_id" }
  );

  if (error) {
    console.error("Supabase upsert error:", error.message);
    return res.status(500).json({ error: "failed to record purchase" });
  }

  return res.status(200).json({ granted: true, orderId, expiresAt });
}
