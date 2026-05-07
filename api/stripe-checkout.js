import Stripe from "stripe";
import { setCors } from "./_lib/cors.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  setCors(res, req);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();

  const { userId } = req.body ?? {};
  if (!userId) return res.status(400).json({ error: "userId required" });

  const baseUrl = req.headers.origin ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:5173");

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: baseUrl,
      client_reference_id: userId,
      metadata: { userId },
    });
    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err?.message);
    return res.status(500).json({ error: "Failed to create checkout session. Please try again." });
  }
}
