# DreamBible Feature Sprint Plan

## Context
- Project: /Users/mh/dream-bible
- English app: dreambible.app (VITE_LANG=en, index.en.html)
- Korean app: dream-bible.vercel.app (default)
- Lang files: src/lang/en.js, src/lang/ko.js
- Screens: src/screens/MeScreen.jsx, WordScreen.jsx, JournalScreen.jsx

## Task 1: Pro UX 개선 (Me 탭)
**Files**: src/screens/MeScreen.jsx, src/lang/en.js, src/lang/ko.js

Current state:
- isPaid 시 m.profileStatus.paid 텍스트만 표시 (line 69)
- 구독 관리 링크 없음

Changes:
- isPaid일 때 프로필 카드 아래 "✦ Pro Member" 배지 카드 추가
- 배지 카드에 "Manage Subscription →" 링크 추가 (https://app.lemonsqueezy.com/my-orders)
- 영어: "✦ Pro Member", "Manage subscription →"
- 한국어: "✦ Pro 멤버", "구독 관리 →"
- lang 파일에 proCard: { badge, manage, manageUrl } 추가

## Task 2: WordScreen 말씀 추가
**Files**: src/lang/en.js, src/lang/ko.js

Current state:
- en.js: 5개 verses (stamp/quote/cite 구조)
- ko.js: 동일 구조

Changes:
- 영어 10개 추가 (총 15개)
- 한국어 10개 추가 (총 15개)
- 다양한 stamp: "Courage", "Rest", "Guidance", "Strength", "Joy", "Trust", "Grace", "Light", "Promise", "Renewal"
- NIV 기준 영어, 개역개정 기준 한국어

## Task 3: PWA Manifest 추가
**Files**: public/manifest.json (신규), index.en.html, index.html

Changes:
- public/manifest.json 생성
  - name: "DreamBible", short_name: "DreamBible"
  - start_url: "/", display: "standalone"
  - theme_color: "#1B3A6B", background_color: "#ffffff"
  - icons: favicon.svg 사용
- index.en.html에 <link rel="manifest" href="/manifest.json"> 추가
- index.html에도 동일하게 추가 (short_name: "드림바이블")

## Task 4: 한국어 가격 수정
**Files**: src/lang/ko.js

Current state:
- price: "₩2,500" (line 210)
- sub: ["월 ₩2,500으로 무제한 해석과", "성경적 일러스트를 받아보세요."] (line 208)

Changes:
- price: "₩14,900"
- sub: ["월 ₩14,900으로 무제한 해석과", "성경적 일러스트를 받아보세요."]

## Deploy
After all tasks: vercel --prod in /Users/mh/dream-bible
