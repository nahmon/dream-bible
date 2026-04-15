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
    <div style={{ minHeight: "100vh", background: C.cream, fontFamily: F, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <Ic.Star s={24} c={C.gold} />
            <span style={{ fontSize: 22, fontWeight: 800, color: C.navy }}>꿈묵상</span>
          </div>
          <div style={{ fontSize: 15, color: C.body }}>성경으로 꿈을 돌아보는 공간</div>
        </div>

        {sent ? (
          <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, padding: "32px 28px", textAlign: "center" }}>
            <div style={{ fontSize: 36, marginBottom: 16 }}>✉️</div>
            <div style={{ fontSize: 17, fontWeight: 600, color: C.navy, marginBottom: 8 }}>이메일을 확인해 주세요</div>
            <div style={{ fontSize: 14, color: C.body, lineHeight: 1.6, marginBottom: 24 }}>
              <strong style={{ color: C.navy }}>{email}</strong>로<br />
              로그인 링크를 보내드렸습니다.
            </div>
            <Btn variant="ghost" onClick={() => setSent(false)}>다시 보내기</Btn>
          </div>
        ) : (
          <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, padding: "32px 28px" }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: C.navy, marginBottom: 6 }}>시작하기</h2>
            <p style={{ fontSize: 14, color: C.body, marginBottom: 24 }}>이메일로 간편하게 로그인합니다</p>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Input
                label="이메일"
                type="email"
                placeholder="이메일을 입력하세요"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
              <Btn variant="gold" size="md" disabled={loading || !email.trim()} full>
                {loading ? "전송 중..." : "로그인 링크 받기"}
              </Btn>
            </form>

            <div style={{ marginTop: 20, textAlign: "center" }}>
              <button onClick={() => go("landing")} style={{ fontSize: 13, color: C.body, background: "none", border: "none", cursor: "pointer", fontFamily: F, textDecoration: "underline" }}>
                처음으로 돌아가기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
