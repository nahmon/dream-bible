import { GoogleGenAI } from "@google/genai";
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, "../public/counsel");

const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

mkdirSync(OUTPUT_DIR, { recursive: true });

const BASE_STYLE =
  "Classical Renaissance oil painting style, warm golden divine light, luminous heavenly atmosphere, rich jewel-toned colors, detailed fine art, peaceful and contemplative, inspired by Rembrandt and Caravaggio, no text, no letters";

const IMAGES = [
  // comfort (위로/관계)
  {
    id: "01-comfort-1",
    prompt: `A gentle light breaking through storm clouds over a solitary figure kneeling in prayer on a hillside, divine radiance descending from heaven, symbolizing God's comfort in times of grief. ${BASE_STYLE}`,
  },
  {
    id: "01-comfort-2",
    prompt: `Two hands reaching toward each other across a chasm of darkness, one bathed in warm golden divine light, symbolizing reconciliation and restored relationships through God's grace. ${BASE_STYLE}`,
  },
  {
    id: "01-comfort-3",
    prompt: `A lone candle burning brightly in a dark stone chapel, its soft warm glow illuminating an open Bible on an ancient wooden altar, symbolizing God's word as comfort in loneliness. ${BASE_STYLE}`,
  },
  {
    id: "01-comfort-4",
    prompt: `A tender scene of a shepherd cradling an injured lamb against his chest, surrounded by lush green pastures bathed in golden sunset light, symbolizing God's compassionate care. ${BASE_STYLE}`,
  },
  {
    id: "01-comfort-5",
    prompt: `A figure wrapped in a radiant cloak of light standing at the edge of a stormy sea, waves calming as heavenly peace descends, symbolizing God's presence in turbulent times. ${BASE_STYLE}`,
  },

  // healing (치유/평화)
  {
    id: "02-healing-1",
    prompt: `A serene still pool reflecting a luminous sky filled with rays of divine light, white doves descending gracefully, surrounded by blooming lilies, symbolizing spiritual healing and inner peace. ${BASE_STYLE}`,
  },
  {
    id: "02-healing-2",
    prompt: `An ancient olive tree with glowing golden leaves in a peaceful garden at dawn, soft mist rising from the ground, a single beam of heavenly light illuminating the gnarled trunk, symbolizing restoration. ${BASE_STYLE}`,
  },
  {
    id: "02-healing-3",
    prompt: `A figure emerging from darkness into brilliant heavenly light with hands raised in praise, broken chains falling away, symbolizing healing from spiritual and emotional wounds. ${BASE_STYLE}`,
  },
  {
    id: "02-healing-4",
    prompt: `A crystal river flowing through a lush valley of blooming flowers, warm golden light streaming from above, a white dove resting on a stone in the water, symbolizing the peace of God that surpasses understanding. ${BASE_STYLE}`,
  },
  {
    id: "02-healing-5",
    prompt: `A magnificent sunrise over rolling hills with a lone cross silhouetted against the glowing sky, rays of amber and gold light radiating outward, symbolizing healing through Christ's sacrifice. ${BASE_STYLE}`,
  },

  // gratitude (감사/축복)
  {
    id: "03-gratitude-1",
    prompt: `An abundant harvest scene with overflowing baskets of fruit and grain bathed in warm golden light, a figure raising hands in gratitude toward a radiant heavenly sky, symbolizing God's blessings and thankfulness. ${BASE_STYLE}`,
  },
  {
    id: "03-gratitude-2",
    prompt: `A majestic mountain peak catching the first light of dawn, vast valleys spread below, a small figure kneeling at the summit in prayer, the sky ablaze with amber, rose, and gold hues, symbolizing awe and gratitude. ${BASE_STYLE}`,
  },
  {
    id: "03-gratitude-3",
    prompt: `An ancient stone altar covered with wildflowers and offerings, surrounded by tall oak trees, divine light descending from a parting in the clouds above, symbolizing worship and thanksgiving to God. ${BASE_STYLE}`,
  },
  {
    id: "03-gratitude-4",
    prompt: `A woman dancing joyfully in a field of golden wheat under a brilliant blue sky, arms outstretched toward heaven, sunlight creating a halo effect around her, symbolizing pure joy and gratitude. ${BASE_STYLE}`,
  },
  {
    id: "03-gratitude-5",
    prompt: `A grand cathedral interior filled with cascading light through stained glass windows, illuminating a congregation with heads bowed in grateful prayer, golden dust particles floating in heavenly beams. ${BASE_STYLE}`,
  },

  // strength (힘/용기)
  {
    id: "04-strength-1",
    prompt: `An eagle soaring majestically above storm clouds, wings spread wide catching divine golden light from above the tempest, the sun breaking through in brilliant rays, symbolizing strength renewed through God. ${BASE_STYLE}`,
  },
  {
    id: "04-strength-2",
    prompt: `A mighty oak tree standing firm in a fierce storm, its deep roots holding, lightning illuminating the dramatic sky, yet the tree unmoved and strong, symbolizing steadfast faith in adversity. ${BASE_STYLE}`,
  },
  {
    id: "04-strength-3",
    prompt: `An armored warrior standing on a hilltop at dawn, sword raised toward a brilliant sunrise, the armor gleaming with divine light, symbolizing spiritual warfare and the armor of God. ${BASE_STYLE}`,
  },
  {
    id: "04-strength-4",
    prompt: `A figure crossing turbulent waters on stepping stones of light, each stone glowing as a footstep falls, the path illuminated ahead by a pillar of heavenly fire, symbolizing courage through faith. ${BASE_STYLE}`,
  },
  {
    id: "04-strength-5",
    prompt: `A young shepherd with a sling standing before an enormous shadow, bathed in divine light while darkness retreats, symbolizing courage and God's empowering strength in the face of giants. ${BASE_STYLE}`,
  },

  // family (가족/사랑)
  {
    id: "05-family-1",
    prompt: `A warm multigenerational family gathered around a glowing table for evening prayer, candlelight illuminating faces of grandparents, parents, and children, golden light filling the room, symbolizing God's blessing on the home. ${BASE_STYLE}`,
  },
  {
    id: "05-family-2",
    prompt: `A parent and child walking hand in hand along a golden path through a flowering meadow toward a brilliant sunrise, symbolizing parental love and guidance in God's light. ${BASE_STYLE}`,
  },
  {
    id: "05-family-3",
    prompt: `Two figures embracing under a tree heavy with fruit and blossoms, a gentle breeze scattering petals, warm golden light enveloping them, symbolizing love, covenant, and God's blessing on relationships. ${BASE_STYLE}`,
  },
  {
    id: "05-family-4",
    prompt: `A mother cradling a newborn in soft candlelight, surrounded by white flowers, a beam of heavenly light descending gently, symbolizing the miracle of new life and God's gift of children. ${BASE_STYLE}`,
  },
  {
    id: "05-family-5",
    prompt: `A family silhouette on a hilltop watching a magnificent sunset, arms around each other, the sky painted in deep golds and purples, a dove crossing the horizon, symbolizing family unity under God. ${BASE_STYLE}`,
  },

  // general (일반 기도)
  {
    id: "06-general-1",
    prompt: `Hands clasped in prayer bathed in a cone of heavenly white light descending from above, surrounded by soft golden glow, a subtle cross of light forming in the background, symbolizing the act of prayer and divine connection. ${BASE_STYLE}`,
  },
  {
    id: "06-general-2",
    prompt: `An open Bible on a window ledge, soft morning light streaming in, a single white lily beside it, peaceful countryside visible through the window, symbolizing God's Word as daily bread and morning devotion. ${BASE_STYLE}`,
  },
  {
    id: "06-general-3",
    prompt: `A massive ancient door of gold and cedar slowly opening to reveal brilliant divine light beyond, a figure standing in awe before it, symbolizing God's open invitation to prayer and communion. ${BASE_STYLE}`,
  },
  {
    id: "06-general-4",
    prompt: `A night sky filled with countless stars above a small stone chapel with a single lit window, the Milky Way stretching overhead, symbolizing God's vast creation and faithfulness through all seasons. ${BASE_STYLE}`,
  },
  {
    id: "06-general-5",
    prompt: `A peaceful monastery garden with a stone fountain, roses in bloom, a wooden bench under a gnarled olive tree, late afternoon light casting long golden rays, symbolizing rest and contemplation in God's presence. ${BASE_STYLE}`,
  },
];

