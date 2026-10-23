/* Logic Money — Manual Digital — Objetivos (págs. 327-330) */

var goalsListEl = document.getElementById("goals-list");
var goalRowCount = 0;

function addGoalRow(prefill) {
  goalRowCount++;
  var id = "goal-" + goalRowCount;
  var row = document.createElement("div");
  row.className = "lm-debt-row";
  row.dataset.id = id;
  row.innerHTML =
    '<div class="lm-debt-row-head">' +
      '<span class="lm-debt-row-title">Objetivo ' + goalRowCount + '</span>' +
      '<button class="lm-remove-btn lm-no-print" type="button" data-remove="' + id + '">Quitar</button>' +
    '</div>' +
    '<div class="lm-field" style="margin-bottom:10px">' +
      '<input class="lm-input" type="text" placeholder="Objetivo específico (ej. comprar casa)" data-field="goal">' +
    '</div>' +
    '<div class="lm-row">' +
      '<input class="lm-input" type="text" placeholder="¿Cuánto? (ej. $15,000 o no sé)" data-field="amount">' +
      '<input class="lm-input" type="text" placeholder="¿Cuándo? (ej. 2 años)" data-field="when">' +
    '</div>';
  goalsListEl.appendChild(row);

  if (prefill) {
    row.querySelector('[data-field="goal"]').value = prefill.goal || "";
    row.querySelector('[data-field="amount"]').value = prefill.amount || "";
    row.querySelector('[data-field="when"]').value = prefill.when || "";
  }

  row.querySelector('[data-remove="' + id + '"]').addEventListener("click", function () { row.remove(); });
}

document.getElementById("add-goal").addEventListener("click", function () { addGoalRow(); });

function readGoals() {
  var rows = goalsListEl.querySelectorAll(".lm-debt-row");
  var goals = [];
  rows.forEach(function (row) {
    var goal = row.querySelector('[data-field="goal"]').value.trim();
    var amount = row.querySelector('[data-field="amount"]').value.trim();
    var when = row.querySelector('[data-field="when"]').value.trim();
    if (goal) goals.push({ goal: goal, amount: amount, when: when });
  });
  return goals;
}

function renderGoalResults(goals) {
  var resultsEl = document.getElementById("results");
  resultsEl.innerHTML = "";
  if (goals.length === 0) return;

  var card = document.createElement("div");
  card.className = "lm-card";
  var html = '<h3 class="lm-h3">Tus objetivos guardados</h3><div class="lm-card-flat">';
  goals.forEach(function (g, i) {
    html += '<div style="padding:8px 0' + (i < goals.length - 1 ? ";border-bottom:1px solid var(--border)" : "") + '">' +
      '<div style="font-weight:600">' + escapeGoalHtml(g.goal) + '</div>' +
      '<div style="color:var(--text-mid);font-size:13px;margin-top:2px">' + escapeGoalHtml(g.amount || "—") + ' · ' + escapeGoalHtml(g.when || "—") + '</div>' +
      '</div>';
  });
  html += '</div>';
  card.innerHTML = html;
  resultsEl.appendChild(card);

  lmRenderSaveBanner(resultsEl);

  var bodyLines = ["Mis objetivos — Logic Money Manual Digital", ""];
  goals.forEach(function (g) { bodyLines.push("- " + g.goal + ": " + (g.amount || "?") + ", " + (g.when || "?")); });

  lmRenderSectionFooter({
    containerEl: resultsEl,
    mailtoSubject: "Mis objetivos — Logic Money",
    mailtoBody: bodyLines.join("\n"),
    nextSectionHref: "../ingresos/index.html",
  });
}

function escapeGoalHtml(s) {
  var div = document.createElement("div");
  div.textContent = s;
  return div.innerHTML;
}

document.getElementById("save-btn").addEventListener("click", function () {
  var goals = readGoals();
  var msgEl = document.getElementById("validation-msg");
  if (goals.length === 0) {
    msgEl.innerHTML = '<div class="lm-callout lm-callout-warn">Añade al menos un objetivo.</div>';
    return;
  }
  msgEl.innerHTML = "";
  lmSaveSection("objetivos", { goals: goals });
  renderGoalResults(goals);
});

(function init() {
  var saved = lmGetSection("objetivos");
  if (saved && saved.goals && saved.goals.length) {
    saved.goals.forEach(function (g) { addGoalRow(g); });
    renderGoalResults(saved.goals);
  } else {
    addGoalRow();
  }
})();
