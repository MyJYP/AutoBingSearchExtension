/**
 * ═══════════════════════════════════════════════════════════════
 * Side Panel 스크립트 - UI 제어 및 상호작용 (완전 버전)
 * ═══════════════════════════════════════════════════════════════
 */

// ───────────────────────────────────────────────────────────────
// 1. DOM 요소 캐싱
// ───────────────────────────────────────────────────────────────

const elements = {
  // 입력 요소
  keyword: document.getElementById("keyword"),
  numSearches: document.getElementById("numSearches"),
  delay: document.getElementById("delay"),

  // 버튼
  extractBtn: document.getElementById("extractBtn"),
  startBtn: document.getElementById("startBtn"),
  stopBtn: document.getElementById("stopBtn"),
  clearBtn: document.getElementById("clearBtn"),

  // 키워드 관련
  keywordsList: document.getElementById("keywordsList"),

  // 진행 상황 관련
  progressContainer: document.getElementById("progressContainer"),
  progressFill: document.getElementById("progressFill"),
  progressText: document.getElementById("progressText"),
  progressPercentage: document.getElementById("progressPercentage"),

  // 상태 정보
  currentKeyword: document.getElementById("currentKeyword"),
  statusText: document.getElementById("statusText"),
  elapsedTime: document.getElementById("elapsedTime"),
  remainingTime: document.getElementById("remainingTime"),

  // 로그
  searchLog: document.getElementById("searchLog"),

  // 설정
  backgroundSearch: document.getElementById("backgroundSearch"),
  combineMode: document.getElementById("combineMode"),
  autoCloseTab: document.getElementById("autoCloseTab"),

  // 링크
  feedbackLink: document.getElementById("feedbackLink"),
};

// ───────────────────────────────────────────────────────────────
// 2. 상태 관리
// ───────────────────────────────────────────────────────────────

let state = {
  isSearching: false,
  extractedKeywords: [],
  startTime: null,
  searchCount: 0,
  totalSearches: 0,
  timerInterval: null,
};

// ───────────────────────────────────────────────────────────────
// 3. 초기화 함수
// ───────────────────────────────────────────────────────────────

/**
 * Side Panel 초기화
 */
function initializePanel() {
  console.log("[초기화] Side Panel 시작");

  // 이벤트 리스너 등록
  attachEventListeners();

  // Local Storage에서 저장된 설정 복원
  loadSettings();

  // Service Worker와의 통신 설정
  setupMessageListener();

  // 피드백 링크 설정
  setupFeedbackLink();

  console.log("[초기화] 완료");
}

/**
 * 이벤트 리스너 등록
 */
function attachEventListeners() {
  // 키워드 입력 (엔터 키로도 추출 가능)
  elements.keyword.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      extractKeywords();
    }
  });

  // 추출 버튼
  elements.extractBtn.addEventListener("click", extractKeywords);

  // 검색 시작 버튼
  elements.startBtn.addEventListener("click", startSearch);

  // 검색 중지 버튼
  elements.stopBtn.addEventListener("click", stopSearch);

  // 로그 지우기 버튼
  elements.clearBtn.addEventListener("click", clearLog);

  // 숫자 입력 유효성 검사
  elements.numSearches.addEventListener("change", validateNumberInput);
  elements.delay.addEventListener("change", validateNumberInput);

  // 설정 저장
  elements.backgroundSearch.addEventListener("change", saveSettings);
  elements.combineMode.addEventListener("change", saveSettings);
  elements.autoCloseTab.addEventListener("change", saveSettings);
}

/**
 * 번호 입력 유효성 검사
 */
function validateNumberInput(e) {
  const input = e.target;

  if (input === elements.numSearches) {
    if (input.value < 1) input.value = 1;
    if (input.value > 100) input.value = 100;
  } else if (input === elements.delay) {
    if (input.value < 500) input.value = 500;
    if (input.value > 10000) input.value = 10000;
  }

  saveSettings();
}

/**
 * Local Storage에서 설정 복원
 */
function loadSettings() {
  try {
    const saved = localStorage.getItem("bingSearchSettings");
    if (saved) {
      const settings = JSON.parse(saved);

      if (settings.keyword) elements.keyword.value = settings.keyword;
      if (settings.numSearches)
        elements.numSearches.value = settings.numSearches;
      if (settings.delay) elements.delay.value = settings.delay;
      if (settings.backgroundSearch !== undefined)
        elements.backgroundSearch.checked = settings.backgroundSearch;
      if (settings.combineMode !== undefined)
        elements.combineMode.checked = settings.combineMode;
      if (settings.autoCloseTab !== undefined)
        elements.autoCloseTab.checked = settings.autoCloseTab;

      console.log("[설정] 이전 설정 복원됨");
    }
  } catch (error) {
    console.error("[설정 오류]", error);
  }
}

