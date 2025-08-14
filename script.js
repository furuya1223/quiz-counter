let correct = 0;
let wrong = 0;
let history = [];

document.addEventListener("DOMContentLoaded", () => {
  loadCounts();
  updateDisplay();
  updateStatsTable();
  loadMemo();
  document.getElementById("memoInput").addEventListener("input", saveMemo);
});

function openTab(tabId) {
  document.querySelectorAll(".tab-button").forEach(btn => btn.classList.remove("active"));
  document.querySelectorAll(".tab-content").forEach(tab => tab.classList.remove("active"));
  document.querySelector(`.tab-button[onclick="openTab('${tabId}')"]`).classList.add("active");
  document.getElementById(tabId).classList.add("active");
  if (tabId === "statsTab") {
    updateStatsTable();  // 統計タブを開いたときに最新状態にする
  }
}

function addCorrect() {
  correct++;
  pushHistory("correct");
  saveCounts();
  updateDisplay();
  updateStats("correct");
}

function addWrong() {
  wrong++;
  pushHistory("wrong");
  saveCounts();
  updateDisplay();
  updateStats("wrong");
}

function resetCounts() {
  pushHistory("reset", { correct, wrong });
  correct = 0;
  wrong = 0;
  saveCounts();
  updateDisplay();
}

function undoAction() {
  if (history.length === 0) return;
  const last = history.pop();
  if (last.action === "correct") {
    correct = Math.max(correct - 1, 0);
    updateStats("correct", -1);
  } else if (last.action === "wrong") {
    wrong = Math.max(wrong - 1, 0);
    updateStats("wrong", -1);
  } else if (last.action === "reset") {
    correct = last.prev.correct;
    wrong = last.prev.wrong;
  }
  saveCounts();
  updateDisplay();
  updateStatsTable();
}

function pushHistory(action, prev = null) {
  if (history.length >= 10) history.shift();
  history.push({ action, prev });
}

function updateDisplay() {
  document.getElementById("correctCount").textContent = correct;
  document.getElementById("wrongCount").textContent = wrong;
}

function saveCounts() {
  document.cookie = `correct=${correct}; path=/`;
  document.cookie = `wrong=${wrong}; path=/`;
}

function loadCounts() {
  correct = getCookie("correct") || 0;
  console.log(correct);
  wrong = getCookie("wrong") || 0;
  console.log(wrong);
}

function getCookie(name) {
  console.log('get cookie: ' + name);
  console.log(document.cookie);
  const re = new RegExp(name + '=([^;]*)(;|$)');
  const v = document.cookie.match(re);
  console.log(v);
  return v ? parseInt(v[1]) : 0;
}

function getMemo() {
  console.log('get cookie: memo');
  console.log(document.cookie);
  const re = new RegExp('memo=([^;]*)(;|$)');
  const v = document.cookie.match(re);
  console.log(v);
  return v ? v[1] : null;
}

function getStats() {
  const re = new RegExp('stats=([^;]*)(;|$)');
  const v = document.cookie.match(re);
  return v ? v[1] : null;
}

function updateStats(type, delta=1) {
  const now = new Date();
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000); // JST = UTC + 9h
  const today = jst.toISOString().split('T')[0];
  console.log(jst);
  console.log(today);
  const stats = JSON.parse(getStats() || "{}");

  if (!stats[today]) stats[today] = { correct: 0, wrong: 0 };
  if (type === "correct") stats[today].correct = Math.max(0, stats[today].correct + delta);
  if (type === "wrong") stats[today].wrong = Math.max(0, stats[today].wrong + delta);

  document.cookie = `stats=${JSON.stringify(stats)}; path=/; max-age=31536000`;
  updateStatsTable();
}

function updateStatsTable() {
  const stats = JSON.parse(getStats() || "{}");
  const tbody = document.querySelector("#statsTable tbody");
  tbody.innerHTML = "";
  Object.keys(stats).sort().reverse().forEach(date => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${date}</td><td>${stats[date].correct}</td><td>${stats[date].wrong}</td>`;
    tbody.appendChild(tr);
  });
}

function saveMemo() {
  const memo = document.getElementById("memoInput").value;
  document.cookie = `memo=${encodeURIComponent(memo)}; path=/; max-age=31536000`;
}

function loadMemo() {
  const memo = getMemo();
  if (memo !== null) {
    document.getElementById("memoInput").value = decodeURIComponent(memo);
  }
}