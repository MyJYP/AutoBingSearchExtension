document.addEventListener("DOMContentLoaded", () => {
  // DOM 요소 참조
  const els = {
    keyword: document.getElementById("keyword"),
    count: document.getElementById("count"),
    delay: document.getElementById("delay"),
    btnExtract: document.getElementById("btn-extract"),
    keywordsList: document.getElementById("keywords-list"),
    btnStart: document.getElementById("btn-start"),
    btnStop: document.getElementById("btn-stop"),
    progressFill: document.getElementById("progress-fill"),
    progressText: document.getElementById("progress-text"),
    currentKeyword: document.getElementById("current-keyword"),
    searchLog: document.getElementById("search-log"),
  };

  let extractedKeywords = [];

  // 1. 키워드 추출 버튼 핸들러
  els.btnExtract.addEventListener("click", async () => {
    const keyword = els.keyword.value.trim();
    if (!keyword) {
      alert("키워드를 입력해주세요.");
      return;
    }

    els.btnExtract.disabled = true;
    els.btnExtract.textContent = "추출 중...";
    els.keywordsList.innerHTML =
      '<p class="placeholder">Bing에서 키워드 추출 중...</p>';

    // 새 탭을 열어 검색 수행 (Content Script가 실행됨)
    const tab = await chrome.tabs.create({
      url: `https://www.bing.com/search?q=${encodeURIComponent(keyword)}`,
      active: false,
    });

    // 5초 후 탭 닫기 (안전장치)
    setTimeout(() => {
      chrome.tabs.remove(tab.id).catch(() => {});
      els.btnExtract.disabled = false;
      els.btnExtract.textContent = "추출하기";
    }, 5000);
  });

  // 2. 추출된 키워드 수신 (Background -> Sidepanel)
  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "keywordsExtracted") {
      extractedKeywords = message.keywords.slice(0, 20); // 최대 20개
      renderKeywords();
      els.btnExtract.disabled = false;
      els.btnExtract.textContent = "추출하기";
    } else if (message.action === "updateStatus") {
      updateStatus(message.state);
    }
  });

  // 3. 검색 시작 버튼
  els.btnStart.addEventListener("click", () => {
    const keyword = els.keyword.value.trim();
    if (!keyword) {
      alert("키워드를 입력해주세요.");
      return;
    }

    const numSearches = parseInt(els.count.value, 10);
    const delay = parseInt(els.delay.value, 10);

    chrome.runtime.sendMessage({
      action: "startSearch",
      keyword,
      numSearches,
      relatedKeywords: extractedKeywords,
      delay,
    });

    setRunningState(true);
  });

  // 4. 검색 중지 버튼
  els.btnStop.addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "stopSearch" });
  });

  // 유틸리티 함수들
  function renderKeywords() {
    els.keywordsList.innerHTML = "";
    els.keywordsList.classList.remove("empty");

    if (extractedKeywords.length === 0) {
      els.keywordsList.innerHTML =
        '<p class="placeholder">추출된 키워드가 없습니다.</p>';
      return;
    }

    extractedKeywords.forEach((kw) => {
      const span = document.createElement("span");
      span.className = "keyword-item";
      span.textContent = kw;
      els.keywordsList.appendChild(span);
    });
  }

  function updateStatus(state) {
    const { status, message, currentKeyword, progress, total } = state;

    // 진행률 업데이트
    const percent = total > 0 ? Math.round((progress / total) * 100) : 0;
    els.progressFill.style.width = `${percent}%`;
    els.progressText.textContent = `${percent}% (${progress}/${total})`;
    els.currentKeyword.textContent = currentKeyword || "-";

    // 로그 추가
    if (currentKeyword) {
      const logEntry = document.createElement("div");
      logEntry.className = `log-entry ${status === "completed" ? "success" : "pending"}`;
      logEntry.textContent = `${message}`;
      els.searchLog.prepend(logEntry);
    }

    if (status === "completed" || status === "stopped" || status === "error") {
      setRunningState(false);
    } else {
      setRunningState(true);
    }
  }

  function setRunningState(isRunning) {
    els.btnStart.disabled = isRunning;
    els.btnStop.disabled = !isRunning;
    els.keyword.disabled = isRunning;
    els.count.disabled = isRunning;
    els.delay.disabled = isRunning;
    els.btnExtract.disabled = isRunning;
    if (isRunning) els.progressFill.classList.add("active");
    else els.progressFill.classList.remove("active");
  }
});
