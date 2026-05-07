import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
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

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const sig = req.headers["stripe-signature"];
  const buf = await buffer(req);

  let event;
  try {
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return res.status(400).json({ error: "Invalid webhook signature" });
  }

  const upsertSubscription = async (userId, expiresAt, active) => {
    if (!userId) return;
    await supabase.from("purchases").upsert(
      { user_id: userId, expires_at: expiresAt, active },
      { onConflict: "user_id" }
    );
  };

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.metadata?.userId || session.client_reference_id;
    const subId = session.subscription;
    if (subId && userId) {
      // Propagate userId into subscription metadata so future events can resolve it
      await stripe.subscriptions.update(subId, { metadata: { userId } });
      const sub = await stripe.subscriptions.retrieve(subId);
      const expiresAt = new Date(sub.current_period_end * 1000).toISOString();
      await upsertSubscription(userId, expiresAt, true);
    }
  }

  if (event.type === "customer.subscription.updated") {
    const sub = event.data.object;
    const userId = sub.metadata?.userId;
    const expiresAt = new Date(sub.current_period_end * 1000).toISOString();
    const active = sub.status === "active" || sub.status === "trialing";
    await upsertSubscription(userId, expiresAt, active);
  }

  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object;
    const userId = sub.metadata?.userId;
    await upsertSubscription(userId, new Date().toISOString(), false);
  }

  return res.status(200).json({ received: true });
}
