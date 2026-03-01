/**
 * ═══════════════════════════════════════════════════════════════
 * Content Script - Bing 페이지에서 키워드 추출
 * ═══════════════════════════════════════════════════════════════
 */

// Service Worker의 메시지 수신
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("[Content Script] 메시지 수신:", request.action);

  if (request.action === "extractKeywords") {
    try {
      const keywords = extractBingKeywords();
      sendResponse({ keywords });
      console.log("[Content Script] 키워드 추출 완료:", keywords.length);
    } catch (error) {
      console.error("[Content Script] 추출 오류:", error);
      sendResponse({ keywords: [], error: error.message });
    }
  }
});

/**
 * Bing 검색 결과에서 관련 키워드 추출
 */
function extractBingKeywords() {
  const keywords = new Set();

  // 1. "관련 검색" 섹션에서 추출
  const relatedSearchElements = document.querySelectorAll(
    ".b_rs_item, .b_algoContainer .b_ans_items li, [data-query]",
  );

  relatedSearchElements.forEach((el) => {
    const text = el.textContent || el.getAttribute("data-query");
    if (text) {
      keywords.add(text.trim());
    }
  });

  // 2. 검색 결과 제목에서 추출 (키워드 분석)
  const resultTitles = document.querySelectorAll("h2 a, .b_title span");
  resultTitles.forEach((el) => {
    const text = el.textContent;
    if (text && text.length > 0 && text.length < 200) {
      // 의미있는 단어만 추출
      const words = text.split(/[\s\-]/);
      words.forEach((word) => {
        if (word.length > 2) {
          keywords.add(word.trim());
        }
      });
    }
  });

  // 3. 검색 제안 드롭다운에서 추출
  const suggestions = document.querySelectorAll('[role="option"], .b_dd_item');
  suggestions.forEach((el) => {
    const text = el.textContent;
    if (text && text.length < 100) {
      keywords.add(text.trim());
    }
  });

  // 4. URL 구조 기반 추출
  const urlParams = new URLSearchParams(window.location.search);
  const mainKeyword = urlParams.get("q") || "";

  // 필터링 및 정렬
  let result = Array.from(keywords)
    .filter((keyword) => {
      // 빈 문자열 제거
      if (!keyword) return false;

      // 중복 제거 (대소문자 무시)
      if (keyword.toLowerCase() === mainKeyword.toLowerCase()) return false;

      // 길이 확인
      if (keyword.length < 2 || keyword.length > 100) return false;

      // 특수문자 많음 제거
      if (/[!@#$%^&*()+=\[\]{}|;:",.<>?/~`]/.test(keyword)) return false;

      return true;
    })
    .sort((a, b) => b.length - a.length) // 긴 것부터 정렬
    .slice(0, 20); // 상위 20개만

  console.log("[추출 결과]", result);
  return result;
}

/**
 * 대체 방법: API를 통한 키워드 추출 (선택사항)
 */
async function extractKeywordsViaAPI(keyword) {
  try {
    // Bing Suggestion API 사용 (비공식)
    const response = await fetch(
      `https://www.bing.com/api/v7.1/sugg?q=${encodeURIComponent(keyword)}`,
    );
    const data = await response.json();

    if (data.suggestionGroups && data.suggestionGroups[0]) {
      return data.suggestionGroups[0].searchSuggestions
        .map((item) => item.displayText)
        .slice(0, 20);
    }
  } catch (error) {
    console.error("[API 추출 오류]", error);
  }

  return [];
}
// 끝
// ───────────────────────────────────────────────────────────────
