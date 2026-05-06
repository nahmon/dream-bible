import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { IAP } from "@apps-in-toss/web-framework";
import { useToast } from "../components/shared.jsx";
import BannerAd from "../components/BannerAd.jsx";
import { L, IS_EN } from "../lang/index.js";

const IAP_SKU = "bibledream_monthly_2500";

const MUSIC_TRACKS = [
  "https://cdn1.suno.ai/5QQOxOWbfamTaSyk.mp3",
  "https://cdn1.suno.ai/ivHmH80ANV3fVKQz.mp3",
  "https://cdn1.suno.ai/lbTtVLAP6HFoekE9.mp3",
  "https://cdn1.suno.ai/YoRmzUgO5rsXsTyG.mp3",
  "https://cdn1.suno.ai/4zeOhuBMCuYWRcYK.mp3",
];

const SANS = '"Pretendard Variable",Pretendard,-apple-system,BlinkMacSystemFont,system-ui,sans-serif';
const T = {
  brand: "#1B3A6B", brand2: "#122A4E", brandLight: "#E8EEF8",
  g50: "#F9FAFB", g100: "#F2F4F6", g200: "#E5E8EB", g400: "#B0B8C1",
  g500: "#8B95A1", g600: "#6B7684", g700: "#4E5968", g900: "#191F28", paper: "#FFFFFF",
};

