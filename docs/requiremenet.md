---

# 📚 자동 Bing 검색 확장 프로그램 - 완전 가이드 (README.md)

```markdown
# 🔍 Auto Bing Search Extension

**자동으로 Bing에서 키워드를 검색하고, 관련 키워드 20개를 추출하여 조합해서 반복 검색하는 Chrome 확장 프로그램**

[![Chrome Version](https://img.shields.io/badge/Chrome-114+-green.svg)](https://www.google.com/chrome/)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-blue.svg)](https://developer.chrome.com/docs/extensions/mv3/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](#license)

---

## 📋 목차

- [주요 기능](#-주요-기능)
- [요구사항](#-요구사항)
- [폴더 구조](#-폴더-구조)
- [설치 방법](#-설치-방법)
- [사용 방법](#-사용-방법)
- [파일 설명](#-파일-설명)
- [핵심 기능 상세 설명](#-핵심-기능-상세-설명)
- [API 명세](#-api-명세)
- [트러블슈팅](#-트러블슈팅)
- [개발자 정보](#-개발자-정보)

---

## ✨ 주요 기능

### 1️⃣ **자동 키워드 추출**

- Bing 검색 결과에서 자동으로 관련 키워드 **20개 추출**
- 키워드 중복 제거 및 정렬
- 추출 실패 시 대체 키워드 자동 생성

### 2️⃣ **지능형 키워드 조합**

- 기본 키워드 + 관련 키워드 자동 조합
- 조합된 키워드로 새로운 검색 수행
- 예: "Python" + ["튜토리얼", "가이드", ...] → "Python 튜토리얼", "가이드 Python" 등

### 3️⃣ **반복 검색 자동화**

- 사용자가 지정한 횟수만큼 검색 반복
- 커스터마이징 가능한 검색 간 지연 시간
- 백그라운드에서 조용히 검색 (현재 탭 유지)

### 4️⃣ **실시간 진행 상황 모니터링**

- 진행 상황 바 (Progress Bar)
- 현재 검색어 및 진행률 표시
- 검색 로그 실시간 업데이트

### 5️⃣ **사용자 친화적 UI**

- Side Panel 기반 직관적 인터페이스
- 실시간 상태 업데이트
- 반응형 디자인

---

## 📦 요구사항

### 필수 사항

- **Chrome 버전**: 114 이상 (Side Panel API 지원)
- **운영체제**: Windows, macOS, Linux
- **인터넷 연결**: Bing 접근 필요

### 선택 사항

- VS Code (개발/수정할 경우)
- Node.js (빌드 자동화할 경우, 기본 설치 불필요)

---

## 📁 폴더 구조

```
auto-bing-search-extension/
│
├── 📄 README.md                    # 이 문서 (프로젝트 개요 및 가이드)
├── 📄 manifest.json               # Chrome 확장 설정 파일
│
├── 🔧 background.js               # Service Worker (핵심 로직)
│   ├─ 검색 상태 관리
│   ├─ 키워드 추출 및 조합
│   ├─ 자동 검색 수행
│   └─ UI와의 메시지 통신
├── 📝 content-script.js           ← Content Script (루트)
│
├── 🎨 UI 관련 파일/
│   ├── sidepanel.html             # Side Panel 마크업
│   ├── sidepanel.css              # Side Panel 스타일
│   └── sidepanel.js               # Side Panel 스크립트 (UI 제어)
│
├── 🛠️ utils/                       # 유틸리티 함수
│   ├── keyword-extractor.js       # 키워드 추출 헬퍼
│   └── search-combiner.js         # 키워드 조합 헬퍼
│
├── 📸 images/                     # 이미지 리소스
│   ├── icon-128.png              # 확장 아이콘 (128x128)
│   ├── icon-48.png               # 앱 관리자용 아이콘 (48x48)
│   └── icon-16.png               # 작은 아이콘 (16x16)
│
├── 📝 docs/                       # 추가 문서
│   ├── API_REFERENCE.md          # API 상세 명세
│   ├── DEVELOPMENT.md            # 개발자 가이드
│   └── TROUBLESHOOTING.md        # 트러블슈팅
│
└── 🧪 tests/                      # 테스트 파일 (선택)
    ├── background.test.js
    └── keyword-combiner.test.js
