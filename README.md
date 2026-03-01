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

---

## 🚀 설치 방법

### 방법 1: 개발자 모드 설치 (권장)

#### **1단계: 파일 준비**

프로젝트 폴더를 준비하고 필요한 파일들이 모두 있는지 확인합니다.

#### **2단계: Chrome에 로드**

1. **Chrome 열기** → 주소창에 `chrome://extensions/` 입력
2. **개발자 모드 활성화** → 우측 상단의 "개발자 모드" 토글 ON
3. **확장 로드** → "압축해제된 확장 프로그램을 로드합니다" 클릭
4. **폴더 선택** → 프로젝트 폴더 선택
5. **설치 완료** ✅

#### **3단계: 확인**

- Chrome 우측 상단의 확장 아이콘에서 "Auto Bing Search" 확인
- 아이콘 클릭하면 Side Panel 열림

---

## 📖 사용 방법

### 기본 사용 흐름

1. **Side Panel 열기**: Chrome 우측 상단의 아이콘 클릭
2. **검색 설정**:
   - **검색 키워드**: 예) "Python"
   - **검색 횟수**: 1~100회 설정
   - **지연 시간**: 2000ms (권장)
3. **키워드 추출**: "추출하기" 버튼 클릭 → 관련 키워드 20개 자동 로드
4. **검색 시작**: "검색 시작" 버튼 클릭 → 자동 검색 수행
5. **모니터링**: 진행 상황 바와 로그를 통해 상태 확인

---

## 📄 파일 설명

### **manifest.json**

확장 프로그램의 권한과 설정을 정의합니다. `sidePanel`, `activeTab`, `scripting` 권한을 사용하며 Bing 도메인에 대한 호스트 권한을 가집니다.

### **background.js (Service Worker)**

- `searchState`: 현재 검색 상태(키워드, 진행률) 관리
- `handleStartSearch()`: 검색 프로세스 시작
- `performSearch()`: 실제 Bing 검색 수행 (백그라운드 탭)
- `extractAndCombineKeywords()`: 키워드 추출 및 조합 로직

### **sidepanel.js**

- UI 이벤트 리스너 등록
- 사용자의 입력값 검증
- Service Worker와 메시지 통신 (`chrome.runtime.sendMessage`)
- 진행률(Progress Bar) 및 로그 업데이트

---

## 🔍 핵심 기능 상세 설명

### 1. 키워드 추출 알고리즘

1. 입력된 키워드로 임시 탭에서 Bing 검색 수행
2. Content Script가 검색 결과 페이지의 "관련 검색(Related Searches)" 섹션 파싱
3. 텍스트 정제 및 중복 제거 후 상위 20개 선별
4. 임시 탭 자동 종료

### 2. 키워드 조합 방식

기본 키워드와 추출된 관련 키워드를 앞뒤로 조합하여 다양한 검색 패턴을 생성합니다.

- 패턴 A: `[기본 키워드] + [관련 키워드]`
- 패턴 B: `[관련 키워드] + [기본 키워드]`

### 3. 자동 검색 시퀀스

설정된 지연 시간(Delay)을 준수하며 순차적으로 검색을 수행합니다. 이는 검색 엔진의 과도한 요청 차단을 방지하고 브라우저 성능을 유지하기 위함입니다.

---

## 🔗 API 명세 (Message Passing)

| Action         | 방향       | 설명               | 파라미터                          |
| -------------- | ---------- | ------------------ | --------------------------------- |
| `startSearch`  | Panel → BG | 검색 시작 요청     | `keyword`, `numSearches`, `delay` |
| `stopSearch`   | Panel → BG | 검색 중지 요청     | -                                 |
| `getStatus`    | Panel → BG | 현재 상태 요청     | -                                 |
| `updateStatus` | BG → Panel | 상태 업데이트 알림 | `state` 객체                      |

---

## 🐛 트러블슈팅

### Q. "추출하기" 버튼을 눌러도 반응이 없어요.

- **A:** 인터넷 연결을 확인하고, Bing 사이트 접속이 가능한지 확인하세요. 일시적인 네트워크 오류일 수 있습니다.

### Q. 검색이 중간에 멈춥니다.

- **A:** 너무 짧은 지연 시간(500ms 미만)을 설정하면 Bing에서 요청을 차단할 수 있습니다. 지연 시간을 2000ms 이상으로 설정해 주세요.

### Q. Side Panel이 열리지 않아요.

- **A:** Chrome 브라우저가 최신 버전(114 이상)인지 확인하고, 확장 프로그램을 제거 후 다시 로드해 보세요.

---

## 👨‍💻 개발자 정보

- **Project**: MyVibecoding - Auto Bing Search
- **License**: MIT

---

_Happy Coding, Happy Searching!_
