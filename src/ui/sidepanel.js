document.addEventListener("DOMContentLoaded", () => {
  const els = {
    keyword: document.getElementById("keyword"),
    numSearches: document.getElementById("numSearches"),
    delay: document.getElementById("delay"),
    extractBtn: document.getElementById("extractBtn"),
    keywordsList: document.getElementById("keywordsList"),
    startBtn: document.getElementById("startBtn"),
    stopBtn: document.getElementById("stopBtn"),
    progressContainer: document.getElementById("progressContainer"),
    progressFill: document.getElementById("progressFill"),
    progressText: document.getElementById("progressText"),
    currentKeyword: document.getElementById("currentKeyword"),
    progressPercentage: document.getElementById("progressPercentage"),
    searchLog: document.getElementById("searchLog"),
    combineMode: document.getElementById("combineMode"),
    autoCloseTab: document.getElementById("autoCloseTab"),
    searchResults: document.getElementById("searchResults"),
    clearResultsBtn: document.getElementById("clearResultsBtn"),
  };

  let extractedKeywords = [];

  // 1. 키워드 추출
  els.extractBtn.addEventListener("click", () => {
    const keyword = els.keyword.value.trim();
    if (!keyword) return alert("키워드를 입력해주세요.");

    els.extractBtn.disabled = true;
    els.extractBtn.textContent = "추출 중...";
    els.keywordsList.innerHTML =
      '<p class="placeholder">Bing에서 추출 중...</p>';

    chrome.runtime.sendMessage(
      { action: "getRelatedKeywords", keyword },
      (response) => {
        els.extractBtn.disabled = false;
        els.extractBtn.textContent = "🔄 추출하기";

        if (response && response.keywords && response.keywords.length > 0) {
          extractedKeywords = response.keywords;
          renderKeywords();
        } else {
          els.keywordsList.innerHTML =
            '<p class="placeholder">추출된 키워드가 없습니다.</p>';
        }
      },
    );
  });

  // 2. 검색 시작
  els.startBtn.addEventListener("click", () => {
    const keyword = els.keyword.value.trim();
    if (!keyword) return alert("키워드를 입력해주세요.");

    els.progressContainer.style.display = "block";
    els.searchLog.innerHTML = "";

    chrome.runtime.sendMessage({
      action: "startSearch",
      keyword,
      numSearches: parseInt(els.numSearches.value, 10),
      delay: parseInt(els.delay.value, 10),
      relatedKeywords: extractedKeywords,
      combineMode: els.combineMode.checked,
      autoCloseTab: els.autoCloseTab.checked,
    });
  });

  // 3. 검색 중지
  els.stopBtn.addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "stopSearch" });
  });

  // 4. 결과 지우기
  if (els.clearResultsBtn) {
    els.clearResultsBtn.addEventListener("click", () => {
      els.searchResults.innerHTML = "";
    });
  }

  // 5. 상태 업데이트 수신
  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "updateStatus") {
      updateUI(message.state);
    }
  });

  function renderKeywords() {
    els.keywordsList.innerHTML = "";
    els.keywordsList.classList.remove("empty");
    extractedKeywords.forEach((kw) => {
      const span = document.createElement("span");
      span.className = "keyword-item";
      span.textContent = kw;
      els.keywordsList.appendChild(span);
    });
  }

  function updateUI(state) {
    const { status, message, currentKeyword, progress, total, results } = state;

    // 버튼 상태
    const isRunning = status === "searching";
    els.startBtn.disabled = isRunning;
    els.stopBtn.disabled = !isRunning;
    els.extractBtn.disabled = isRunning;

    // 진행률
    if (total > 0) {
      const percent = Math.round((progress / total) * 100);
      els.progressFill.style.width = `${percent}%`;
      els.progressPercentage.textContent = `${percent}%`;
      els.progressText.textContent = `${progress} / ${total}`;
    }

    // 현재 키워드
    if (currentKeyword) {
      els.currentKeyword.textContent = currentKeyword;
    }

    // 로그
    if (message) {
      const div = document.createElement("div");
      div.className = `log-entry ${status}`;
      div.textContent = message;
      els.searchLog.prepend(div);
    }

    // 검색 결과 렌더링
    if (status === "results" && results) {
      results.forEach((item) => {
        const card = document.createElement("div");
        card.className = "result-card";
        card.innerHTML = `
          <a href="${item.url}" target="_blank" class="result-title">${item.title}</a>
          <div class="result-snippet">${item.snippet}</div>
        `;
        els.searchResults.prepend(card);
      });
      // 최대 50개까지만 유지
      while (els.searchResults.children.length > 50) {
        els.searchResults.removeChild(els.searchResults.lastChild);
      }
    }

    if (status === "completed" || status === "stopped" || status === "error") {
      els.progressFill.classList.remove("active");
    } else {
      els.progressFill.classList.add("active");
    }
  }
});
