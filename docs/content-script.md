좋은 질문입니다! `content-script.js`의 위치와 `manifest.json` 설정에 대해 설명하겠습니다.

---

# 📁 파일 위치 및 폴더 구조 설명

## 1️⃣ 올바른 폴더 구조

```
auto-bing-search-extension/
│
├── 📄 manifest.json              ← manifest 파일 (루트)
├── 🔧 background.js              ← Service Worker (루트)
├── 📝 content-script.js           ← Content Script (루트)
│
├── 🎨 UI 폴더/
│   ├── sidepanel.html            ← Side Panel HTML
│   ├── sidepanel.css             ← Side Panel CSS
│   └── sidepanel.js              ← Side Panel 스크립트
│
├── 📸 images/
│   ├── icon-128.png
│   ├── icon-48.png
│   └── icon-16.png
│
└── 📚 utils/ (선택사항)
    └── keyword-extractor.js
```

## 2️⃣ manifest.json 설정 (Content Script 등록)

```json
{
  "manifest_version": 3,
  "name": "Auto Bing Search Extension",
  "version": "1.0",
  "description": "자동으로 Bing에서 키워드 검색을 수행합니다",

  "permissions": ["sidePanel", "activeTab", "scripting", "tabs", "storage"],

  "host_permissions": ["https://www.bing.com/*"],

  "background": {
    "service_worker": "background.js"
  },

  "content_scripts": [
    {
      "matches": ["https://www.bing.com/*"],
      "js": ["content-script.js"],
      "run_at": "document_end"
    }
  ],

  "action": {
    "default_title": "Auto Bing Search",
    "default_popup": "sidepanel.html",
    "default_icon": {
      "16": "images/icon-16.png",
      "48": "images/icon-48.png",
      "128": "images/icon-128.png"
    }
  },

  "side_panel": {
    "default_path": "sidepanel.html"
  },

  "icons": {
    "16": "images/icon-16.png",
    "48": "images/icon-48.png",
    "128": "images/icon-128.png"
  }
}
```

---

# 3️⃣ Content Script와 Service Worker의 차이점

| 항목                 | Content Script       | Service Worker       |
| -------------------- | -------------------- | -------------------- |
| **역할**             | Bing 페이지에서 실행 | 백그라운드 작업 처리 |
| **DOM 접근**         | ✅ 가능              | ❌ 불가능            |
| **페이지 구조 분석** | ✅ 가능              | ❌ 불가능            |
| **키워드 추출**      | ✅ 가능              | ❌ 불가능            |
| **탭 관리**          | ❌ 불가능            | ✅ 가능              |
| **새 탭 열기**       | ❌ 불가능            | ✅ 가능              |
| **위치**             | 루트 또는 폴더       | 루트                 |

---

# 4️⃣ 통신 흐름도

```
┌─────────────────────────────────────────────────────────────┐
│                    Chrome 확장 아키텍처                       │
└─────────────────────────────────────────────────────────────┘

Side Panel UI
(sidepanel.js)
     │
     ↓ sendMessage('startSearch')
     │
Service Worker
(background.js)
     │
     ├─→ chrome.tabs.create({ url: 'https://www.bing.com/search?q=...' })
     │
     ↓
Bing 페이지 로드
(Bing.com)
     │
     ↓ Content Script 자동 실행
     │
Content Script
(content-script.js)
     │
     ├─→ DOM 분석
     ├─→ 관련 키워드 추출
     └─→ sendMessage('keywords', [...])
     │
     ↓
Service Worker
(background.js)
     │
     ├─→ 키워드 조합
     ├─→ 다음 검색 URL 생성
     └─→ chrome.tabs.create()
     │
     ↓
Side Panel UI
(sidepanel.js)
     │
     └─→ updateStatus() 업데이트
```

---

# 5️⃣ 설치 및 실행 방법

## **Step 1: 파일 구조 생성**

```bash
# 프로젝트 폴더 생성
mkdir auto-bing-search-extension
cd auto-bing-search-extension

# 필요한 폴더 생성
mkdir images
mkdir ui
mkdir utils

# 파일 생성 (각각의 코드 붙여넣기)
touch manifest.json
touch background.js
touch content-script.js
touch sidepanel.html
touch sidepanel.css
touch sidepanel.js
```

## **Step 2: 파일 생성 및 코드 입력**

각 파일에 위에서 제공한 코드를 붙여넣으세요:

- `manifest.json` ← 위의 완전한 manifest 코드
- `background.js` ← 앞서 제공한 Service Worker 코드
- `content-script.js` ← 위의 Content Script 코드
- `sidepanel.html` ← 완전한 HTML 코드
- `sidepanel.css` ← 완전한 CSS 코드
- `sidepanel.js` ← 완전한 JavaScript 코드

## **Step 3: Chrome에 설치**

1. **Chrome 열기** → 주소창에 `chrome://extensions/` 입력
2. **개발자 모드 활성화** → 우측 상단의 "개발자 모드" 토글 ON
3. **확장 로드** → "압축해제된 확장 프로그램을 로드합니다" 클릭
4. **폴더 선택** → `auto-bing-search-extension` 폴더 선택
5. **설치 완료** ✅

