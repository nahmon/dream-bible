// ─── Design Tokens — Apple Design System ───
export const C = {
  // Core Apple palette
  heroBlack: "#000000",
  nearBlack: "#1d1d1f",
  gray: "#f5f5f7",
  white: "#ffffff",
  blue: "#0071e3",
  blueHover: "#0077ed",
  blueDark: "#0066cc",
  blueBright: "#2997ff",
  darkSurface: "#272729",

  // Semantic aliases (keep existing names for screen compatibility)
  navy: "#1d1d1f",
  navyLight: "#272729",
  gold: "#0071e3",           // → Apple Blue CTA
  goldLight: "rgba(0,113,227,0.15)",
  goldBg: "rgba(0,113,227,0.06)",
  cream: "#f5f5f7",          // → Apple light gray
  border: "#d2d2d7",
  body: "rgba(0,0,0,0.56)",
  label: "#1d1d1f",
  success: "#1e8e3e",
  successBg: "rgba(30,142,62,0.10)",
  error: "#d93025",
  errorBg: "rgba(217,48,37,0.08)",
  bg: "#f5f5f7",
};

export const S = {
  card: "rgba(0,0,0,0.12) 0px 2px 16px 0px",
  float: "rgba(0,0,0,0.22) 3px 5px 30px 0px",
};

export const F = `'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Arial, sans-serif`;

// ─── Icon System ───
export const Ic = {
  Book:    (p={}) => <svg width={p.s||20} height={p.s||20} viewBox="0 0 20 20" fill="none" stroke={p.c||"currentColor"} strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round"><path d="M4 2h10a2 2 0 012 2v13l-6-3-6 3V4a2 2 0 012-2z"/></svg>,
  Star:    (p={}) => <svg width={p.s||20} height={p.s||20} viewBox="0 0 20 20" fill={p.c||"currentColor"}><path d="M10 2l1.8 5.4H18l-4.9 3.6 1.8 5.4L10 13l-4.9 3.4 1.8-5.4L3 9l5.4-1.6z"/></svg>,
  Moon:    (p={}) => <svg width={p.s||20} height={p.s||20} viewBox="0 0 20 20" fill="none" stroke={p.c||"currentColor"} strokeWidth="1.65" strokeLinecap="round"><path d="M17 11A7 7 0 019 3a7 7 0 100 14 7 7 0 008-6z"/></svg>,
  Cross:   (p={}) => <svg width={p.s||20} height={p.s||20} viewBox="0 0 20 20" fill="none" stroke={p.c||"currentColor"} strokeWidth="1.65" strokeLinecap="round"><line x1="10" y1="3" x2="10" y2="17"/><line x1="4" y1="8" x2="16" y2="8"/></svg>,
  History: (p={}) => <svg width={p.s||20} height={p.s||20} viewBox="0 0 20 20" fill="none" stroke={p.c||"currentColor"} strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round"><circle cx="10" cy="10" r="8"/><polyline points="10 6 10 10 13 12"/></svg>,
  ChevronRight: (p={}) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 16 16" fill="none" stroke={p.c||"currentColor"} strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4l4 4-4 4"/></svg>,
  Check:   (p={}) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 16 16" fill="none" stroke={p.c||"currentColor"} strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8.5l3 3 7-7"/></svg>,
  Sparkle: (p={}) => <svg width={p.s||20} height={p.s||20} viewBox="0 0 20 20" fill={p.c||"currentColor"}><path d="M10 2l1.6 5.4L17 9l-5.4 1.6L10 16l-1.6-5.4L3 9l5.4-1.6z"/></svg>,
  Lock:    (p={}) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 16 16" fill="none" stroke={p.c||"currentColor"} strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="7" width="10" height="7" rx="1.5"/><path d="M5 7V5a3 3 0 016 0v2"/></svg>,
};