function CommentsSheet({ item, idx, userComments: initialUserComments, onAddComment, onClose }) {
  const [text, setText] = useState("");
  const [localComments, setLocalComments] = useState(initialUserComments || []);
  const [bottom, setBottom] = useState(0);
  const textareaRef = useRef(null);
  const allComments = [...(item.commentList || []), ...localComments];
  const h = L.home;

  useEffect(() => {
    if (!window.visualViewport) return;
    const onResize = () => {
      const offset = Math.max(0, window.innerHeight - window.visualViewport.height - window.visualViewport.offsetTop);
      setBottom(offset);
    };
    window.visualViewport.addEventListener("resize", onResize);
    window.visualViewport.addEventListener("scroll", onResize);
    return () => {
      window.visualViewport.removeEventListener("resize", onResize);
      window.visualViewport.removeEventListener("scroll", onResize);
    };
  }, []);

  const handleAdd = () => {
    const t = text.trim();
    if (!t) return;
    setLocalComments(prev => [...prev, { avatar: h.myAvatar, who: h.myName, text: t, when: h.justNow }]);
    onAddComment(idx, t);
    setText("");
  };

  return (
    <>
      <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(25,31,40,.55)" }} onClick={onClose} />
      <div style={{
        position: "fixed", bottom, left: 0, right: 0, zIndex: 201,
        background: "#fff", borderRadius: "22px 22px 0 0", maxHeight: "80vh",
        display: "flex", flexDirection: "column",
        boxShadow: "0 -8px 40px rgba(25,31,40,.18)",
      }}>
        <div style={{ display: "flex", justifyContent: "center", padding: "14px 0 6px", flexShrink: 0 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: T.g200 }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 20px 14px", flexShrink: 0, borderBottom: `1px solid ${T.g100}` }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: T.g900, fontFamily: SANS }}>{h.commentsHeader(allComments.length)}</span>
          <button onClick={onClose} style={{ background: "transparent", border: 0, cursor: "pointer", padding: 4, color: T.g500 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width={20} height={20}><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div style={{ overflowY: "auto", flex: 1, padding: "16px 20px" }}>
          {allComments.length === 0 && (
            <p style={{ textAlign: "center", color: T.g400, fontSize: 14, fontFamily: SANS, margin: "24px 0" }}>{h.commentsEmpty}</p>
          )}
          {allComments.map((c, ci) => (
            <div key={ci} style={{ display: "flex", gap: 10, marginBottom: 18 }}>
              <span style={{ width: 30, height: 30, borderRadius: "50%", background: T.g200, color: T.g700, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{c.avatar}</span>
              <div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: T.g700, fontFamily: SANS }}>{c.who}</span>
                  <span style={{ fontSize: 12, color: T.g400, fontFamily: SANS }}>{c.when}</span>
                </div>
                <p style={{ fontSize: 14, color: T.g900, lineHeight: 1.6, margin: 0, fontFamily: SANS }}>{c.text}</p>
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding: `12px 16px ${bottom > 0 ? "12px" : "calc(12px + env(safe-area-inset-bottom))"}`, borderTop: `1px solid ${T.g100}`, display: "flex", gap: 10, alignItems: "flex-end", flexShrink: 0 }}>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={e => setText(e.target.value)}
            onClick={() => textareaRef.current?.focus()}
            placeholder={h.commentPlaceholder}
            enterKeyHint="send"
            rows={1}
            style={{ flex: 1, border: `1.5px solid ${T.g200}`, borderRadius: 12, padding: "11px 14px", fontFamily: SANS, fontSize: 16, color: T.g900, outline: "none", background: T.g50, resize: "none", lineHeight: 1.5, minHeight: 44, WebkitAppearance: "none" }}
          />
          <button onClick={handleAdd} style={{ background: T.brand, border: 0, borderRadius: 12, padding: "12px 16px", cursor: "pointer", color: "#fff", fontFamily: SANS, fontSize: 14, fontWeight: 700, flexShrink: 0, height: 44 }}>{h.commentSubmit}</button>
        </div>
      </div>
    </>
  );
}

function UpgradeModal({ onClose, onSuccess, userId }) {
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const u = L.home.upgrade;

  const handlePurchase = async () => {
    setLoading(true);
    if (IS_EN) {
      try {
        const res = await fetch("/api/stripe-checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        });
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
        } else {
          showToast(u.errGeneral, "error");
          setLoading(false);
        }
      } catch {
        showToast(u.errGeneral, "error");
        setLoading(false);
      }
      return;
    }

    const cleanup = IAP.createOneTimePurchaseOrder({
      options: {
        sku: IAP_SKU,
        processProductGrant: async ({ orderId }) => {
          try {
            const res = await fetch("https://dream-bible.vercel.app/api/verify-iap", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderId, userId }),
            });
            const data = await res.json();
            if (data.granted && data.expiresAt) {
              localStorage.setItem("db_paid_until", data.expiresAt);
            }
            return !!data.granted;
          } catch {
            return false;
          }
        },
      },
      onEvent: (event) => {
        if (event.type === "success") {
          localStorage.setItem("db_paid", "true");
          onSuccess?.();
          onClose();
          cleanup?.();
        }
        setLoading(false);
      },
      onError: (error) => {
        setLoading(false);
        const msg = error?.code === "INVALID_PRODUCT_ID" ? u.errInvalidProduct : u.errGeneral;
        showToast(msg, "error");
        cleanup?.();
      },
    });
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(25,31,40,.65)", backdropFilter: "blur(6px)", display: "flex", alignItems: "flex-end", justifyContent: "center", padding: 0 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: "24px 24px 0 0", padding: "32px 24px calc(32px + env(safe-area-inset-bottom))", width: "100%", maxWidth: 480, boxShadow: "0 -8px 48px rgba(25,31,40,.22)" }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: T.g200, margin: "0 auto 28px" }} />
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: T.brandLight, borderRadius: 8, padding: "6px 12px", marginBottom: 16 }}>
          <svg viewBox="0 0 16 16" fill="none" stroke={T.brand} strokeWidth="1.8" width={14} height={14}><circle cx="8" cy="5" r="3"/><path d="M2 14a6 6 0 0 1 12 0"/></svg>
          <span style={{ fontSize: 13, color: T.brand, fontWeight: 700, fontFamily: SANS }}>{u.badge}</span>
        </div>
        <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-.025em", margin: "0 0 12px", color: T.g900, fontFamily: SANS, lineHeight: 1.3 }}>
          {u.title[0]}<br />{u.title[1]}
        </h2>
        <p style={{ fontSize: 16, color: T.g600, lineHeight: 1.65, margin: "0 0 24px", fontFamily: SANS }}>
          {u.sub[0]}<br />{u.sub[1]}
        </p>
        <div style={{ background: T.g50, border: `1px solid ${T.g200}`, borderRadius: 14, padding: "18px 20px", marginBottom: 24 }}>
          {u.features.map((f, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 15, color: T.g700, marginBottom: i < u.features.length - 1 ? 12 : 0, fontWeight: 500, fontFamily: SANS }}>
              <span style={{ width: 20, height: 20, borderRadius: "50%", background: T.brand, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" width={10} height={10}><path d="M2 6 L5 9 L10 3"/></svg>
              </span>
              {f}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 16 }}>
          <span style={{ fontSize: 34, fontWeight: 700, color: T.g900, letterSpacing: "-.03em", fontFamily: SANS }}>{u.price}</span>
          <span style={{ fontSize: 15, color: T.g500, fontFamily: SANS }}>{u.period}</span>
        </div>
        <button
          disabled={loading}
          onClick={handlePurchase}
          style={{ width: "100%", background: loading ? T.brand2 : T.brand, color: "#fff", border: 0, borderRadius: 14, padding: "18px 20px", fontFamily: SANS, fontSize: 17, fontWeight: 700, letterSpacing: "-.01em", cursor: loading ? "default" : "pointer", marginBottom: 12 }}>
          {loading ? u.ctaLoading : u.cta}
        </button>
        <button onClick={onClose} style={{ width: "100%", background: "transparent", border: "none", fontFamily: SANS, fontSize: 15, color: T.g500, cursor: "pointer", padding: "10px 0" }}>{u.later}</button>
      </div>
    </div>
  );
}

