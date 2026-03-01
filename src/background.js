// Service Worker - 자동 Bing 검색 확장의 핵심
let searchState = {
  isRunning: false,
  currentKeyword: "",
  relatedKeywords: [],
  searchCount: 0,
  maxSearches: 0,
  delay: 2000,
  currentIndex: 0,
  combineMode: true,
  autoCloseTab: true,
  lastTabId: null,
};

// Side Panel 열기 설정
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error("Side Panel 설정 오류:", error));

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

function handleStartSearch(request) {
  searchState = {
    ...searchState,
    isRunning: true,
    currentKeyword: request.keyword,
    maxSearches: request.numSearches || 5,
    delay: request.delay || 2000,
    searchCount: 0,
    currentIndex: 0,
    relatedKeywords: request.relatedKeywords || [],
    combineMode: request.combineMode !== false, // 기본값 true
    autoCloseTab: request.autoCloseTab !== false, // 기본값 true
    lastTabId: null,
  };

  console.log("검색 시작:", searchState);
  performSearch();
}

function handleStopSearch() {
  searchState.isRunning = false;
  notifyUI({ status: "stopped", message: "검색이 중지되었습니다." });
}

async function performSearch() {
  if (!searchState.isRunning) return;

  if (searchState.searchCount >= searchState.maxSearches) {
    searchState.isRunning = false;
    notifyUI({ status: "completed", message: "모든 검색이 완료되었습니다." });
    return;
  }

  try {
    // 이전 탭 닫기 (설정된 경우)
    if (searchState.autoCloseTab && searchState.lastTabId) {
      try {
        await chrome.tabs.remove(searchState.lastTabId);
      } catch (e) {
        /* 이미 닫힘 */
      }
    }

    let searchKeyword = searchState.currentKeyword;

    // 키워드 조합 모드
    if (searchState.combineMode && searchState.relatedKeywords.length > 0) {
      const related =
        searchState.relatedKeywords[
          searchState.currentIndex % searchState.relatedKeywords.length
        ];
      // 짝수번은 "메인 + 서브", 홀수번은 "서브 + 메인"
      if (searchState.currentIndex % 2 === 0) {
        searchKeyword = `${searchState.currentKeyword} ${related}`;
      } else {
        searchKeyword = `${related} ${searchState.currentKeyword}`;
      }
      searchState.currentIndex++;
    }

    // Bing 검색 수행
    const tab = await chrome.tabs.create({
      url: `https://www.bing.com/search?q=${encodeURIComponent(searchKeyword)}`,
      active: false,
    });

    searchState.lastTabId = tab.id;
    searchState.searchCount++;

    notifyUI({
      status: "searching",
      currentKeyword: searchKeyword,
      progress: searchState.searchCount,
      total: searchState.maxSearches,
      message: `검색 중 (${searchState.searchCount}/${searchState.maxSearches})`,
    });

    // 페이지 로딩 대기 (2초) 후 결과 추출
    await new Promise((resolve) => setTimeout(resolve, 2000));

    try {
      const response = await chrome.tabs.sendMessage(tab.id, {
        action: "extractSearchResults",
      });
      if (response && response.results) {
        notifyUI({
          status: "results",
          results: response.results,
          keyword: searchKeyword,
        });
      }
    } catch (e) {
      console.log("결과 추출 실패 (탭이 닫혔거나 로드 지연):", e);
    }

    // 다음 검색 예약
    setTimeout(performSearch, searchState.delay);
  } catch (error) {
    console.error("검색 오류:", error);
    notifyUI({ status: "error", message: `오류: ${error.message}` });
    searchState.isRunning = false;
  }
}

function notifyUI(state) {
  chrome.runtime.sendMessage({ action: "updateStatus", state }).catch(() => {});
}

async function extractAndCombineKeywords(keyword) {
  try {
    // 키워드 추출을 위한 임시 탭 생성
    const tab = await chrome.tabs.create({
      url: `https://www.bing.com/search?q=${encodeURIComponent(keyword)}`,
      active: false,
    });

    // 페이지 로딩 대기 (2초)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Content Script에 추출 요청
    return new Promise((resolve) => {
      chrome.tabs.sendMessage(
        tab.id,
        { action: "extractKeywords" },
        (response) => {
          chrome.tabs.remove(tab.id).catch(() => {}); // 탭 닫기

          if (chrome.runtime.lastError) {
            console.warn("추출 실패 (통신 오류):", chrome.runtime.lastError);
            resolve([]);
            return;
          }

          if (response && response.keywords) {
            resolve(response.keywords.slice(0, 20));
          } else {
            resolve([]);
          }
        },
      );
    });
  } catch (error) {
    return [];
  }
}
