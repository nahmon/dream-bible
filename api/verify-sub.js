import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { session_id } = req.body ?? {};
  if (!session_id) return res.status(400).json({ error: "session_id required" });

  const session = await stripe.checkout.sessions.retrieve(session_id, {
    expand: ["subscription"],
  });

  const active = session.subscription?.status === "active" ||
                 session.subscription?.status === "trialing";

  return res.status(200).json({
    active,
    customer_id: session.customer ?? null,
    email: session.customer_details?.email ?? null,
  });
}
