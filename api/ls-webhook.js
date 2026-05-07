import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const config = { api: { bodyParser: false } };

async function buffer(readable) {
  const chunks = [];
  for await (const chunk of readable) chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  return Buffer.concat(chunks);
}

const upsertSubscription = async (userId, expiresAt, active) => {
  if (!userId) return;
  await supabase.from("purchases").upsert(
    { user_id: userId, expires_at: expiresAt, active },
    { onConflict: "user_id" }
  );
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const sig = req.headers["x-signature"];
  const buf = await buffer(req);

  const hmac = crypto.createHmac("sha256", process.env.LEMONSQUEEZY_WEBHOOK_SECRET);
  const digest = hmac.update(buf).digest("hex");
  if (sig !== digest) {
    return res.status(400).json({ error: "Invalid webhook signature" });
  }

  const event = JSON.parse(buf.toString());
  const eventName = event.meta?.event_name;
  const userId = event.meta?.custom_data?.userId;
  const attrs = event.data?.attributes;

  if (eventName === "order_created" || eventName === "subscription_created") {
    const endsAt = attrs?.ends_at || attrs?.renews_at;
    const expiresAt = endsAt
      ? new Date(endsAt).toISOString()
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    await upsertSubscription(userId, expiresAt, true);
  }

  if (eventName === "subscription_updated") {
    const active = attrs?.status === "active";
    const endsAt = attrs?.ends_at || attrs?.renews_at;
    const expiresAt = endsAt ? new Date(endsAt).toISOString() : new Date().toISOString();
    await upsertSubscription(userId, expiresAt, active);
  }

  if (eventName === "subscription_cancelled" || eventName === "subscription_expired") {
    await upsertSubscription(userId, new Date().toISOString(), false);
  }

  return res.status(200).json({ received: true });
}
