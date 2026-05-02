import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const PRICE_ID = process.env.STRIPE_PRICE_ID; // ₩4,900/month recurring price
const APP_URL = process.env.APP_URL || "https://dream-bible.vercel.app";

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

export default async function handler(req, res) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: PRICE_ID, quantity: 1 }],
    success_url: `${APP_URL}/?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${APP_URL}/`,
    locale: "auto",
    metadata: { product: "dream-bible-pro" },
  });

  return res.status(200).json({ url: session.url });
}