```

### 폴더별 상세 설명

| 폴더/파일        | 목적                       | 필수 여부 |
| ---------------- | -------------------------- | --------- |
| `manifest.json`  | Chrome 확장 설정           | ✅ 필수   |
| `background.js`  | 핵심 로직 (Service Worker) | ✅ 필수   |
| `sidepanel.html` | UI 구조                    | ✅ 필수   |
| `sidepanel.css`  | UI 스타일                  | ✅ 필수   |
| `sidepanel.js`   | UI 상호작용                | ✅ 필수   |
| `utils/`         | 헬퍼 함수                  | ⚠️ 권장   |
| `images/`        | 아이콘 리소스              | ⚠️ 권장   |
| `docs/`          | 추가 문서                  | ❌ 선택   |
| `tests/`         | 테스트                     | ❌ 선택   |

---

## 🚀 설치 방법

### 방법 1: 개발자 모드 설치 (권장)

#### **1단계: 파일 준비**

```bash
# 프로젝트 폴더 생성
mkdir auto-bing-search-extension
cd auto-bing-search-extension

# 위의 폴더 구조대로 파일 생성
# manifest.json, background.js, sidepanel.html 등 작성
```

#### **2단계: Chrome에 로드**

1. **Chrome 열기** → 주소창에 `chrome://extensions/` 입력
2. **개발자 모드 활성화** → 우측 상단의 "개발자 모드" 토글 ON
3. **확장 로드** → "압축해제된 확장 프로그램을 로드합니다" 클릭
4. **폴더 선택** → `auto-bing-search-extension` 폴더 선택
5. **설치 완료** ✅

#### **3단계: 확인**

- Chrome 우측 상단의 확장 아이콘에서 "Auto Bing Search" 확인
- 아이콘 클릭하면 Side Panel 열림

### 방법 2: 자동 스크립트 설치

```bash
# 설치 스크립트 실행 (macOS/Linux)
chmod +x install.sh
./install.sh
```

---

## 📖 사용 방법

### 기본 사용 흐름

```
1️⃣ 검색 키워드 입력
   ↓
2️⃣ 검색 횟수 설정 (1-100)
   ↓
3️⃣ "추출하기" 버튼으로 관련 키워드 자동 추출
   ↓
4️⃣ "검색 시작" 버튼 클릭
   ↓
5️⃣ 자동으로 Bing에서 순차 검색 수행
   ↓
6️⃣ 완료 후 결과 확인
```

### 단계별 상세 가이드

#### **1️⃣ Side Panel 열기**

```
Chrome 우측 상단의 "Auto Bing Search" 아이콘 클릭
→ Side Panel이 오른쪽에 열림
```

#### **2️⃣ 검색 설정**

```
┌─────────────────────────────────┐
│ 🎯 검색 키워드                   │
│ [Python_____________]            │
│                                  │
│ 📊 검색 횟수                      │
│ [5____] 회                       │
│                                  │
│ ⏱️ 검색 간 지연                   │
│ [2000__] ms                      │
└─────────────────────────────────┘

- 검색 키워드: 예) "Python", "Web Development"
- 검색 횟수: 1~100 범위
- 지연 시간: 500~10000ms (권장: 2000ms)
```

#### **3️⃣ 관련 키워드 추출**

```
버튼: "추출하기" 클릭
     ↓
자동으로 Bing에서 검색
     ↓
관련 키워드 20개 추출
     ↓
UI에 표시

예시 결과:
- Python 튜토리얼
- Python 강의
- Python 예제
- ... (20개)
```

#### **4️⃣ 검색 시작**

```
버튼: "검색 시작" 클릭
     ↓
자동으로 다음 검색 수행:
1. "Python 튜토리얼" 검색
   (2초 대기)
2. "튜토리얼 Python" 검색
   (2초 대기)
3. ... (반복)
```

#### **5️⃣ 진행 상황 모니터링**

```
┌─────────────────────────────────┐
│ 진행 상황                        │
│ [===========-----] 65%           │
│                                  │
│ 현재 검색어: Python 튜토리얼     │
│ 진행률: 13/20                   │
│ 상태: 검색 중...                 │
│                                  │
│ 📋 검색 로그                      │
│ ✓ Python 튜토리얼               │
│ ✓ 튜토리얼 Python               │
│ → Python 가이드 (검색 중)        │
└─────────────────────────────────┘
```

#### **6️⃣ 검색 중지**

```
버튼: "검색 중지" 클릭
     ↓
현재 진행 중인 검색 중단
     ↓
UI 초기화
```

---

## 📄 파일 설명

### **manifest.json**