/**
 * 설정 저장
 */
function saveSettings() {
  try {
    const settings = {
      keyword: elements.keyword.value,
      numSearches: parseInt(elements.numSearches.value),
      delay: parseInt(elements.delay.value),
      backgroundSearch: elements.backgroundSearch.checked,
      combineMode: elements.combineMode.checked,
      autoCloseTab: elements.autoCloseTab.checked,
      timestamp: new Date().toISOString(),
    };

    localStorage.setItem("bingSearchSettings", JSON.stringify(settings));
    console.log("[설정] 저장됨", settings);
  } catch (error) {
    console.error("[설정 저장 오류]", error);
  }
}

/**
 * 피드백 링크 설정
 */
function setupFeedbackLink() {
  const feedbackUrl =
    "https://github.com/yourusername/auto-bing-search-extension/issues";
  elements.feedbackLink.href = feedbackUrl;
  elements.feedbackLink.onclick = (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: feedbackUrl });
  };
}

// ───────────────────────────────────────────────────────────────
// 4. Service Worker 통신
// ───────────────────────────────────────────────────────────────

/**
 * Service Worker와의 메시지 수신 설정
 */
function setupMessageListener() {
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("[메시지 수신]", request.action);

    if (request.action === "updateStatus") {
      updateProgressUI(request.state);
    }

    sendResponse({ received: true });
  });
}

/**
 * Service Worker에 메시지 전송 (Promise 버전)
 */
function sendToBackground(action, data = {}) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ action, ...data }, (response) => {
      if (chrome.runtime.lastError) {
        console.error("[통신 오류]", chrome.runtime.lastError);
        reject(chrome.runtime.lastError);
      } else {
        resolve(response);
      }
    });
  });
}

// ───────────────────────────────────────────────────────────────
// 5. 키워드 추출 기능
// ───────────────────────────────────────────────────────────────

/**
 * 관련 키워드 추출
 */
async function extractKeywords() {
  const keyword = elements.keyword.value.trim();

  // 유효성 검사
  if (!keyword) {
    showError("키워드를 입력해주세요");
    return;
  }

  if (keyword.length > 100) {
    showError("키워드는 100자 이하여야 합니다");
    return;
  }

  // UI 상태 업데이트
  elements.extractBtn.disabled = true;
  elements.extractBtn.textContent = "⏳ 추출 중...";

  try {
    console.log("[추출 시작]", keyword);

    // Service Worker에 키워드 추출 요청
    const response = await sendToBackground("getRelatedKeywords", { keyword });

    if (response.keywords && response.keywords.length > 0) {
      state.extractedKeywords = response.keywords;
      displayKeywords(response.keywords);
      showSuccess(`${response.keywords.length}개의 관련 키워드를 추출했습니다`);
      console.log("[추출 완료]", response.keywords);
    } else {
      showWarning("관련 키워드를 찾을 수 없습니다");
      state.extractedKeywords = [];
    }
  } catch (error) {
    showError(`키워드 추출 실패: ${error.message}`);
    console.error("[추출 오류]", error);
  } finally {
    elements.extractBtn.disabled = false;
    elements.extractBtn.textContent = "🔄 추출하기";
  }
}

/**
 * 추출된 키워드 표시
 */
function displayKeywords(keywords) {
  if (keywords.length === 0) {
    elements.keywordsList.innerHTML =
      '<p class="placeholder">추출된 키워드가 없습니다</p>';
    elements.keywordsList.classList.add("empty");
    return;
  }

  elements.keywordsList.classList.remove("empty");
  elements.keywordsList.innerHTML = keywords
    .map(
      (keyword, index) => `
      <div class="keyword-item" title="${keyword}">
        ${keyword}
      </div>
    `,
    )
    .join("");

  // 클릭하여 선택 토글 기능 (선택사항)
  document.querySelectorAll(".keyword-item").forEach((item) => {
    item.addEventListener("click", function () {
      this.classList.toggle("selected");
    });
  });
}

// ───────────────────────────────────────────────────────────────
// 6. 검색 시작/중지
// ───────────────────────────────────────────────────────────────

/**
 * 검색 시작
 */
