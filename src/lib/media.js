export const MUSIC_TRACKS = [
  "https://cdn1.suno.ai/5QQOxOWbfamTaSyk.mp3",
  "https://cdn1.suno.ai/ivHmH80ANV3fVKQz.mp3",
  "https://cdn1.suno.ai/lbTtVLAP6HFoekE9.mp3",
  "https://cdn1.suno.ai/YoRmzUgO5rsXsTyG.mp3",
  "https://cdn1.suno.ai/4zeOhuBMCuYWRcYK.mp3",
];

export function buildImagePrompt(dreamText) {
  const trimmed = dreamText.trim().slice(0, 200);
  return `A serene biblical illuminated manuscript illustration inspired by this dream: "${trimmed}". Style: classical Renaissance painting with gold leaf accents, warm heavenly amber light streaming from above, soft celestial clouds, symbolic Christian imagery, peaceful and contemplative atmosphere, rich jewel-toned colors, detailed spiritual artwork. No text, no writing, no letters.`;
}

export function randomTrack() {
  return MUSIC_TRACKS[Math.floor(Math.random() * MUSIC_TRACKS.length)];
}
