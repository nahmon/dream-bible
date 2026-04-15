import { useState, useCallback, createContext, useContext } from "react";
import { C, F, S } from "../lib/constants.jsx";

// ─── Toast ───────────────────────────────────────────────────────────────────
const ToastCtx = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const showToast = useCallback((message, variant = "info") => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, message, variant }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3200);
  }, []);
  const bg = { success: "#1e8e3e", error: C.error, info: C.navy, warning: C.gold };
  return (
    <ToastCtx.Provider value={{ showToast }}>
      {children}
      <div style={{ position: "fixed", bottom: "calc(28px + env(safe-area-inset-bottom,0px))", left: "50%", transform: "translateX(-50%)", zIndex: 9999, display: "flex", flexDirection: "column", gap: 8, alignItems: "center", pointerEvents: "none" }}>
        <style>{`@keyframes toast-in{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>
        {toasts.map(t => (
          <div key={t.id} style={{ background: bg[t.variant] ?? C.navy, color: "#fff", padding: "10px 18px", borderRadius: 10, fontSize: 13, fontFamily: F, fontWeight: 500, boxShadow: S.float, whiteSpace: "nowrap", animation: "toast-in 0.22s ease" }}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) {
    console.warn("useToast called outside ToastProvider — toasts will not display");
    return { showToast: () => {} };
  }
  return ctx;
}

// ─── Button ──────────────────────────────────────────────────────────────────
export function Btn({ children, variant = "primary", size = "md", onClick, disabled, full, style: sx = {} }) {
  const [hov, setHov] = useState(false);
  const sz = {
    sm: { padding: "6px 14px", fontSize: 13 },
    md: { padding: "10px 22px", fontSize: 15 },
    lg: { padding: "14px 36px", fontSize: 17 },
  };
  const vr = {
    primary: { background: disabled ? "#8E9BB3" : hov ? C.navyLight : C.navy, color: "#fff", border: "none" },
    gold:    { background: disabled ? "#DDD0A8" : hov ? "#B8973B" : C.gold, color: "#fff", border: "none" },
    ghost:   { background: hov ? C.goldBg : "transparent", color: C.navy, border: `1px solid ${C.border}` },
    text:    { background: "transparent", color: hov ? C.gold : C.navy, border: "none" },
  };
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, borderRadius: 9999, cursor: disabled ? "not-allowed" : "pointer", fontFamily: F, fontWeight: 500, transition: "all 0.18s", width: full ? "100%" : "auto", ...sz[size], ...vr[variant], ...sx }}
    >
      {children}
    </button>
  );
}

// ─── Input ───────────────────────────────────────────────────────────────────
export function Input({ label, type = "text", placeholder, value, onChange, helper }) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      {label && <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: C.label, marginBottom: 6, fontFamily: F }}>{label}</label>}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{ width: "100%", padding: "11px 14px", borderRadius: 8, border: `1px solid ${focused ? C.gold : C.border}`, fontSize: 16, fontFamily: F, color: C.navy, outline: focused ? `2px solid ${C.goldLight}` : "none", outlineOffset: 2, boxSizing: "border-box", background: C.white, transition: "border-color 0.15s" }}
      />
      {helper && <div style={{ fontSize: 12, color: C.body, marginTop: 4, fontFamily: F }}>{helper}</div>}
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
export function Skeleton({ width = "100%", height = 16, borderRadius = 6, style: sx = {} }) {
  return (
    <>
      <style>{`@keyframes shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}`}</style>
      <div style={{ width, height, borderRadius, background: "linear-gradient(90deg,#e8dfc8 25%,#f5edd8 50%,#e8dfc8 75%)", backgroundSize: "800px 100%", animation: "shimmer 1.4s infinite linear", ...sx }} />
    </>
  );
}

// ─── Card ────────────────────────────────────────────────────────────────────
export function Card({ children, style: sx = {}, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => onClick && setHov(true)}
      onMouseLeave={() => onClick && setHov(false)}
      style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: "20px 24px", boxShadow: hov && onClick ? S.card : "none", transition: "box-shadow 0.2s", cursor: onClick ? "pointer" : "default", ...sx }}
    >
      {children}
    </div>
  );
}
