# [개발기] Bing Search Extension: 나만의 검색 흐름을 완성하다 (MyVibecoding)

**작성일:** 2024년 5월 14일  
**카테고리:** Chrome Extension, Web Development  
**태그:** #ChromeExtension #ManifestV3 #JavaScript #BingSearch #MyVibecoding

---

## 1. 프롤로그: 왜 또 다른 검색 도구인가?

개발자로서, 그리고 헤비 웹 유저로서 우리는 하루에도 수백 번씩 검색창을 두드립니다. 구글링이 일상이지만, 때로는 Bing의 검색 결과나 AI 기능(Copilot)이 필요할 때가 있습니다. 하지만 브라우저 탭을 새로 열고, 주소를 입력하고, 검색어를 다시 타이핑하는 과정은 미세하지만 분명한 '흐름(Flow)'의 끊김을 유발합니다.

**"MyVibecoding"**이라는 슬로건 아래, 저는 코딩과 웹 서핑의 리듬을 깨지 않는 도구를 만들고 싶었습니다. 단순히 검색 엔진을 연결하는 것을 넘어, 내가 원하는 방식대로 작동하는 **Bing Search Extension** 개발 프로젝트는 그렇게 시작되었습니다.

이 글에서는 Chrome Manifest V3 환경에서 어떻게 효율적인 검색 익스텐션을 구축했는지, 그 기술적인 여정을 상세히 회고해보고자 합니다.

---

## 2. 프로젝트 목표 및 요구사항 분석

본격적인 코딩에 앞서 정의한 핵심 목표는 다음과 같습니다.

### 2.1. 핵심 요구사항 (Requirements)

1.  **접근성 (Accessibility):** 어떤 탭에 있더라도 단축키나 아이콘 클릭 한 번으로 검색 창을 호출할 수 있어야 한다.
2.  **속도 (Performance):** 무거운 라이브러리 없이 바닐라 JS 기반으로 동작하여 브라우저 메모리 점유율을 최소화한다.
3.  **컨텍스트 통합 (Context Integration):** 웹페이지 내의 텍스트를 드래그했을 때, 우클릭 메뉴(Context Menu)를 통해 즉시 검색이 가능해야 한다.
4.  **보안 (Security):** Chrome의 최신 보안 정책인 Manifest V3를 완벽하게 준수한다.

이러한 요구사항은 단순해 보이지만, V3로 넘어오면서 바뀐 `Service Worker`의 생명주기 관리나 `Content Script`의 격리된 환경을 고려할 때 꽤 까다로운 기술적 도전 과제들을 포함하고 있습니다.

---

## 3. 기술적 아키텍처 (Technical Architecture)

이 프로젝트는 Chrome Extension의 표준 아키텍처를 따르되, 최적화를 위해 몇 가지 패턴을 적용했습니다.

### 3.1. Manifest V3의 도입

과거 V2 시절의 `background page`는 상주형 프로세스였지만, V3의 `Service Worker`는 이벤트 기반으로 동작하며 필요할 때만 깨어납니다. 이는 메모리 효율성 측면에서는 훌륭하지만, 상태(State)를 유지해야 하는 기능 구현에는 제약이 따릅니다.

```json
// manifest.json 설정 예시
{
  "manifest_version": 3,
  "name": "Bing Search Extension",
  "version": "1.0.0",
  "permissions": ["contextMenus", "storage", "activeTab"],
  "background": {
    "service_worker": "background.js"
  },
  ...
}
```

### 3.2. 메시지 패싱 (Message Passing) 구조

팝업(Popup), 백그라운드(Background), 그리고 실제 웹페이지에 주입되는 콘텐츠 스크립트(Content Script) 간의 통신은 익스텐션의 핵심입니다.

- **Popup -> Background:** 검색어 전달 및 검색 기록 저장 요청.
- **Background -> New Tab:** Bing 검색 결과 페이지 생성.
- **Content Script -> Background:** 드래그된 텍스트 정보 전달.

저는 이 통신 과정을 비동기적으로 처리하기 위해 `chrome.runtime.sendMessage`와 `chrome.runtime.onMessage` 리스너를 체계적으로 구조화했습니다.

