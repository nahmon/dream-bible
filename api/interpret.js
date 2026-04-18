import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `You are a biblical dream reflection guide rooted in Scripture.
When a user shares a dream, respond according to these principles:

1. Quote 2–3 actual Bible verses related to dreams and visions (e.g. Joel 2:28, Genesis 37, Daniel 2, Matthew 1:20). Use NIV or ESV.
2. Explain the key symbolic elements of the dream from a biblical perspective
3. Approach from a lens of prayerful meditation on God's Word — never prophecy or divination
4. Avoid definitive statements like "this dream means X". Use open language: "Scripture invites us to reflect...", "we can meditate on...", "this may echo..."
5. End with a suggested prayer focus or a specific Scripture passage to meditate on
6. Keep the full response to 300–500 words in English

Response format:
**Dream Reflection**
(Biblical reflection on the dream's meaning and symbols)

**Related Scripture**
- Verse 1 (Book Chapter:Verse — translation)
- Verse 2 (Book Chapter:Verse — translation)
- Verse 3 (Book Chapter:Verse — translation, optional)

**Prayer Focus**
(A brief prayer intention or Scripture to sit with today)`;

function buildImagePrompt(dreamText) {
  const trimmed = dreamText.trim().slice(0, 200);
  return `A serene biblical illuminated manuscript illustration inspired by this dream: "${trimmed}". Style: classical Renaissance painting with gold leaf accents, warm heavenly amber light streaming from above, soft celestial clouds, symbolic Christian imagery, peaceful and contemplative atmosphere, rich jewel-toned colors, detailed spiritual artwork. No text, no writing.`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { dream_text } = req.body ?? {};

  if (!dream_text?.trim()) {
    return res.status(400).json({ error: "dream_text is required" });
  }
  if (dream_text.trim().length < 10) {
    return res.status(400).json({ error: "Please describe your dream in a bit more detail (at least 10 characters)" });
  }
  if (dream_text.trim().length > 2000) {
    return res.status(400).json({ error: "Please keep your dream description under 2,000 characters" });
  }

  // Run interpretation and image generation in parallel
  const [interpretResult, imageResult] = await Promise.allSettled([
    openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `My dream:\n${dream_text.trim()}` },
      ],
      max_tokens: 800,
      temperature: 0.7,
    }),
    openai.images.generate({
      model: "dall-e-3",
      prompt: buildImagePrompt(dream_text),
      size: "1024x1024",
      quality: "standard",
      n: 1,
    }),
  ]);

  if (interpretResult.status === "rejected") {
    console.error("OpenAI interpret error:", interpretResult.reason);
    return res.status(500).json({ error: "Something went wrong generating your interpretation. Please try again." });
  }

  const interpretation = interpretResult.value.choices[0]?.message?.content ?? "";
  const image_url = imageResult.status === "fulfilled"
    ? imageResult.value.data[0]?.url ?? null
    : null;

  if (imageResult.status === "rejected") {
    console.warn("Image generation failed (non-fatal):", imageResult.reason?.message);
  }

  return res.status(200).json({ interpretation, image_url });
}
