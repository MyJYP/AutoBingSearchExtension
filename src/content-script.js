console.log("[Auto Bing Search] Content Script Loaded");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "extractKeywords") {
    const keywords = extractBingKeywords();
    console.log("[Content Script] Extracted:", keywords);
    sendResponse({ keywords });
  } else if (request.action === "extractSearchResults") {
    const results = extractBingResults();
    sendResponse({ results });
  }
});

function extractBingKeywords() {
  const keywords = new Set();

  // 1. 관련 검색어 (하단)
  const selectors = [
    ".b_rs ul li a",
    ".b_rs_item",
    ".b_algoContainer .b_ans_items li",
    "[data-query]",
    ".b_vList li a",
  ];

  selectors.forEach((selector) => {
    document.querySelectorAll(selector).forEach((el) => {
      const text = el.innerText || el.getAttribute("data-query");
      if (text) keywords.add(text.trim());
    });
  });

  // 2. 검색 제안 (상단/중간)
  document.querySelectorAll(".b_searchboxForm, .b_ans").forEach((el) => {
    if (el.innerText && el.innerText.length < 30) {
      // 너무 긴 텍스트는 제외
    }
  });

  // 필터링
  return Array.from(keywords)
    .filter((k) => k && k.length > 1 && k.length < 50) // 길이 제한
    .filter((k) => !k.includes("http")) // URL 제외
    .slice(0, 20); // 최대 20개
}

function extractBingResults() {
  const results = [];
  // Bing 검색 결과 아이템 선택자
  document.querySelectorAll(".b_algo").forEach((el) => {
    const titleEl = el.querySelector("h2 a");
    const snippetEl =
      el.querySelector(".b_caption p") || el.querySelector(".b_algoSlug");

    if (titleEl) {
      results.push({
        title: titleEl.innerText,
        url: titleEl.href,
        snippet: snippetEl ? snippetEl.innerText : "",
      });
    }
  });
  return results.slice(0, 3); // 상위 3개만 추출
}