---

## 4. 주요 기능 구현 과정 (Implementation Details)

### 4.1. 컨텍스트 메뉴(우클릭 검색) 구현

사용자가 텍스트를 드래그했을 때만 메뉴가 나타나도록 하는 것은 UX 측면에서 매우 중요합니다. `chrome.contextMenus.create` API를 사용하여 브라우저가 시작될 때 메뉴를 등록하고, `onclick` 이벤트를 핸들링하여 선택된 텍스트(`selectionText`)를 Bing 쿼리 URL로 변환했습니다.

```javascript
// background.js 일부
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "bing-search",
    title: "Bing에서 '%s' 검색",
    contexts: ["selection"],
  });
});
```

### 4.2. 팝업 UI와 검색 로직

팝업창은 HTML/CSS로 구성되며, 사용자가 익스텐션 아이콘을 눌렀을 때 나타납니다. 여기서 중요한 점은 **'포커스 관리'**입니다. 팝업이 열리자마자 input 창에 포커스가 가야 키보드에서 손을 떼지 않고 검색할 수 있습니다.

---

## 5. 개발 중 마주친 이슈와 해결 (Troubleshooting)

### 5.1. CSP (Content Security Policy) 위반 문제

초기 개발 단계에서 인라인 스크립트(HTML 내의 `<script>`)를 사용하려다 V3의 강화된 보안 정책에 의해 차단되는 경험을 했습니다.

- **문제:** `Refused to execute inline script...` 에러 발생.
- **해결:** 모든 자바스크립트 로직을 별도의 `.js` 파일로 분리하고, HTML에서는 이를 로드하는 방식으로 전면 리팩토링했습니다. 이는 코드의 유지보수성을 높이는 결과도 가져왔습니다.

### 5.2. Service Worker의 비활성화(Inactivity) 문제

Service Worker는 일정 시간 사용하지 않으면 유휴 상태(Idle)로 전환됩니다. 이로 인해 간혹 컨텍스트 메뉴 클릭 시 반응이 늦거나 이벤트가 씹히는 현상이 발생할 수 있습니다. 이를 방지하기 위해 중요 이벤트 리스너는 최상위 레벨에 등록하여 워커가 깨어날 때 즉시 바인딩되도록 조치했습니다.

---

## 6. MyVibecoding: 나만의 코딩 철학

이 프로젝트의 폴더명에도 들어있는 `MyVibecoding`은 단순한 네이밍이 아닙니다. 이는 **"도구가 나의 생각 속도를 따라와야 한다"**는 철학입니다.

기존의 검색 방식이 [마우스 이동 -> 클릭 -> 타이핑 -> 엔터]의 4단계였다면, 이 익스텐션을 통해 [단축키 -> 타이핑 -> 엔터] 또는 [드래그 -> 우클릭]으로 단계를 축소했습니다. 1초의 차이지만, 하루 100번이면 100초, 1년이면 엄청난 시간이 절약됩니다. 무엇보다 '몰입'이 깨지지 않는다는 점이 가장 큰 가치입니다.

---

## 7. 향후 계획 (Roadmap)

현재 버전 1.0.0은 기본기에 충실하지만, 앞으로 다음과 같은 기능들을 추가할 예정입니다.

1.  **AI 요약 기능 통합:** Bing Chat(Copilot) API와 연동하여 검색 결과 요약을 팝업에서 바로 확인.
2.  **다크 모드 지원:** 시스템 설정에 따른 UI 테마 자동 변경.
3.  **음성 검색:** 타이핑조차 귀찮은 순간을 위한 Web Speech API 도입.

---

## 8. 마치며

작은 크롬 익스텐션 하나를 만드는 과정이었지만, 그 안에는 웹의 동작 원리, 브라우저의 보안 정책, 그리고 사용자 경험(UX)에 대한 깊은 고민이 담겨 있었습니다. 이 프로젝트가 저와 같은 '프로 검색러'들에게 조금이나마 도움이 되기를 바랍니다.

**Happy Coding, Happy Searching!**
