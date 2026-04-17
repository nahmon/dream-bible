import { useState } from "react";
import { C, F, Ic } from "../lib/constants.jsx";
import { Btn, Input, useToast } from "../components/shared.jsx";
import { supabase } from "../supabase.js";

export default function AuthScreen({ go }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin },
    });
    setLoading(false);
    if (error) {
      showToast(error.message, "error");
    } else {
      setSent(true);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: C.gray, fontFamily: F, display: "flex", flexDirection: "column" }}>
      {/* Nav */}
      <nav style={{
        height: 48,
        background: "rgba(0,0,0,0.8)",
        backdropFilter: "saturate(180%) blur(20px)",
        WebkitBackdropFilter: "saturate(180%) blur(20px)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 24px", flexShrink: 0,
      }}>
        <button onClick={() => go("landing")} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
          <Ic.Cross s={14} c="rgba(255,255,255,0.85)" />
          <span style={{ fontSize: 14, fontWeight: 600, color: "#fff", letterSpacing: "-0.2px" }}>꿈묵상</span>
        </button>
        <Btn size="sm" variant="ghostDark" onClick={() => go("dream")}>먼저 사용해보기</Btn>
      </nav>

      {/* Content */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
        <div style={{ width: "100%", maxWidth: 380 }}>
          {/* Logo */}
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <Ic.Cross s={20} c={C.blue} />
              <span style={{ fontSize: 22, fontWeight: 600, color: C.nearBlack, letterSpacing: "-0.28px" }}>꿈묵상</span>
            </div>
            <div style={{ fontSize: 14, color: C.body, letterSpacing: "-0.224px" }}>성경으로 꿈을 돌아보는 공간</div>
          </div>

          {sent ? (
            <div style={{ background: C.white, borderRadius: 16, padding: "32px 28px", textAlign: "center", boxShadow: "rgba(0,0,0,0.12) 0px 2px 16px 0px" }}>
              <div style={{ fontSize: 36, marginBottom: 16 }}>✉️</div>
              <div style={{ fontSize: 17, fontWeight: 600, color: C.nearBlack, marginBottom: 8, letterSpacing: "-0.374px" }}>이메일을 확인해 주세요</div>
              <div style={{ fontSize: 14, color: C.body, lineHeight: 1.6, marginBottom: 24, letterSpacing: "-0.224px" }}>
                <strong style={{ color: C.nearBlack }}>{email}</strong>로<br />
                로그인 링크를 보내드렸습니다.
              </div>
              <Btn variant="ghost" onClick={() => setSent(false)}>다시 보내기</Btn>
            </div>
          ) : (
            <div style={{ background: C.white, borderRadius: 16, padding: "32px 28px", boxShadow: "rgba(0,0,0,0.12) 0px 2px 16px 0px" }}>
              <h2 style={{ fontSize: 21, fontWeight: 600, color: C.nearBlack, marginBottom: 6, letterSpacing: "-0.28px", lineHeight: 1.19 }}>시작하기</h2>
              <p style={{ fontSize: 14, color: C.body, marginBottom: 24, letterSpacing: "-0.224px" }}>이메일로 간편하게 로그인합니다</p>

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <Input
                  label="이메일"
                  type="email"
                  placeholder="이메일을 입력하세요"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
                <Btn variant="primary" size="md" disabled={loading || !email.trim()} full>
                  {loading ? "전송 중..." : "로그인 링크 받기"}
                </Btn>
              </form>

              <div style={{ marginTop: 20, textAlign: "center" }}>
                <button onClick={() => go("dream")} style={{ fontSize: 13, color: C.body, background: "none", border: "none", cursor: "pointer", fontFamily: F, letterSpacing: "-0.224px" }}>
                  로그인 없이 사용해보기 →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
