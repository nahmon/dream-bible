// 6 themes × 5 images each = 30 preset images for prayer/counsel mode
const THEMES = {
  comfort: [1, 2, 3, 4, 5].map(n => `/counsel/01-comfort-${n}.jpg`),
  healing: [1, 2, 3, 4, 5].map(n => `/counsel/02-healing-${n}.jpg`),
  gratitude: [1, 2, 3, 4, 5].map(n => `/counsel/03-gratitude-${n}.jpg`),
  strength: [1, 2, 3, 4, 5].map(n => `/counsel/04-strength-${n}.jpg`),
  family: [1, 2, 3, 4, 5].map(n => `/counsel/05-family-${n}.jpg`),
  general: [1, 2, 3, 4, 5].map(n => `/counsel/06-general-${n}.jpg`),
};

const KEYWORD_MAP = [
  {
    theme: "comfort",
    words: ["위로", "슬픔", "슬프", "외로", "고통", "상실", "잃", "죽음", "이별", "눈물",
            "grief", "loss", "lonely", "loneliness", "hurt", "sad", "broken", "comfort", "mourn"],
  },
  {
    theme: "healing",
    words: ["병", "아프", "치유", "회복", "건강", "평화", "불안", "두려움", "두렵", "걱정", "공황",
            "sick", "illness", "heal", "healing", "peace", "anxiety", "fear", "worry", "restore", "recover"],
  },
  {
    theme: "gratitude",
    words: ["감사", "축복", "기쁨", "은혜", "응답", "기적", "행복", "찬양", "영광",
            "thankful", "grateful", "blessed", "blessing", "joy", "praise", "glory", "miracle", "answered"],
  },
  {
    theme: "strength",
    words: ["힘", "용기", "어렵", "시험", "직장", "취업", "일", "도전", "포기", "실패", "극복", "버티",
            "strong", "strength", "courage", "difficult", "struggle", "work", "job", "challenge", "overcome", "fail", "give up"],
  },
  {
    theme: "family",
    words: ["가족", "결혼", "부모", "자녀", "배우자", "남편", "아내", "아이", "아들", "딸", "형제", "자매", "관계",
            "family", "marriage", "spouse", "husband", "wife", "children", "child", "parent", "sibling", "relationship"],
  },
];

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function getCounselImage(text = "") {
  const lower = text.toLowerCase();
  for (const { theme, words } of KEYWORD_MAP) {
    if (words.some(w => lower.includes(w))) {
      return pickRandom(THEMES[theme]);
    }
  }
  return pickRandom(THEMES.general);
}
