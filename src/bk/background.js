// Service Worker - 자동 Bing 검색 확장의 핵심
let searchState = {
  isRunning: false,
  currentKeyword: "",
  relatedKeywords: [],
  searchCount: 0,
  maxSearches: 0,
  delay: 2000, // 검색 간 지연(ms)
  currentIndex: 0,
};

// Side Panel 열기 설정
chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error("Side Panel 설정 오류:", error));
});

// Side Panel에서 메시지 수신
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "startSearch") {
    handleStartSearch(request);
    sendResponse({ success: true });
  } else if (request.action === "stopSearch") {
    handleStopSearch();
    sendResponse({ success: true });
  } else if (request.action === "getStatus") {
    sendResponse(searchState);
  } else if (request.action === "getRelatedKeywords") {
    extractAndCombineKeywords(request.keyword)
      .then((keywords) => sendResponse({ keywords }))
      .catch((error) => sendResponse({ error: error.message }));
    return true; // 비동기 응답 대기
  }
});

/**
 * 검색 시작 처리
 */
function handleStartSearch(request) {
  searchState.isRunning = true;
  searchState.currentKeyword = request.keyword;
  searchState.maxSearches = request.numSearches || 5;
  searchState.delay = request.delay || 2000;
  searchState.searchCount = 0;
  searchState.currentIndex = 0;
  searchState.relatedKeywords = request.relatedKeywords || [];

  console.log("검색 시작:", {
    keyword: searchState.currentKeyword,
    searches: searchState.maxSearches,
    relatedKeywords: searchState.relatedKeywords.length,
  });

  performSearch();
}

/**
 * 검색 중지 처리
 */
function handleStopSearch() {
  searchState.isRunning = false;
  searchState.searchCount = 0;
  console.log("검색 중지됨");
}

/**
 * 실제 검색 수행
 */
async function performSearch() {
  if (
    !searchState.isRunning ||
    searchState.searchCount >= searchState.maxSearches
  ) {
    searchState.isRunning = false;
    notifyUI({ status: "completed", message: "검색 완료!" });
    return;
  }

  try {
    let searchKeyword = searchState.currentKeyword;

    // 관련 키워드가 있으면 조합하여 사용
    if (searchState.relatedKeywords.length > 0) {
      const relatedKeyword =
        searchState.relatedKeywords[
          searchState.currentIndex % searchState.relatedKeywords.length
        ];
      searchKeyword = `${searchState.currentKeyword} ${relatedKeyword}`;
      searchState.currentIndex++;
    }

    // Bing 검색 URL 생성
    const searchUrl = `https://www.bing.com/search?q=${encodeURIComponent(searchKeyword)}`;

    // 새 탭에서 검색 수행
    await chrome.tabs.create({
      url: searchUrl,
      active: false, // 백그라운드에서 열기
    });

    searchState.searchCount++;

    // UI에 상태 업데이트
    notifyUI({
      status: "searching",
      currentKeyword: searchKeyword,
      progress: searchState.searchCount,
      total: searchState.maxSearches,
    });

    console.log(
      `검색 ${searchState.searchCount}/${searchState.maxSearches}: ${searchKeyword}`,
    );

    // 다음 검색 예약
    setTimeout(performSearch, searchState.delay);
  } catch (error) {
    console.error("검색 오류:", error);
    notifyUI({
      status: "error",
      message: `오류 발생: ${error.message}`,
    });
    searchState.isRunning = false;
  }
}

/**
 * UI에 상태 알림
 */
function notifyUI(state) {
  chrome.runtime
    .sendMessage({
      action: "updateStatus",
      state: state,
    })
    .catch(() => {
      // Side Panel이 열려있지 않으면 무시
    });
}

/**
 * Bing 검색 결과에서 관련 키워드 추출 및 조합
 */
async function extractAndCombineKeywords(keyword) {
  try {
    // Bing 검색 페이지 접근
    const searchUrl = `https://www.bing.com/search?q=${encodeURIComponent(keyword)}`;

    // 임시 탭에서 검색 결과 로드
    const tab = await chrome.tabs.create({
      url: searchUrl,
      active: false,
    });

    // 약간의 지연 후 콘텐츠 스크립트 실행
    await new Promise((resolve) => setTimeout(resolve, 2000));

    return new Promise((resolve) => {
      chrome.tabs.sendMessage(
        tab.id,
        { action: "extractKeywords" },
        (response) => {
          chrome.tabs.remove(tab.id); // 임시 탭 닫기

          if (response && response.keywords) {
            // 20개의 키워드를 조합하여 새로운 검색어 생성
            const combinedKeywords = combineKeywords(
              keyword,
              response.keywords,
            );
            resolve(combinedKeywords.slice(0, 20)); // 상위 20개만 반환
          } else {
            resolve(generateFallbackKeywords(keyword));
          }
        },
      );
    });
  } catch (error) {
    console.error("키워드 추출 오류:", error);
    return generateFallbackKeywords(keyword);
  }
}

/**
 * 키워드 조합 생성 (각 관련 키워드와 원본 키워드를 조합)
 */
function combineKeywords(mainKeyword, relatedKeywords) {
  const combined = [];

  // 각 관련 키워드를 원본과 조합
  relatedKeywords.forEach((related) => {
    combined.push(`${mainKeyword} ${related}`);
    combined.push(`${related} ${mainKeyword}`);
  });

  // 중복 제거 및 정렬
  return [...new Set(combined)].sort();
}

/**
 * 대체 키워드 생성 (Bing에서 키워드를 가져올 수 없을 때)
 */
function generateFallbackKeywords(keyword) {
  const suffixes = [
    "튜토리얼",
    "가이드",
    "예제",
    "사용법",
    "설명",
    "비교",
    "차이",
    "장점",
    "단점",
    "추천",
    "vs",
    "리뷰",
    "평가",
    "분석",
    "정보",
    "최신",
    "2024",
    "2025",
    "방법",
    "팁",
  ];

  return suffixes.map((suffix, index) => {
    if (index % 2 === 0) {
      return `${keyword} ${suffix}`;
    } else {
      return `${suffix} ${keyword}`;
    }
  });
}
