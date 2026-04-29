const SANS = '"Pretendard Variable",Pretendard,-apple-system,BlinkMacSystemFont,system-ui,sans-serif';
const T = {
  brand: "#6B3F1D",
  g100: "#F2F4F6", g200: "#E5E8EB", g500: "#8B95A1", g900: "#191F28",
};

const VERSES = [
  { stamp: "오늘 밤의 구절", quote: '"내 속에 생각이 많을 때에 주의 위안이 내 영혼을 즐겁게 하시나이다."', cite: "시편 94편 19절" },
  { stamp: "위로", quote: '"수고하고 무거운 짐 진 자들아 다 내게로 오라 내가 너희를 쉬게 하리라."', cite: "마태복음 11장 28절" },
  { stamp: "평안", quote: '"평안을 너희에게 끼치노니 곧 나의 평안을 너희에게 주노라."', cite: "요한복음 14장 27절" },
  { stamp: "동행", quote: '"여호와는 나의 목자시니 내게 부족함이 없으리로다."', cite: "시편 23편 1절" },
  { stamp: "소망", quote: '"내가 산을 향하여 눈을 들리라 나의 도움이 어디서 올꼬."', cite: "시편 121편 1절" },
];

export default function WordScreen() {
  return (
    <div style={{ padding: "8px 20px 100px", fontFamily: SANS }}>
      <div style={{ padding: "16px 0 20px" }}>
        <h2 style={{ fontWeight: 600, fontSize: 24, margin: "0 0 6px", letterSpacing: "-.02em", color: T.g900, fontFamily: SANS }}>
          오늘의 <span style={{ color: T.brand, fontWeight: 700 }}>말씀</span>
        </h2>
        <p style={{ margin: 0, fontSize: 13.5, color: T.g500, lineHeight: 1.55, fontFamily: SANS }}>
          잠들기 전, 짧게 한 구절씩 읽어보세요.
        </p>
      </div>

      {VERSES.map((v, i) => (
        <div key={i} style={{ background: "#fff", border: `1px solid ${T.g200}`, borderRadius: 14, padding: "18px 20px", marginBottom: 12, position: "relative" }}>
          <span style={{
            position: "absolute", top: -9, left: 18,
            background: "#fff", fontSize: 10.5, letterSpacing: ".08em",
            padding: "2px 10px", color: T.brand,
            border: `1px solid ${T.g200}`, fontWeight: 600, borderRadius: 4,
            fontFamily: SANS,
          }}>
            {v.stamp}
          </span>
          <p style={{ fontWeight: 500, fontSize: 16, lineHeight: 1.6, color: T.g900, margin: "6px 0 12px", letterSpacing: "-.01em", fontFamily: SANS }}>
            {v.quote}
          </p>
          <div style={{ fontSize: 12, color: T.g500, fontWeight: 600, fontFamily: SANS }}>{v.cite}</div>
        </div>
      ))}
    </div>
  );
}
