// ─── Design Tokens — 성경적 색상 테마 ───
export const C = {
  navy: "#1B2A4A",
  navyLight: "#2D4270",
  gold: "#C9A84C",
  goldLight: "#F5E6C8",
  goldBg: "rgba(201,168,76,0.08)",
  cream: "#FDF6E3",
  white: "#FFFFFF",
  border: "#E8DFC8",
  body: "#6B7B8F",
  label: "#3A4A5C",
  success: "#15be53",
  successBg: "rgba(21,190,83,0.12)",
  error: "#d93025",
  errorBg: "rgba(217,48,37,0.08)",
  bg: "#FDF6E3",
};

export const S = {
  card: "0 4px 16px rgba(27,42,74,0.10)",
  float: "0 8px 24px rgba(27,42,74,0.12), 0 2px 8px rgba(27,42,74,0.05)",
};

export const F = `'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif`;

// ─── Icon System ───
export const Ic = {
  Book:    (p={}) => <svg width={p.s||20} height={p.s||20} viewBox="0 0 20 20" fill="none" stroke={p.c||"currentColor"} strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round"><path d="M4 2h10a2 2 0 012 2v13l-6-3-6 3V4a2 2 0 012-2z"/></svg>,
  Star:    (p={}) => <svg width={p.s||20} height={p.s||20} viewBox="0 0 20 20" fill={p.c||"currentColor"}><path d="M10 2l1.8 5.4H18l-4.9 3.6 1.8 5.4L10 13l-4.9 3.4 1.8-5.4L2 7.4h6.2z"/></svg>,
  Moon:    (p={}) => <svg width={p.s||20} height={p.s||20} viewBox="0 0 20 20" fill="none" stroke={p.c||"currentColor"} strokeWidth="1.65" strokeLinecap="round"><path d="M17 11A7 7 0 019 3a7 7 0 100 14 7 7 0 008-6z"/></svg>,
  Cross:   (p={}) => <svg width={p.s||20} height={p.s||20} viewBox="0 0 20 20" fill="none" stroke={p.c||"currentColor"} strokeWidth="1.65" strokeLinecap="round"><line x1="10" y1="3" x2="10" y2="17"/><line x1="4" y1="8" x2="16" y2="8"/></svg>,
  History: (p={}) => <svg width={p.s||20} height={p.s||20} viewBox="0 0 20 20" fill="none" stroke={p.c||"currentColor"} strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round"><circle cx="10" cy="10" r="8"/><polyline points="10 6 10 10 13 12"/></svg>,
  ChevronRight: (p={}) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 16 16" fill="none" stroke={p.c||"currentColor"} strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4l4 4-4 4"/></svg>,
  Check:   (p={}) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 16 16" fill="none" stroke={p.c||"currentColor"} strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8.5l3 3 7-7"/></svg>,
  Sparkle: (p={}) => <svg width={p.s||20} height={p.s||20} viewBox="0 0 20 20" fill={p.c||"currentColor"}><path d="M10 2l1.6 5.4L17 9l-5.4 1.6L10 16l-1.6-5.4L3 9l5.4-1.6z"/></svg>,
  Lock:    (p={}) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 16 16" fill="none" stroke={p.c||"currentColor"} strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="7" width="10" height="7" rx="1.5"/><path d="M5 7V5a3 3 0 016 0v2"/></svg>,
};