```json
{
  "manifest_version": 3, // Chrome 확장 버전
  "name": "Auto Bing Search", // 확장 이름
  "version": "1.0", // 버전 번호
  "permissions": [
    // 필요한 권한
    "sidePanel", // Side Panel 사용
    "activeTab", // 현재 탭 접근
    "scripting", // 스크립트 실행
    "tabs" // 탭 관리
  ],
  "host_permissions": [
    // Bing 접근 권한
    "https://www.bing.com/*"
  ],
  "background": {
    "service_worker": "background.js" // 백그라운드 스크립트
  },
  "side_panel": {
    "default_path": "sidepanel.html" // Side Panel 경로
  }
}
```

### **background.js (Service Worker)**

| 함수/객체                     | 역할                                    |
| ----------------------------- | --------------------------------------- |
| `searchState`                 | 현재 검색 상태 저장 (키워드, 진행률 등) |
| `handleStartSearch()`         | 검색 시작 처리                          |
| `handleStopSearch()`          | 검색 중지 처리                          |
| `performSearch()`             | 실제 검색 수행                          |
| `extractAndCombineKeywords()` | 키워드 추출 및 조합                     |
| `combineKeywords()`           | 키워드 조합 생성                        |
| `generateFallbackKeywords()`  | 대체 키워드 생성                        |
| `notifyUI()`                  | UI에 상태 알림                          |

### **sidepanel.html**

구성 요소:

- 입력 섹션 (키워드, 횟수, 지연)
- 키워드 목록 섹션 (추출된 키워드 표시)
- 제어 버튼 (시작/중지)
- 진행 상황 섹션 (진행률, 로그)
- 고급 설정 (옵션)

### **sidepanel.js**

주요 기능:

```javascript
// UI 초기화
initializeUI()

// 키워드 추출 요청
async function extractKeywords()

// 검색 시작
async function startSearch()

// 검색 중지
function stopSearch()

// 상태 업데이트
function updateStatus(state)

// 진행률 업데이트
function updateProgress(current, total)
```

### **sidepanel.css**

스타일 구성:

- 반응형 레이아웃 (Side Panel 최적화)
- 다크/라이

계속해서 README.md의 나머지 부분을 작성하겠습니다.

---

## 🔍 핵심 기능 상세 설명

### 1. 키워드 추출 알고리즘

```
입력: "Python"
         ↓
    Bing 검색 수행
         ↓
    HTML 파싱 (검색 결과)
         ↓
    관련 검색어 추출 (검색 결과 하단)
         ↓
    중복 제거 및 정렬
         ↓
    상위 20개 선별
         ↓
결과: ["Python 튜토리얼", "Python 강의", ...]
```

**추출 대상:**

- Bing 검색 결과 하단의 "관련 검색"
- 검색 결과 타이틀
- 검색 결과 설명

**처리 로직:**

```javascript
// 1. 자동으로 임시 탭에서 검색
const tab = await chrome.tabs.create({
  url: `https://www.bing.com/search?q=${keyword}`,
  active: false,
});

// 2. 페이지 로드 대기 (2초)
await new Promise((resolve) => setTimeout(resolve, 2000));

// 3. Content Script로 키워드 추출
const response = await chrome.tabs.sendMessage(tab.id, {
  action: "extractKeywords",
});

// 4. 임시 탭 닫기
chrome.tabs.remove(tab.id);
```

### 2. 키워드 조합 방식

```
기본 키워드: "Python"
추출된 키워드: ["튜토리얼", "가이드", "예제", ...]

조합 결과:
┌──────────────────────────────┐
│ 조합 방식 1: 기본 + 관련      │
│ - Python 튜토리얼            │
│ - Python 가이드              │
│ - Python 예제                │
│                              │
│ 조합 방식 2: 관련 + 기본      │
│ - 튜토리얼 Python            │
│ - 가이드 Python              │
│ - 예제 Python                │
│                              │
│ 총 조합: 20개 × 2 = 40개    │
│ (중복 제거 후 20개 선별)     │
└──────────────────────────────┘
```

### 3. 자동 검색 시퀀스

```
시작: 검색 횟수 = 5

┌─ 검색 1 ────────────────┐
│ 키워드: "Python 튜토리얼"│
│ 새 탭에서 열기 (백그라운드)│
│ 2초 대기                │
└──────────────────────────┘
         ↓
┌─ 검색 2 ────────────────┐
│ 키워드: "튜토리얼 Python"│
│ 새 탭에서 열기 (백그라운드)│
│ 2초 대기                │
└──────────────────────────┘
         ↓
