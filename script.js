let correct = 0;
let wrong = 0;
let history = [];

document.addEventListener("DOMContentLoaded", () => {
  loadCounts();
  updateDisplay();
  updateStatsTable();
});

function openTab(tabId) {
  document.querySelectorAll(".tab-button").forEach(btn => btn.classList.remove("active"));
  document.querySelectorAll(".tab-content").forEach(tab => tab.classList.remove("active"));
  document.querySelector(`.tab-button[onclick="openTab('${tabId}')"]`).classList.add("active");
  document.getElementById(tabId).classList.add("active");
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
  wrong = getCookie("wrong") || 0;
}

function getCookie(name) {
  const v = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
  return v ? parseInt(v[2]) : 0;
}

function updateStats(type, delta=1) {
  const today = new Date().toISOString().split('T')[0];
  const stats = JSON.parse(getCookie("stats") || "{}");

  if (!stats[today]) stats[today] = { correct: 0, wrong: 0 };
  if (type === "correct") stats[today].correct = Math.max(0, stats[today].correct + delta);
  if (type === "wrong") stats[today].wrong = Math.max(0, stats[today].wrong + delta);

  document.cookie = `stats=${JSON.stringify(stats)}; path=/; max-age=31536000`;
  updateStatsTable();
}

function updateStatsTable() {
  const stats = JSON.parse(getCookie("stats") || "{}");
  const tbody = document.querySelector("#statsTable tbody");
  tbody.innerHTML = "";
  Object.keys(stats).sort().reverse().forEach(date => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${date}</td><td>${stats[date].correct}</td><td>${stats[date].wrong}</td>`;
    tbody.appendChild(tr);
  });
}