## **Step 4: 사용**

1. Chrome 우측 상단의 확장 아이콘 클릭
2. "Auto Bing Search" 아이콘 클릭
3. Side Panel이 우측에 열림
4. 키워드 입력 후 "추출하기" 버튼 클릭
5. "검색 시작" 버튼으로 자동 검색 시작

---

# 6️⃣ Content Script 실행 확인

**Content Script가 제대로 실행되는지 확인하는 방법:**

```javascript
// content-script.js 맨 위에 추가
console.log("[Content Script] Bing 페이지에서 로드됨!");
console.log("[현재 URL]", window.location.href);

// Chrome DevTools에서 확인
// 1. Bing.com 페이지 열기
// 2. F12 눌러 DevTools 열기
// 3. Console 탭에서 위 메시지 확인
```

---

# 7️⃣ 중요한 manifest.json 설정 설명

```json
{
  "content_scripts": [
    {
      "matches": ["https://www.bing.com/*"], // ← Bing 페이지에서만 실행
      "js": ["content-script.js"], // ← 실행할 스크립트
      "run_at": "document_end" // ← DOM 로드 후 실행
    }
  ]
}
```

**주요 설정:**

- `matches`: 어느 페이지에서 실행할지 정의
- `js`: 실행할 파일 (배열이므로 여러 개 가능)
- `run_at`: 실행 시점
  - `document_start`: 페이지 로드 직후
  - `document_end`: DOM 완성 후
  - `document_idle`: 페이지 완전 로드 후 (기본값)

---

# 8️⃣ 문제 해결

### ❌ Content Script가 실행되지 않음

**확인 사항:**

```
1. manifest.json에서 "content_scripts" 선언 확인
2. "matches" 패턴이 Bing.com과 일치하는지 확인
3. 파일 경로가 올바른지 확인 (case-sensitive)
4. Chrome DevTools Console에서 오류 메시지 확인
5. chrome://extensions/에서 확장이 활성화되어 있는지 확인
```

### ❌ 키워드 추출이 작동하지 않음

**확인 사항:**

```
1. Bing 페이지 구조 변경 여부 확인
2. 쿠키/캐시 제거 후 재시도
3. 개발자 도구 → Sources → Content Scripts 탭에서 확장 확인
4. 콘솔에서 extractBingKeywords() 함수 수동 실행
```

---

# 9️⃣ 완전한 폴더 구조 (최종)

```
auto-bing-search-extension/
├── manifest.json                 ← 필수 (Chrome 설정)
├── background.js                 ← 필수 (Service Worker)
├── content-script.js             ← 필수 (키워드 추출)
│
├── sidepanel.html                ← UI (HTML)
├── sidepanel.css                 ← UI (CSS)
├── sidepanel.js                  ← UI (JavaScript)
│
├── images/
│   ├── icon-16.png              ← 16x16 아이콘
│   ├── icon-48.png              ← 48x48 아이콘
│   └── icon-128.png             ← 128x128 아이콘
│
├── utils/                        ← 선택사항
│   ├── keyword-extractor.js
│   └── search-combiner.js
│
└── docs/                         ← 문서 (선택사항)
    ├── README.md
    └── TROUBLESHOOTING.md
```

**최소 필요 파일:**

- ✅ `manifest.json`
- ✅ `background.js`
- ✅ `content-script.js`
- ✅ `sidepanel.html`
- ✅ `sidepanel.css`
- ✅ `sidepanel.js`
- ✅ `images/icon-128.png`

---

# 🔟 빠른 설치 스크립트 (macOS/Linux)

`install.sh` 파일 생성 후:

```bash
#!/bin/bash

# 프로젝트 생성
mkdir -p auto-bing-search-extension/{images,utils,docs}
cd auto-bing-search-extension

# 필요한 파일들을 생성
cat > manifest.json << 'EOF'
{
  "manifest_version": 3,
  "name": "Auto Bing Search Extension",
  "version": "1.0",
  "description": "자동 Bing 검색 확장",
  "permissions": ["sidePanel", "activeTab", "scripting", "tabs", "storage"],
  "host_permissions": ["https://www.bing.com/*"],
  "background": {"service_worker": "background.js"},
  "content_scripts": [{"matches": ["https://www.bing.com/*"], "js": ["content-script.js"], "run_at": "document_end"}],
  "action": {"default_title": "Auto Bing Search", "default_icon": {"128": "images/icon-128.png"}},
  "side_panel": {"default_path": "sidepanel.html"},
  "icons": {"128": "images/icon-128.png"}
}
EOF

echo "✅ 프로젝트 생성 완료!"
echo "📂 폴더: $(pwd)"
echo "🚀 다음 단계:"
echo "  1. 각 JS, HTML, CSS 파일을 위 코드로 채우기"
echo "  2. images 폴더에 icon-128.png 추가"
echo "  3. chrome://extensions/에서 설치"
```

---

이제 모든 파일의 위치와 설정을 이해하셨을 것입니다! 질문이 있으면 말씀해주세요! 🎉