┌─ 검색 3 ────────────────┐
│ 키워드: "Python 가이드"  │
│ 새 탭에서 열기 (백그라운드)│
│ 2초 대기                │
└──────────────────────────┘
         ↓
    ... (반복)
         ↓
┌─ 완료 ──────────────────┐
│ 5개 검색 모두 완료       │
│ 총 소요 시간: ~10초      │
│ (2000ms × 5 = 10000ms)  │
└──────────────────────────┘
```

---

## 🔗 API 명세

### Service Worker ↔ Side Panel 통신

#### **1. 검색 시작 요청**

```javascript
// Side Panel → Service Worker
chrome.runtime.sendMessage({
  action: 'startSearch',
  keyword: 'Python',
  numSearches: 5,
  relatedKeywords: ['튜토리얼', '가이드', ...],
  delay: 2000
}, (response) => {
  if (response.success) {
    console.log('검색 시작됨');
  }
});
```

**파라미터:**
| 이름 | 타입 | 설명 | 기본값 |
|-----|------|------|-------|
| `action` | string | 액션 ID | - |
| `keyword` | string | 검색 키워드 | - |
| `numSearches` | number | 검색 횟수 | 5 |
| `relatedKeywords` | array | 관련 키워드 배열 | [] |
| `delay` | number | 검색 간 지연(ms) | 2000 |

#### **2. 검색 중지 요청**

```javascript
// Side Panel → Service Worker
chrome.runtime.sendMessage(
  {
    action: "stopSearch",
  },
  (response) => {
    if (response.success) {
      console.log("검색 중지됨");
    }
  },
);
```

#### **3. 상태 조회**

```javascript
// Side Panel → Service Worker
chrome.runtime.sendMessage(
  {
    action: "getStatus",
  },
  (response) => {
    console.log("현재 상태:", response);
    // {
    //   isRunning: boolean,
    //   currentKeyword: string,
    //   searchCount: number,
    //   maxSearches: number,
    //   delay: number
    // }
  },
);
```

#### **4. 키워드 추출 요청**

```javascript
// Side Panel → Service Worker
chrome.runtime.sendMessage(
  {
    action: "getRelatedKeywords",
    keyword: "Python",
  },
  (response) => {
    console.log("추출된 키워드:", response.keywords);
    // response.keywords = ['튜토리얼', '가이드', ...]
  },
);
```

#### **5. 상태 업데이트 알림 (Service Worker → Side Panel)**

```javascript
// Service Worker가 Side Panel에 상태 전송
chrome.runtime
  .sendMessage({
    action: "updateStatus",
    state: {
      status: "searching", // 'searching', 'completed', 'error'
      currentKeyword: "Python 튜토리얼",
      progress: 3,
      total: 5,
      message: "검색 진행 중...",
    },
  })
  .catch(() => {
    // Side Panel이 열려있지 않으면 무시
  });
```

---

## 🎨 UI 컴포넌트

### Side Panel 레이아웃

```
┌─────────────────────────────────┐
│  🔍 자동 Bing 검색              │ ← Header
├─────────────────────────────────┤
│ 🎯 검색 키워드                  │
│ [Python_____________]            │
│ 기본 검색어가 됩니다             │
│                                  │
│ 📊 검색 횟수                     │
│ [5____] 회                       │ ← Input Section
│ 1~100 범위에서 선택              │
│                                  │
│ ⏱️ 검색 간 지연                  │
│ [2000__] ms                      │
│ 각 검색 사이의 대기 시간          │
├─────────────────────────────────┤
│ 📝 관련 키워드 (자동 추출)       │
│ [추출하기]                       │
│                                  │
│ □ Python 튜토리얼               │
│ □ 튜토리얼 Python               │
│ □ Python 가이드                 │
│ □ 가이드 Python                 │ ← Keywords Section
│ ... (총 20개)                   │
│                                  │
│ 키워드를 입력하고 '추출하기'를   │
│ 클릭하세요                       │
├─────────────────────────────────┤
│ [🚀 검색 시작] [⏹️ 검색 중지]   │ ← Control Section
├─────────────────────────────────┤
│ 진행 상황                        │
│ [===========-----] 65%           │
│                                  │
│ 현재 검색어: Python 튜토리얼     │
│ 진행률: 13/20                    │ ← Progress Section
│ 상태: 검색 중...                 │
│                                  │
│ 📋 검색 로그                     │
│ ✓ Python 튜토리얼               │
│ ✓ 튜토리얼 Python               │
│ → Python 가이드 (검색 중)        │
├─────────────────────────────────┤
│ ⚙️ 고급 설정                    │
│ ☑ 백그라운드에서 검색            │ ← Settings Section
│ ☑ 키워드 조합 모드 활성화        │
└─────────────────────────────────┘
```

### CSS 클래스 구조

```css
/* 메인 컨테이너 */
.container {
}

