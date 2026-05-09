import { useState, useEffect, useRef } from "react";
import { useToast } from "../components/shared.jsx";
import BannerAd from "../components/BannerAd.jsx";
import { L } from "../lang/index.js";
import { SANS, SERIF, T } from "../lib/theme.js";
import { randomTrack } from "../lib/media.js";
import { getCounselImage } from "../lib/counselImages.js";

const FREE_IMAGE_KEY = () => {
  const d = new Date();
  return `db_free_image_${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

const PAID_IMAGE_KEY = () => {
  const d = new Date();
  return `db_paid_image_${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};
const PAID_IMAGE_CAP = 5;

function parseInterpretation(text) {
  if (!text) return [];
  return text.split("\n").map((line, i) => {
    const t = line.trim();
    if (t.startsWith("**") && t.endsWith("**")) return { type: "heading", text: t.slice(2, -2), key: i };
    if (t.startsWith("- ")) return { type: "bullet", text: t.slice(2), key: i };
    if (!t) return { type: "spacer", key: i };
    return { type: "text", text: t, key: i };
  });
}

export default function ResultScreen({ result, onClose }) {
  const { id, interpretation, dream_text, image_url: initialImageUrl, isPaid, mode, bgAudio } = result ?? {};
  const isCounsel = mode === "counsel";
  const accent      = isCounsel ? T.gold      : T.brand;
  const accent2     = isCounsel ? "#8B5E1A"   : T.brand2;
  const accentLight = isCounsel ? T.goldLight : T.brandLight;
  const cardBg      = isCounsel ? T.parchment : "#fff";
  const cardBorder  = isCounsel ? T.goldLight : T.g200;
  const bodyFont    = isCounsel ? SERIF       : SANS;
  const parsed = parseInterpretation(interpretation);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [imageUrl, setImageUrl] = useState(
    initialImageUrl ?? (isCounsel ? getCounselImage(dream_text) : null)
  );
  const { showToast } = useToast();
  const generateCalledRef = useRef(false);
  const r = L.home.result;

  const audioRef = useRef(bgAudio ?? null);
  const [isPlaying, setIsPlaying] = useState(!!bgAudio);
  const musicToastShownRef = useRef(false);

  useEffect(() => {
    if (bgAudio) {
      bgAudio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      return () => { bgAudio.pause(); bgAudio.src = ""; };
    }
    // Fallback for journal re-open (fresh gesture available)
    const audio = new Audio(randomTrack());
    audio.volume = 0.3;
    audio.loop = true;
    audioRef.current = audio;
    audio.play().then(() => setIsPlaying(true)).catch(() => {});
    return () => { audio.pause(); audio.src = ""; };
  }, [bgAudio]);

  useEffect(() => {
    if (isPlaying && !musicToastShownRef.current) {
      musicToastShownRef.current = true;
      showToast(r.musicPlaying, "success");
    }
  }, [isPlaying]);

  const toggleMusic = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) { audio.pause(); setIsPlaying(false); }
    else { audio.play().then(() => setIsPlaying(true)).catch(() => {}); }
  };

  const [isFirstEver] = useState(() => !localStorage.getItem("db_first_image_done"));
  const [freeMonthUsed] = useState(() => !!localStorage.getItem(FREE_IMAGE_KEY()));
  const [paidImgCount] = useState(() => parseInt(localStorage.getItem(PAID_IMAGE_KEY()) || "0"));
  const paidImgRemaining = PAID_IMAGE_CAP - paidImgCount - 1;
  const freeImageAvailable = !isPaid && (isFirstEver || !freeMonthUsed);
  const paidCapReached = isPaid && paidImgCount >= PAID_IMAGE_CAP;
  const showImageSection = isCounsel || (isPaid && !paidCapReached) || freeImageAvailable || !!initialImageUrl;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (imageUrl || generateCalledRef.current) return;
    if (isCounsel) return; // preset image already set
    if (!isPaid && !freeImageAvailable) return;
    if (paidCapReached) return;
    generateCalledRef.current = true;
    fetch("/api/generate-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(isCounsel ? { dream_text, type: "counsel" } : { dream_text }),
    })
      .then(res => res.json())
      .then(data => {
        if (!data.image_url) { setImgError(true); return; }
        setImageUrl(data.image_url);
        if (!isPaid) {
          localStorage.setItem(FREE_IMAGE_KEY(), "1");
          localStorage.setItem("db_first_image_done", "1");
        } else {
          localStorage.setItem(PAID_IMAGE_KEY(), (paidImgCount + 1).toString());
        }
        const journal = JSON.parse(localStorage.getItem("db_journal") || "[]");
        const updated = journal.map(e => e.id === id ? { ...e, image_url: data.image_url } : e);
        localStorage.setItem("db_journal", JSON.stringify(updated));
      })
      .catch(() => setImgError(true));
  }, []);

  const handleShare = async () => {
    const label = r.shareLabel[isCounsel ? "counsel" : "dream"];
    const shareUrl = r.shareUrl;

    if (imageUrl && imgLoaded && navigator.canShare) {
      try {
        const resp = await fetch(imageUrl);
        const blob = await resp.blob();
        const file = new File([blob], "dreambible.jpg", { type: "image/jpeg" });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: r.shareAppTitle,
            text: `${r.shareImageText} ${shareUrl}`,
          });
          return;
        }
      } catch (_) {}
    }

    const clean = interpretation?.replace(/\*\*/g, "").replace(/^- /gm, "• ") ?? "";
    const title = r.shareTitle[isCounsel ? "counsel" : "dream"];
    const shareText = `${title}\n\n${label}: ${dream_text}\n\n${clean}\n\n🙏 ${r.shareBody(shareUrl)}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: r.shareAppTitle, text: shareText, url: shareUrl });
        showToast(r.shareShared, "success");
      }
      catch (_) {}
    } else {
      await navigator.clipboard.writeText(shareText);
      showToast(r.shareCopied, "success");
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(25,31,40,.6)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          background: "#fff", borderRadius: "24px 24px 0 0",
          maxHeight: "94vh", display: "flex", flexDirection: "column",
          boxShadow: "0 -8px 48px rgba(25,31,40,.2)",
        }}
      >
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
          .img-shimmer { background: linear-gradient(90deg, #2a221a 25%, #3d3028 50%, #2a221a 75%); background-size: 200% 100%; animation: shimmer 1.6s infinite; }
        `}</style>

        <div style={{ display: "flex", justifyContent: "center", padding: "14px 0 6px" }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: T.g200 }} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "56px 1fr 96px", alignItems: "center", height: 48, flexShrink: 0 }}>
          <button onClick={onClose} style={{ background: "transparent", border: 0, cursor: "pointer", width: 48, height: 48, display: "flex", alignItems: "center", justifyContent: "center", color: T.g900 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width={22} height={22}>
              <path d="M18 6 L6 18 M6 6 L18 18" />
            </svg>
          </button>
          <div style={{ textAlign: "center", fontFamily: SANS, fontSize: 17, fontWeight: 700, color: T.g900, letterSpacing: "-.015em", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <span style={{ width: 20, height: 20, borderRadius: 5, background: accent, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg viewBox="0 0 22 22" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" width={12} height={12}><path d="M11 4 V18 M5 8 H17" /></svg>
            </span>
            <span>{r.navTitle[isCounsel ? "counsel" : "dream"]}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 4 }}>
            <button onClick={toggleMusic} style={{ background: "transparent", border: 0, cursor: "pointer", width: 44, height: 48, display: "flex", alignItems: "center", justifyContent: "center", color: isPlaying ? accent : T.g400 }}>
              {isPlaying ? (
                <svg viewBox="0 0 24 24" fill="currentColor" width={20} height={20}><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="currentColor" width={20} height={20}><path d="M8 5v14l11-7z"/></svg>
              )}
            </button>
            <button onClick={handleShare} style={{ background: "transparent", border: 0, cursor: "pointer", width: 48, height: 48, display: "flex", alignItems: "center", justifyContent: "center", color: T.g700 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={22} height={22}>
                <circle cx="18" cy="5" r="2" /><circle cx="6" cy="12" r="2" /><circle cx="18" cy="19" r="2" />
                <line x1="8" y1="10.6" x2="15.9" y2="6.4" /><line x1="8" y1="13.4" x2="15.9" y2="17.6" />
              </svg>
            </button>
          </div>
        </div>

        <div style={{ overflowY: "auto", flex: 1, scrollbarWidth: "none", padding: "4px 20px 40px" }}>

          {showImageSection && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ borderRadius: 16, overflow: "hidden", aspectRatio: "1/1", position: "relative", background: "#2a221a" }}>
                {!imgLoaded && !imgError && (
                  <div className="img-shimmer" style={{ position: "absolute", inset: 0 }} />
                )}
                {imageUrl && (
                  <img
                    src={imageUrl}
                    alt={r.shareAppTitle}
                    onLoad={() => setImgLoaded(true)}
                    onError={() => { setImgError(true); setImageUrl(null); }}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", opacity: imgLoaded ? 1 : 0, transition: "opacity 0.6s ease" }}
                  />
                )}
                {imgError && !imageUrl && (
                  <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    <span style={{ fontSize: 13, color: "rgba(255,255,255,.3)", fontFamily: SANS }}>{r.imageError}</span>
                  </div>
                )}
              </div>
              {!isPaid && freeImageAvailable && (
                <div style={{ marginTop: 8, padding: "10px 14px", background: accentLight, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12.5, color: accent, fontWeight: 600, fontFamily: SANS }}>{r.freeImageUsing}</span>
                  <span style={{ fontSize: 12, color: accent2, fontFamily: SANS }}>{r.freeImageProCta}</span>
                </div>
              )}
              {isPaid && !paidCapReached && paidImgRemaining <= 1 && (
                <div style={{ marginTop: 8, padding: "8px 14px", background: accentLight, borderRadius: 10, textAlign: "right" }}>
                  <span style={{ fontSize: 12, color: accent2, fontFamily: SANS }}>{r.paidImageRemaining(paidImgRemaining)}</span>
                </div>
              )}
            </div>
          )}

          {!isPaid && !freeImageAvailable && !initialImageUrl && (
            <div style={{ marginBottom: 20, borderRadius: 16, border: `1.5px dashed ${T.g200}`, padding: "20px 18px", textAlign: "center" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke={T.g400} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width={40} height={40} style={{ marginBottom: 8 }}><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
              <p style={{ fontSize: 14, color: T.g600, lineHeight: 1.6, margin: "0 0 4px", fontFamily: SANS, fontWeight: 600 }}>{r.freeImageExhausted}</p>
              <p style={{ fontSize: 13, color: T.g400, margin: 0, fontFamily: SANS }}>{r.freeImageExhaustedSub(PAID_IMAGE_CAP)}</p>
            </div>
          )}
          {isPaid && paidCapReached && !initialImageUrl && (
            <div style={{ marginBottom: 20, borderRadius: 16, border: `1.5px dashed ${T.g200}`, padding: "20px 18px", textAlign: "center" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke={T.g400} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width={40} height={40} style={{ marginBottom: 8 }}><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
              <p style={{ fontSize: 14, color: T.g600, lineHeight: 1.6, margin: "0 0 4px", fontFamily: SANS, fontWeight: 600 }}>{r.paidImageExhausted(PAID_IMAGE_CAP)}</p>
              <p style={{ fontSize: 13, color: T.g400, margin: 0, fontFamily: SANS }}>{r.paidImageExhaustedSub(PAID_IMAGE_CAP)}</p>
            </div>
          )}

          <button onClick={handleShare} style={{ width: "100%", marginBottom: 16, background: accent, color: "#fff", border: 0, borderRadius: 14, padding: "15px 20px", fontFamily: SANS, fontSize: 15, fontWeight: 700, letterSpacing: "-.01em", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width={17} height={17}>
              <circle cx="18" cy="5" r="2" /><circle cx="6" cy="12" r="2" /><circle cx="18" cy="19" r="2" />
              <line x1="8" y1="10.6" x2="15.9" y2="6.4" /><line x1="8" y1="13.4" x2="15.9" y2="17.6" />
            </svg>
            {r.shareCta}
          </button>

          <div style={{ background: T.g50, border: `1px solid ${T.g100}`, borderRadius: 14, padding: "16px 18px", marginBottom: 16 }}>
            <div style={{ fontSize: 12, letterSpacing: ".06em", color: T.g500, fontWeight: 700, marginBottom: 8, fontFamily: SANS }}>{r.shareLabel[isCounsel ? "counsel" : "dream"]}</div>
            <p style={{ fontSize: 15, color: T.g700, lineHeight: 1.7, margin: 0, fontFamily: SANS }}>{dream_text}</p>
          </div>

          <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, padding: "20px" }}>
            <div>
              {parsed.map(block => {
                if (block.type === "heading") return (
                  <div key={block.key} style={{ fontSize: 13, fontWeight: 700, letterSpacing: ".04em", color: accent, marginTop: 22, marginBottom: 10, paddingBottom: 10, borderBottom: `1px solid ${T.g100}`, fontFamily: SANS }}>
                    {block.text}
                  </div>
                );
                if (block.type === "bullet") return (
                  <div key={block.key} style={{ display: "flex", gap: 12, marginBottom: 12, alignItems: "flex-start" }}>
                    <span style={{ flexShrink: 0, marginTop: 9, width: 5, height: 5, borderRadius: "50%", background: accent, display: "inline-block" }} />
                    <span style={{ fontSize: 16, color: T.g700, lineHeight: 1.7, fontFamily: bodyFont }}>{block.text}</span>
                  </div>
                );
                if (block.type === "spacer") return <div key={block.key} style={{ height: 8 }} />;
                return (
                  <p key={block.key} style={{ fontSize: 16, color: T.g700, lineHeight: 1.75, margin: "0 0 10px", fontFamily: bodyFont }}>
                    {block.text}
                  </p>
                );
              })}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button onClick={handleShare} style={{ flex: 1, background: T.g50, color: T.g700, border: `1.5px solid ${T.g200}`, borderRadius: 14, padding: "14px 20px", fontFamily: SANS, fontSize: 15, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={16} height={16}>
                <circle cx="18" cy="5" r="2" /><circle cx="6" cy="12" r="2" /><circle cx="18" cy="19" r="2" />
                <line x1="8" y1="10.6" x2="15.9" y2="6.4" /><line x1="8" y1="13.4" x2="15.9" y2="17.6" />
              </svg>
              {r.shareAgain}
            </button>
            <button onClick={onClose} style={{ flex: 1, background: "transparent", border: `1.5px solid ${T.g200}`, borderRadius: 14, padding: "14px 18px", fontFamily: SANS, fontSize: 15, fontWeight: 600, color: T.g600, cursor: "pointer" }}>
              {r.close}
            </button>
          </div>

          {isPaid && !paidCapReached && paidImgRemaining >= 2 && (
            <div style={{ marginTop: 16, padding: "8px 14px", background: accentLight, borderRadius: 10, textAlign: "right" }}>
              <span style={{ fontSize: 12, color: accent2, fontFamily: SANS }}>{r.paidImageRemaining(paidImgRemaining)}</span>
            </div>
          )}

          <BannerAd style={{ margin: "16px 0 0" }} />

          <p style={{ textAlign: "center", margin: "4px 0 0", fontSize: 12, color: T.g400, letterSpacing: ".03em", fontFamily: SANS }}>
            {r.disclaimer}
          </p>
        </div>
      </div>
    </div>
  );
}
