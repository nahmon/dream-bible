import { useEffect } from "react";

const AD_CLIENT = import.meta.env.VITE_ADSENSE_CLIENT ?? "ca-pub-XXXXXXXXXXXXXXXX";
const AD_SLOT   = import.meta.env.VITE_ADSENSE_SLOT   ?? "0000000000";

const isConfigured = AD_CLIENT !== "ca-pub-XXXXXXXXXXXXXXXX";

export default function BannerAd({ style: sx = {} }) {
  useEffect(() => {
    if (!isConfigured) return;
    try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (_) {}
  }, []);

  if (!isConfigured) return null;

  return (
    <div style={{ margin: "4px 20px 12px", overflow: "hidden", ...sx }}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={AD_CLIENT}
        data-ad-slot={AD_SLOT}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