async function startSearch() {
  // 유효성 검사
  const keyword = elements.keyword.value.trim();
  if (!keyword) {
    showError("검색 키워드를 입력해주세요");
    return;
  }

  if (state.isSearching) {
    showWarning("이미 검색이 진행 중입니다");
    return;
  }

  // 상태 업데이트
  state.isSearching = true;
  state.startTime = Date.now();
  state.searchCount = 0;
  state.totalSearches = parseInt(elements.numSearches.value);

  // UI 업데이트
  updateUIForSearch(true);
  showProgressUI();
  clearLog();

  try {
    console.log("[검색 시작]", {
      keyword,
      searches: state.totalSearches,
      delay: parseInt(elements.delay.value),
      combineMode: elements.combineMode.checked,
    });

    // Service Worker에 검색 시작 요청
    await sendToBackground("startSearch", {
      keyword,
      numSearches: state.totalSearches,
      relatedKeywords: state.extractedKeywords,
      delay: parseInt(elements.delay.value),
    });

    // 진행 시간 타이머 시작
    startTimer();

    addLogEntry(`✓ ${keyword}에 대한 검색 시작`, "success");
  } catch (error) {
    state.isSearching = false;
    updateUIForSearch(false);
    showError(`검색 시작 실패: ${error.message}`);
    console.error("[검색 시작 오류]", error);
  }
}

/**
 * 검색 중지
 */
async function stopSearch() {
  if (!state.isSearching) {
    showWarning("진행 중인 검색이 없습니다");
    return;
  }

  try {
    console.log("[검색 중지]");

    // Service Worker에 검색 중지 요청
    await sendToBackground("stopSearch");

    state.isSearching = false;
    updateUIForSearch(false);
    stopTimer();

    addLogEntry("✕ 사용자가 검색을 중지했습니다", "error");
    showWarning("검색이 중지되었습니다");
  } catch (error) {
    showError(`검색 중지 실패: ${error.message}`);
    console.error("[검색 중지 오류]", error);
  }
}

/**
 * 검색 UI 상태 업데이트
 */
function updateUIForSearch(isSearching) {
  elements.startBtn.disabled = isSearching;
  elements.stopBtn.disabled = !isSearching;

  elements.keyword.disabled = isSearching;
  elements.numSearches.disabled = isSearching;
  elements.delay.disabled = isSearching;
  elements.extractBtn.disabled = isSearching;

  if (isSearching) {
    elements.startBtn.textContent = "⏳ 검색 중...";
  } else {
    elements.startBtn.textContent = "🚀 검색 시작";
  }
}
// ───────────────────────────────────────────────────────────────
// 7. 진행 상황 업데이트 (계속)
// ───────────────────────────────────────────────────────────────

/**
 * 진행 상황 UI 표시
 */
function showProgressUI() {
  elements.progressContainer.style.display = "block";
}

/**
 * 진행 상황 업데이트
 */
function updateProgressUI(statusState) {
  if (!statusState) return;

  console.log("[진행 업데이트]", statusState);

  if (statusState.status === "searching") {
    state.searchCount = statusState.progress || 0;
    state.totalSearches = statusState.total || state.totalSearches;

    // 진행률 계산
    const percentage =
      state.totalSearches > 0
        ? Math.round((state.searchCount / state.totalSearches) * 100)
        : 0;

    // UI 업데이트
    elements.progressFill.style.width = percentage + "%";
    elements.progressPercentage.textContent = percentage + "%";
    elements.progressText.textContent = `${state.searchCount}/${state.totalSearches} 검색 완료`;
    elements.currentKeyword.textContent = statusState.currentKeyword || "-";
    elements.statusText.textContent = "검색 중...";
    elements.progressFill.classList.add("active");

    // 남은 시간 계산
    if (state.searchCount > 0 && state.startTime) {
      const elapsed = Date.now() - state.startTime;
      const avgPerSearch = elapsed / state.searchCount;
      const remaining =
        avgPerSearch * (state.totalSearches - state.searchCount);
      elements.remainingTime.textContent = formatTime(remaining);
    }

    // 로그에 추가
    addLogEntry(`→ ${statusState.currentKeyword}`, "pending");
  } else if (statusState.status === "completed") {
    state.isSearching = false;
    updateUIForSearch(false);
    stopTimer();

    elements.progressFill.classList.remove("active");
    elements.statusText.textContent = "완료";
    elements.progressText.textContent = "모든 검색이 완료되었습니다!";

    addLogEntry("✓ 모든 검색이 완료되었습니다", "success");
    showSuccess("검색이 완료되었습니다!");
  } else if (statusState.status === "error") {
    state.isSearching = false;
    updateUIForSearch(false);
    stopTimer();

    elements.statusText.textContent = "오류";
    addLogEntry(`✕ ${statusState.message}`, "error");
    showError(statusState.message);
  }
}

/**
 * 로그에 항목 추가
 */
function addLogEntry(message, type = "pending") {
  const timestamp = new Date().toLocaleTimeString("ko-KR");
  const entry = document.createElement("div");
  entry.className = `log-entry ${type}`;
  entry.textContent = `[${timestamp}] ${message}`;
  entry.setAttribute("role", "log");

  elements.searchLog.appendChild(entry);

  // 자동 스크롤 (최신 항목 표시)
  elements.searchLog.scrollTop = elements.searchLog.scrollHeight;
}

