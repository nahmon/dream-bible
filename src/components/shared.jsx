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
  const bg = { success: "#1e8e3e", error: C.error, info: C.nearBlack, warning: C.blue };
  return (
    <ToastCtx.Provider value={{ showToast }}>
      {children}
      <div style={{ position: "fixed", bottom: "calc(28px + env(safe-area-inset-bottom,0px))", left: "50%", transform: "translateX(-50%)", zIndex: 9999, display: "flex", flexDirection: "column", gap: 8, alignItems: "center", pointerEvents: "none" }}>
        <style>{`@keyframes toast-in{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>
        {toasts.map(t => (
          <div key={t.id} style={{ background: bg[t.variant] ?? C.nearBlack, color: "#fff", padding: "10px 18px", borderRadius: 10, fontSize: 13, fontFamily: F, fontWeight: 500, boxShadow: S.float, whiteSpace: "nowrap", animation: "toast-in 0.22s ease" }}>
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
    lg: { padding: "14px 28px", fontSize: 17 },
  };
  const vr = {
    primary:   { background: disabled ? "rgba(0,113,227,0.4)" : hov ? C.blueHover : C.blue, color: "#fff", border: "1px solid transparent" },
    gold:      { background: disabled ? "rgba(0,113,227,0.4)" : hov ? C.blueHover : C.blue, color: "#fff", border: "1px solid transparent" },
    ghost:     { background: hov ? "rgba(0,0,0,0.05)" : "transparent", color: C.nearBlack, border: `1px solid ${C.border}` },
    ghostDark: { background: hov ? "rgba(255,255,255,0.12)" : "transparent", color: "#fff", border: "1px solid rgba(255,255,255,0.35)" },
    dark:      { background: hov ? "#333" : C.nearBlack, color: "#fff", border: "1px solid transparent" },
    text:      { background: "transparent", color: hov ? C.blueHover : C.blue, border: "none", textDecoration: hov ? "underline" : "none" },
  };
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, borderRadius: 9999, cursor: disabled ? "not-allowed" : "pointer", fontFamily: F, fontWeight: 400, letterSpacing: "-0.224px", transition: "all 0.15s", width: full ? "100%" : "auto", ...sz[size], ...vr[variant], ...sx }}
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
      {label && <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: C.nearBlack, marginBottom: 6, fontFamily: F, letterSpacing: "-0.224px" }}>{label}</label>}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{ width: "100%", padding: "11px 14px", borderRadius: 8, border: `1px solid ${focused ? C.blue : C.border}`, fontSize: 16, fontFamily: F, color: C.nearBlack, outline: focused ? `3px solid rgba(0,113,227,0.15)` : "none", outlineOffset: 2, boxSizing: "border-box", background: C.white, transition: "border-color 0.15s", letterSpacing: "-0.224px" }}
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
      <div style={{ width, height, borderRadius, background: "linear-gradient(90deg,#e5e5ea 25%,#f2f2f7 50%,#e5e5ea 75%)", backgroundSize: "800px 100%", animation: "shimmer 1.4s infinite linear", ...sx }} />
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
      style={{ background: C.white, borderRadius: 12, padding: "20px 24px", boxShadow: hov && onClick ? S.float : S.card, transition: "box-shadow 0.2s", cursor: onClick ? "pointer" : "default", ...sx }}
    >
      {children}
    </div>
  );
}
