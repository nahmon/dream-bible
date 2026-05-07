import { createClient } from "@supabase/supabase-js";
import { setCors } from "./_lib/cors.js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  setCors(res, req);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();

  const { userId } = req.body ?? {};
  if (!userId) return res.status(400).json({ error: "userId required" });

  const { data, error } = await supabase
    .from("purchases")
    .select("expires_at")
    .eq("user_id", userId)
    .gt("expires_at", new Date().toISOString())
    .order("expires_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Supabase query error:", error.message);
    return res.status(500).json({ error: "query failed" });
  }

  return res.status(200).json({
    isPaid: !!data,
    expiresAt: data?.expires_at ?? null,
  });
}
