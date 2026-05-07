import { setCors } from "./_lib/cors.js";

export default async function handler(req, res) {
  setCors(res, req);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();

  const { userId } = req.body ?? {};
  if (!userId) return res.status(400).json({ error: "userId required" });

  const baseUrl = req.headers.origin ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:5173");

  try {
    const response = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.LEMONSQUEEZY_API_KEY}`,
        "Content-Type": "application/vnd.api+json",
        "Accept": "application/vnd.api+json",
      },
      body: JSON.stringify({
        data: {
          type: "checkouts",
          attributes: {
            checkout_data: {
              custom: { userId },
            },
            product_options: {
              redirect_url: `${baseUrl}/?paid=1`,
            },
          },
          relationships: {
            store: {
              data: { type: "stores", id: process.env.LEMONSQUEEZY_STORE_ID },
            },
            variant: {
              data: { type: "variants", id: process.env.LEMONSQUEEZY_VARIANT_ID },
            },
          },
        },
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err?.errors?.[0]?.detail || "LS API error");
    }

    const data = await response.json();
    const url = data.data?.attributes?.url;
    return res.status(200).json({ url });
  } catch (err) {
    console.error("Lemon Squeezy checkout error:", err?.message);
    return res.status(500).json({ error: "Failed to create checkout session. Please try again." });
  }
}