export default function HomeScreen({ isPaid, uses, freeLimit, canInterpret, onUsed, onResult, onPurchaseSuccess, userId }) {
  const [mode, setMode] = useState("dream");
  const [dream, setDream] = useState("");
  const [loading, setLoading] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const { showToast } = useToast();
  const h = L.home;

  const [liked, setLiked] = useState(() => {
    try { return JSON.parse(localStorage.getItem("community_liked") || "{}"); } catch { return {}; }
  });
  const [userComments, setUserComments] = useState(() => {
    try { return JSON.parse(localStorage.getItem("community_comments") || "{}"); } catch { return {}; }
  });
  const [commentsOpen, setCommentsOpen] = useState(null);

  const toggleLike = (i) => {
    setLiked(prev => {
      const next = { ...prev, [i]: !prev[i] };
      localStorage.setItem("community_liked", JSON.stringify(next));
      return next;
    });
  };

  const addComment = (i, text) => {
    setUserComments(prev => {
      const arr = [...(prev[i] || []), { avatar: h.myAvatar, who: h.myName, text, when: h.justNow }];
      const next = { ...prev, [i]: arr };
      localStorage.setItem("community_comments", JSON.stringify(next));
      return next;
    });
  };

  const remaining = Math.max(0, freeLimit - uses);

  const handleSubmit = async () => {
    if (dream.trim().length < 10) {
      showToast(h.errShort, "error");
      return;
    }
    if (!canInterpret) {
      setShowUpgrade(true);
      return;
    }
    // Create audio during user gesture — before any await so autoplay works
    const track = MUSIC_TRACKS[Math.floor(Math.random() * MUSIC_TRACKS.length)];
    const bgAudio = new Audio(track);
    bgAudio.volume = 0.3;
    bgAudio.loop = true;
    setLoading(true);
    try {
      const isCounsel = mode === "counsel";
      const lang = IS_EN ? "en" : "ko";
      const url = isCounsel ? "/api/counsel" : "/api/interpret";
      const body = isCounsel
        ? { situation_text: dream, lang }
        : { dream_text: dream, lang };
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || h.errGeneric, "error");
        return;
      }
      onUsed();
      const id = Date.now();
      const entry = { id, date: new Date().toISOString(), dream_text: dream, interpretation: data.interpretation, image_url: null, type: isCounsel ? "counsel" : "dream" };
      const prev = JSON.parse(localStorage.getItem("db_journal") || "[]");
      localStorage.setItem("db_journal", JSON.stringify([entry, ...prev]));
      bgAudio.play().catch(() => {});
      onResult({ id, interpretation: data.interpretation, dream_text: dream, image_url: null, isPaid, mode, bgAudio });
    } catch {
      showToast(h.errNetwork, "error");
    } finally {
      setLoading(false);
    }
  };

  const currentCommunity = mode === "counsel" ? h.prayerCommunity : h.community;
  const currentChips = mode === "counsel" ? h.counselChips : h.chips;

  return (
    <div style={{ paddingBottom: 24 }}>
      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} onSuccess={onPurchaseSuccess} userId={userId} />}
      {commentsOpen !== null && createPortal(
        <CommentsSheet
          item={(() => { const [m, i] = commentsOpen.split("_"); return (m === "counsel" ? h.prayerCommunity : h.community)[+i]; })()}
          idx={commentsOpen}
          userComments={userComments[commentsOpen]}
          onAddComment={addComment}
          onClose={() => setCommentsOpen(null)}
        />,
        document.body
      )}

      {/* Hero */}
      <div style={{ padding: "20px 24px 12px" }}>
        <h1 style={{ fontFamily: SANS, fontWeight: 700, fontSize: 30, lineHeight: 1.3, letterSpacing: "-.03em", margin: "0 0 10px", color: T.g900 }}>
          {h.hero[mode].before}<br /><span style={{ color: T.brand }}>{h.hero[mode].highlight}</span>{h.hero[mode].after}
        </h1>
        <p style={{ fontSize: 16, lineHeight: 1.6, color: T.g600, margin: 0, fontFamily: SANS }}>
          {h.hero[mode].sub}
        </p>
      </div>

      {/* Mode toggle */}
      <div style={{ padding: "0 20px 16px", display: "flex" }}>
        {h.modes.map((m, i) => (
          <button key={m.id} onClick={() => { setMode(m.id); setDream(""); }} style={{
            flex: 1, border: `1.5px solid ${mode === m.id ? T.brand : T.g200}`,
            background: mode === m.id ? T.brand : "#fff",
            color: mode === m.id ? "#fff" : T.g500,
            padding: "10px 0", fontFamily: SANS, fontSize: 14, fontWeight: 700,
            cursor: "pointer",
            borderRadius: i === 0 ? "10px 0 0 10px" : "0 10px 10px 0",
            transition: "all .15s",
          }}>{m.label}</button>
        ))}
      </div>

      {/* Composer */}
      <div style={{ padding: "4px 20px 8px" }}>
        <div style={{ background: T.paper, border: `2px solid ${T.g900}`, borderRadius: 16, padding: "16px 18px 12px", boxShadow: `0 2px 0 ${T.g200}` }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: T.brand, letterSpacing: ".01em", fontFamily: SANS }}>{h.composerLabel[mode]}</span>
            <span style={{ fontSize: 13, color: T.g400, fontWeight: 500, fontFamily: SANS }}>{h.charCount(dream.length)}</span>
          </div>
          <textarea
            value={dream}
            onChange={e => setDream(e.target.value)}
            placeholder={h.placeholder[mode]}
            rows={5}
            maxLength={2000}
            style={{ width: "100%", border: 0, background: "transparent", resize: "none", fontFamily: SANS, fontSize: 16, lineHeight: 1.65, color: T.g900, outline: "none", minHeight: 90, padding: 0 }}
          />
          <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px dashed ${T.g200}`, display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13, color: T.g500, fontWeight: 500, fontFamily: SANS }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: T.brand, animation: "pulse 1.6s ease-in-out infinite", display: "inline-block", flexShrink: 0 }} />
              {h.autosave}
            </span>
            <span>{h.maxChars}</span>
          </div>
        </div>
      </div>

      {/* Chips */}
      <div style={{ padding: "4px 20px 10px" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: T.g500, margin: "0 0 10px", fontFamily: SANS }}>
          {h.chipsLabel[mode]}
        </div>
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, margin: "0 -20px", paddingLeft: 20, paddingRight: 20, scrollbarWidth: "none" }}>
          {currentChips.map((chip, i) => (
            <button key={i} onClick={() => setDream(chip.fill)} style={{
              flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 6,
              background: "#fff", border: `1.5px solid ${T.g200}`, borderRadius: 999,
              padding: "9px 16px", fontSize: 14, color: T.g700, fontWeight: 600,
              cursor: "pointer", fontFamily: SANS, transition: "border-color .15s",
            }}>
              <span style={{ color: T.brand, fontSize: 16, lineHeight: 1, fontWeight: 700 }}>+</span>
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: "8px 20px 6px" }}>
        <button
          disabled={loading}
          onClick={handleSubmit}
          style={{
            width: "100%", background: loading ? T.brand2 : T.brand, color: "#fff",
            border: 0, borderRadius: 14, padding: "18px 20px", fontFamily: SANS,
            fontSize: 17, fontWeight: 700, letterSpacing: "-.01em",
            cursor: loading ? "default" : "pointer",
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10,
            transition: "background .15s",
          }}>
          {loading ? (
            <>
              <span style={{ width: 18, height: 18, border: "2.5px solid rgba(255,255,255,.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite", display: "inline-block" }} />
              {h.ctaLoading}
            </>
          ) : (
            <>
              {h.cta[mode]}
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width={18} height={18}><path d="M3 8 H13 M9 4 L13 8 L9 12" /></svg>
            </>
          )}
        </button>
        <p style={{ fontSize: 13, color: T.g500, textAlign: "center", margin: "10px 4px 0", fontWeight: 500, lineHeight: 1.5, fontFamily: SANS }}>
          {isPaid
            ? h.proStatus
            : remaining > 0
              ? h.freeRemaining(remaining)
              : h.freeExhausted}
        </p>
      </div>

      {/* Community feed */}
      <div style={{ borderTop: `8px solid ${T.g100}`, marginTop: 8 }}>
        <div style={{ padding: "20px 20px 12px", display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <h3 style={{ fontFamily: SANS, fontWeight: 700, fontSize: 20, margin: 0, color: T.g900, letterSpacing: "-.02em" }}>
            {h.communityTitle[mode]}
          </h3>
          <span style={{ fontSize: 13, color: T.g500, fontWeight: 500, fontFamily: SANS }}>{h.todayCount}</span>
        </div>
        <BannerAd />
        {currentCommunity.map((item, i) => {
          const feedKey = `${mode}_${i}`;
          return (
            <div key={feedKey} style={{ padding: "14px 20px", borderBottom: `1px solid ${T.g100}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <span style={{ width: 28, height: 28, borderRadius: "50%", background: T.g200, color: T.g700, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{item.avatar}</span>
                <span style={{ fontSize: 14, color: T.g700, fontWeight: 600, fontFamily: SANS }}>{item.who}</span>
                <span style={{ fontSize: 13, color: T.g400, fontFamily: SANS }}>· {item.when}</span>
              </div>
              <p style={{ fontSize: 15, color: T.g900, lineHeight: 1.6, margin: "0 0 12px", fontWeight: 500, fontFamily: SANS }}>{item.dream}</p>
              <div style={{ background: T.brandLight, borderLeft: `3px solid ${T.brand}`, padding: "12px 14px", borderRadius: 6 }}>
                <div style={{ fontSize: 12, color: T.brand, fontWeight: 700, letterSpacing: ".04em", marginBottom: 5, fontFamily: SANS }}>{item.verseRef}</div>
                <p style={{ fontSize: 14, color: T.g700, lineHeight: 1.6, margin: 0, fontFamily: SANS }}>{item.verseText}</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 8 }}>
                <button
                  onClick={() => toggleLike(feedKey)}
                  style={{ display: "flex", alignItems: "center", gap: 5, background: liked[feedKey] ? T.brandLight : "transparent", border: `1px solid ${liked[feedKey] ? T.brand : T.g200}`, borderRadius: 999, padding: "6px 14px", cursor: "pointer", fontFamily: SANS, fontSize: 13, fontWeight: 600, color: liked[feedKey] ? T.brand : T.g500, transition: "all .15s" }}>
                  {liked[feedKey] ? "♥" : "♡"} {h.like} {item.likes + (liked[feedKey] ? 1 : 0)}
                </button>
                <button
                  onClick={() => setCommentsOpen(feedKey)}
                  style={{ display: "flex", alignItems: "center", gap: 5, background: "transparent", border: `1px solid ${T.g200}`, borderRadius: 999, padding: "6px 14px", cursor: "pointer", fontFamily: SANS, fontSize: 13, fontWeight: 600, color: T.g500, transition: "all .15s" }}>
                  💬 {h.comment} {(item.commentList?.length || 0) + (userComments[feedKey]?.length || 0)}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