async function generateImage(id, prompt) {
  console.log(`Generating ${id}...`);
  const response = await genai.models.generateImages({
    model: "imagen-4.0-fast-generate-001",
    prompt,
    config: { numberOfImages: 1, outputMimeType: "image/jpeg", aspectRatio: "1:1", safetySetting: "BLOCK_ONLY_HIGH" },
  });
  const bytes = response.generatedImages?.[0]?.image?.imageBytes;
  if (!bytes) throw new Error(`No image returned for ${id}`);
  writeFileSync(join(OUTPUT_DIR, `${id}.jpg`), Buffer.from(bytes, "base64"));
  console.log(`  ✓ Saved ${id}.jpg`);
}

async function main() {
  const [, , startIdx] = process.argv;
  const start = startIdx ? parseInt(startIdx, 10) : 0;
  const batch = IMAGES.slice(start);

  console.log(`Generating ${batch.length} images starting from index ${start}...\n`);

  for (const { id, prompt } of batch) {
    try {
      await generateImage(id, prompt);
      await new Promise((r) => setTimeout(r, 7000)); // 7s delay → ~8/min (under 10/min limit)
    } catch (err) {
      console.error(`  ✗ Failed ${id}:`, err.message);
    }
  }

  console.log("\nDone!");
}

main();