/* 섹션별 */
.header {
}
.input-section {
}
.keywords-section {
}
.control-section {
}
.progress-section {
}
.settings-section {
}
.footer {
}

/* 입력 요소 */
.form-group {
}
.input-field {
}
.input-group {
}
.help-text {
}

/* 버튼 */
.btn {
}
.btn-primary {
} /* 검색 시작 */
.btn-danger {
} /* 검색 중지 */
.btn-secondary {
} /* 추출하기 */
.btn-large {
}
.btn-small {
}

/* 진행 상황 */
.progress-bar {
}
.progress-fill {
}
.progress-text {
}

/* 키워드 목록 */
.keywords-list {
}
.keyword-item {
}

/* 상태 박스 */
.status-box {
}
.status-item {
}

/* 로그 */
.search-log {
}
.log-entry {
}
.log-success {
}
.log-pending {
}
```

---

## 🧪 테스트 방법

### 단위 테스트

```javascript
// tests/keyword-combiner.test.js

describe("Keyword Combiner", () => {
  test("기본 키워드와 관련 키워드를 조합한다", () => {
    const main = "Python";
    const related = ["튜토리얼", "가이드"];
    const result = combineKeywords(main, related);

    expect(result).toContain("Python 튜토리얼");
    expect(result).toContain("튜토리얼 Python");
    expect(result.length).toBe(4);
  });

  test("중복 키워드를 제거한다", () => {
    const main = "Python";
    const related = ["튜토리얼", "튜토리얼"];
    const result = combineKeywords(main, related);

    expect(result.length).toBe(2); // 중복 제거됨
  });
});
```

### 수동 테스트 체크리스트

#### ✅ 기본 기능

- [ ] Side Panel 열기/닫기 작동
- [ ] 키워드 입력 입력창 작동
- [ ] 추출하기 버튼으로 키워드 추출 (2-3초 대기)
- [ ] 추출된 키워드 20개 표시
- [ ] 검색 시작 버튼 클릭 시 자동 검색 시작
- [ ] 지정된 횟수만큼 검색 반복
- [ ] 검색 중지 버튼으로 중단 가능

#### ✅ UI/UX

- [ ] 진행 상황 바 부드럽게 증가
- [ ] 검색 로그 실시간 업데이트
- [ ] 버튼 상태 올바르게 활성화/비활성화
- [ ] 반응형 레이아웃 (다양한 화면 크기)
- [ ] 다크 모드 대응

#### ✅ 성능

- [ ] 검색 간 지연 설정 작동
- [ ] 100개 검색도 안정적으로 수행
- [ ] 메모리 누수 없음 (DevTools 확인)
- [ ] 검색 중 Chrome 느려지지 않음

#### ✅ 엣지 케이스

- [ ] 빈 키워드로 검색 시 오류 처리
- [ ] 네트워크 끊김 시 오류 처리
- [ ] 검색 중간에 확장 비활성화
- [ ] 매우 긴 키워드 입력 (1000자)

---

## 🐛 트러블슈팅

### 문제 1: 키워드 추출 실패

**증상:**

```
"키워드를 입력하고 '추출하기'를 클릭하세요" 계속 표시됨
```

**원인:**

1. Bing 사이트 구조 변경
2. 네트워크 연결 끊김
3. Chrome 권한 부족

**해결 방법:**

```javascript
// background.js에서 다음 확인
console.log('키워드 추출 오류 확인');

// 1. 네트워크 확인
ping bing.com

// 2. Chrome 권한 확인
chrome://extensions/ → 확장 아이콘 우클릭 → "호스트 권한" 확인

// 3. 콘솔 오류 확인
chrome://extensions/ → 개발자 도구 → Console 확인
```

### 문제 2: 검색이 시작되지 않음

**증상:**

```
"검색 시작" 버튼 클릭해도 반응 없음
```

**원인:**

1. 키워드 입력 안 함
2. Service Worker 오류
3. 메모리 부
