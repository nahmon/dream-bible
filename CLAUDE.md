## Design System

See [DESIGN.md](./DESIGN.md) for the full design system reference.

Tokens: `src/lib/theme.js` — import `T` for colors, `SERIF`/`SANS` for typography.

Key rules:
- All styles are inline. No CSS modules, no utility classes.
- Dream mode: `T.paper` cards, `T.brand` accent
- Prayer/counsel mode: `T.parchment` cards, `T.gold` accent
- Headings use `SERIF` (Instrument Serif italic). Body/UI uses `SANS` (Pretendard).
- No emojis in UI text.

## Skill routing

When the user's request matches an available skill, ALWAYS invoke it using the Skill
tool as your FIRST action. Do NOT answer directly, do NOT use other tools first.

Key routing rules:
- Product ideas, brainstorming → invoke office-hours
- Bugs, errors, "why is this broken" → invoke investigate
- Ship, deploy, push, create PR → invoke ship
- QA, test the site, find bugs → invoke qa
- Code review, check my diff → invoke review
- Design system, brand → invoke design-consultation
- Visual audit, design polish → invoke design-review