/**
 * 로그 초기화
 */
function clearLog() {
  elements.searchLog.innerHTML =
    '<p style="text-align: center; color: var(--text-tertiary); margin: 0;">로그가 초기화되었습니다</p>';
  console.log("[로그] 초기화됨");
}

// ───────────────────────────────────────────────────────────────
// 8. 타이머 관리
// ───────────────────────────────────────────────────────────────

/**
 * 진행 시간 타이머 시작
 */
function startTimer() {
  if (state.timerInterval) clearInterval(state.timerInterval);

  state.timerInterval = setInterval(() => {
    if (!state.isSearching || !state.startTime) return;

    const elapsed = Date.now() - state.startTime;
    elements.elapsedTime.textContent = formatTime(elapsed);
  }, 1000);
}

/**
 * 타이머 중지
 */
function stopTimer() {
  if (state.timerInterval) {
    clearInterval(state.timerInterval);
    state.timerInterval = null;
  }
}

/**
 * 시간 포맷팅 (밀리초 → 시:분:초)
 */
function formatTime(milliseconds) {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}시간 ${minutes}분 ${seconds}초`;
  } else if (minutes > 0) {
    return `${minutes}분 ${seconds}초`;
  } else {
    return `${seconds}초`;
  }
}

// ───────────────────────────────────────────────────────────────
// 9. 알림 함수
// ───────────────────────────────────────────────────────────────

/**
 * 성공 메시지 표시
 */
function showSuccess(message) {
  showNotification(message, "success");
}

/**
 * 오류 메시지 표시
 */
function showError(message) {
  showNotification(message, "error");
}

/**
 * 경고 메시지 표시
 */
function showWarning(message) {
  showNotification(message, "warning");
}

/**
 * 알림 메시지 표시
 */
function showNotification(message, type = "info") {
  // 기존 알림이 있으면 제거
  const existingNotification = document.querySelector(".notification");
  if (existingNotification) {
    existingNotification.remove();
  }

  // 새 알림 생성
  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    max-width: 300px;
    padding: 12px 16px;
    border-radius: 4px;
    font-size: 14px;
    z-index: 1000;
    animation: slideInUp 0.3s ease-in-out;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  `;

  // 타입별 스타일 적용
  const typeStyles = {
    success: {
      backgroundColor: "rgba(16, 124, 16, 0.9)",
      color: "white",
      icon: "✓",
    },
    error: {
      backgroundColor: "rgba(209, 52, 56, 0.9)",
      color: "white",
      icon: "✕",
    },
    warning: {
      backgroundColor: "rgba(255, 185, 0, 0.9)",
      color: "#000",
      icon: "⚠",
    },
  };

  const style = typeStyles[type] || typeStyles.info;
  notification.style.backgroundColor = style.backgroundColor;
  notification.style.color = style.color;
  notification.innerHTML = `${style.icon} ${message}`;

  document.body.appendChild(notification);

  // 3초 후 자동 제거
  setTimeout(() => {
    notification.style.animation = "fadeIn 0.3s ease-in-out reverse";
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// ───────────────────────────────────────────────────────────────
// 10. 유틸리티 함수
// ───────────────────────────────────────────────────────────────

/**
 * 문자열이 유효한 키워드인지 확인
 */
function isValidKeyword(keyword) {
  return (
    typeof keyword === "string" &&
    keyword.trim().length > 0 &&
    keyword.trim().length <= 100
  );
}

/**
 * 키워드 정규화 (공백 정리)
 */
function normalizeKeyword(keyword) {
  return keyword.trim().replace(/\s+/g, " ");
}

/**
 * 페이지 포커스 상태 확인
 */
function isPageFocused() {
  return document.hasFocus();
}

// ───────────────────────────────────────────────────────────────
// 11. 초기화
// ───────────────────────────────────────────────────────────────

/**
 * DOM이 로드되면 초기화 실행
 */
document.addEventListener("DOMContentLoaded", () => {
  console.log("[시작] Side Panel 초기화 중...");
  initializePanel();
  console.log("[시작] Side Panel 초기화 완료");
});

/**
 * 페이지 언로드 시 타이머 정리
 */
window.addEventListener("beforeunload", () => {
  stopTimer();
});

/**
 * 페이지 가시성 변경
 */
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    console.log("[상태] Side Panel 숨김");
  } else {
    console.log("[상태] Side Panel 표시");
  }
});

// ───────────────────────────────────────────────────────────────
// 끝
// ───────────────────────────────────────────────────────────────
