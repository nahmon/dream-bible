# DreamBible Design System — Sanctuary Minimal

## Direction

Scripture-rooted, contemplative. The interface recedes so the Word can speak.
No decoration for its own sake. Warmth through texture and proportion, not color noise.

## Typography

```
Heading (interpretation, Scripture)  — Instrument Serif, italic
Body / UI                            — Pretendard Variable, regular / medium
Label / caption                      — Pretendard Variable, medium, tracked +0.5px
```

Instrument Serif is loaded via Google Fonts (CDN). Pretendard via jsDelivr CDN.

```js
export const SERIF = '"Instrument Serif", Georgia, serif';
export const SANS  = '"Pretendard Variable", Pretendard, -apple-system, system-ui, sans-serif';
```

Type scale:
| Role              | Size  | Weight | Font   |
|-------------------|-------|--------|--------|
| Page title        | 28px  | 400    | Serif  |
| Section heading   | 20px  | 400    | Serif  |
| Interpretation    | 17px  | 400    | Serif  |
| Body              | 15px  | 400    | Sans   |
| Label / button    | 14px  | 500    | Sans   |
| Caption           | 12px  | 400    | Sans   |

## Color Tokens

```js
export const T = {
  // Brand
  brand:      "#1B3A6B",   // navy — primary actions, active states
  brand2:     "#122A4E",   // deep navy — hover, pressed
  brandLight: "#E8EEF8",   // navy tint — selected tab bg

  // Sacred gold — prayer / counsel mode accent
  gold:       "#B07D2A",
  goldLight:  "#F5E9CC",   // gold tint — counsel card bg hint

  // Surface
  bg:         "#FAFAF7",   // warm white — page background
  paper:      "#FFFFFF",   // dream result cards
  parchment:  "#F5F0E8",   // counsel / prayer cards

  // Neutral scale
  g50:  "#F9FAFB",
  g100: "#F2F4F6",
  g200: "#E5E8EB",
  g400: "#B0B8C1",
  g500: "#8B95A1",
  g600: "#6B7684",
  g700: "#4E5968",
  g900: "#191F28",
};
```

## Mode Differentiation

| Attribute      | Dream mode              | Prayer / Counsel mode      |
|----------------|-------------------------|----------------------------|
| Card bg        | `paper` (#FFFFFF)       | `parchment` (#F5F0E8)      |
| Accent color   | `brand` (#1B3A6B)       | `gold` (#B07D2A)           |
| Heading font   | Serif italic            | Serif italic               |
| Image          | AI-generated via API    | Preset static (public/counsel/) |
| Border         | g200                    | `goldLight` (#F5E9CC)      |

## Spacing

Base unit: 4px. All spacing is a multiple of 4.

Common values: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64

## Border Radius

| Element        | Radius |
|----------------|--------|
| Card           | 16px   |
| Button         | 10px   |
| Input          | 10px   |
| Chip / badge   | 999px  |
| Image          | 12px   |

## Shadows

```
card:    0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06)
modal:   0 8px 32px rgba(0,0,0,0.14)
button:  none (flat)
```

## Buttons

Primary (brand):
- bg: brand, text: white, radius: 10px, height: 48px
- hover: brand2

Primary (counsel / gold mode):
- bg: gold, text: white
- hover: darken 10%

Secondary:
- bg: transparent, border: 1.5px g200, text: g700
- hover: bg g50

Disabled:
- bg: g100, text: g400, cursor: not-allowed

## Icons

Use Lucide React. Stroke width: 1.5. Size: 20px default, 16px small, 24px large.
No filled icons. No icon + label repetition — one or the other.

## Animation

- Transitions: 150ms ease (UI state changes)
- Page transitions: 200ms ease-out (fade-in)
- Loading skeleton: pulse, 1.5s ease-in-out infinite
- No bounce, no spring — contemplative, not playful

## Counsel Image Map

Preset images live in `public/counsel/`. Matching logic is in `src/lib/counselImages.js`.

| Theme      | Files                        | Keywords                  |
|------------|------------------------------|---------------------------|
| comfort    | 01-comfort-1..5.jpg          | 위로, 슬픔, grief, lonely |
| healing    | 02-healing-1..5.jpg          | 병, 치유, sick, heal      |
| gratitude  | 03-gratitude-1..5.jpg        | 감사, thankful, blessed   |
| strength   | 04-strength-1..5.jpg         | 힘, 용기, courage         |
| family     | 05-family-1..5.jpg           | 가족, family, marriage    |
| general    | 06-general-1..5.jpg          | (fallback)                |

## Implementation Notes

- All styles are inline (no CSS modules, no Tailwind). Keep this pattern.
- Theme tokens live in `src/lib/theme.js` — import `T` and `SERIF`/`SANS` from there.
- Prayer/counsel mode is detected via `isCounsel` flag passed to ResultScreen.
- Do not introduce a CSS-in-JS library or utility class system.
