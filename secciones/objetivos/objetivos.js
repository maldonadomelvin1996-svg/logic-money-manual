/* Logic Money — Manual Digital — Objetivos (págs. 327-330) */

lmRenderSectionDemoButton(document.getElementById("demo-btn-slot"), "objetivos");

var goalsListEl = document.getElementById("goals-list");
var goalRowCount = 0;

var PRESET_GOALS = ["Retiro", "Comprar casa", "Pagar deudas", "Fondo de emergencia", "Emprender un negocio", "Educación", "Viajar"];
var WHEN_PRESETS = ["1", "2", "3", "5", "10", "15", "20"];

function addGoalRow(prefill) {
  goalRowCount++;
  var id = "goal-" + goalRowCount;
  var row = document.createElement("div");
  row.className = "lm-debt-row";
  row.dataset.id = id;
  row.innerHTML =
    '<div class="lm-debt-row-head">' +
      '<span class="lm-debt-row-title" data-title>Nuevo objetivo</span>' +
      '<button class="lm-remove-btn lm-no-print" type="button" data-remove="' + id + '">Quitar</button>' +
    '</div>' +
    '<div class="lm-field" style="margin-bottom:14px">' +
      '<input class="lm-input lm-input-title" type="text" placeholder="Ej. comprar casa" data-field="goal">' +
    '</div>' +
    '<div class="lm-field" style="margin-bottom:10px">' +
      '<label class="lm-mini-label">¿Cuánto?</label>' +
      '<input class="lm-input" type="text" placeholder="Ej. $15,000" data-field="amount">' +
    '</div>' +
    '<div class="lm-field" style="margin-bottom:0">' +
      '<label class="lm-mini-label">¿Cuándo?</label>' +
      '<div class="lm-chip-row" style="margin-bottom:8px">' +
        '<button type="button" class="lm-chip lm-chip-active" data-when-mode="years">En X años</button>' +
        '<button type="button" class="lm-chip" data-when-mode="age">A una edad</button>' +
      '</div>' +
      '<input class="lm-input" type="number" inputmode="decimal" min="0" placeholder="Ej. 5" data-field="whenValue">' +
    '</div>';
  goalsListEl.appendChild(row);

  var goalInput = row.querySelector('[data-field="goal"]');
  var titleEl = row.querySelector('[data-title]');
  goalInput.addEventListener("input", function () {
    titleEl.textContent = goalInput.value.trim() || "Nuevo objetivo";
    saveAndRender();
  });
  lmAttachCombo(goalInput, PRESET_GOALS);

  lmWrapUnknown(row.querySelector('[data-field="amount"]'));
  row.querySelector('[data-field="amount"]').addEventListener("input", saveAndRender);

  var whenValueInput = row.querySelector('[data-field="whenValue"]');
  var whenModeBtns = row.querySelectorAll('[data-when-mode]');
  function setWhenMode(mode) {
    whenValueInput.dataset.whenMode = mode;
    whenValueInput.placeholder = mode === "years" ? "Ej. 5" : "Ej. 60";
    whenModeBtns.forEach(function (b) { b.classList.toggle("lm-chip-active", b.dataset.whenMode === mode); });
  }
  whenModeBtns.forEach(function (b) { b.addEventListener("click", function () { setWhenMode(b.dataset.whenMode); saveAndRender(); }); });
  setWhenMode((prefill && prefill.whenMode) || "years");
  lmWrapUnknown(whenValueInput);
  lmAttachCombo(whenValueInput, WHEN_PRESETS);
  whenValueInput.addEventListener("input", saveAndRender);

  if (prefill) {
    goalInput.value = prefill.goal || "";
    titleEl.textContent = (prefill.goal || "").trim() || "Nuevo objetivo";
    row.querySelector('[data-field="amount"]').value = prefill.amount || "";
    if (prefill.whenValue) whenValueInput.value = prefill.whenValue;
  }

  row.querySelector('[data-remove="' + id + '"]').addEventListener("click", function () { row.remove(); saveAndRender(); });
}

document.getElementById("add-goal").addEventListener("click", function () { addGoalRow(); });

function formatWhen(mode, value) {
  if (!value) return "";
  return mode === "age" ? ("a los " + value + " años") : ("en " + value + (value === "1" ? " año" : " años"));
}

function readGoals() {
  var rows = goalsListEl.querySelectorAll(".lm-debt-row");
  var goals = [];
  rows.forEach(function (row) {
    var goal = row.querySelector('[data-field="goal"]').value.trim();
    var amountEl = row.querySelector('[data-field="amount"]');
    var whenEl = row.querySelector('[data-field="whenValue"]');
    var amount = amountEl.value.trim() || (amountEl.dataset.unknown === "true" ? "No sé todavía" : "");
    var whenMode = whenEl.dataset.whenMode || "years";
    var whenValue = whenEl.value.trim();
    var when = formatWhen(whenMode, whenValue) || (whenEl.dataset.unknown === "true" ? "No sé todavía" : "");
    if (goal) goals.push({ goal: goal, amount: amount, when: when, whenMode: whenMode, whenValue: whenValue });
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
    prevSectionHref: null,
  });
}

function escapeGoalHtml(s) {
  var div = document.createElement("div");
  div.textContent = s;
  return div.innerHTML;
}

function saveAndRender() {
  var goals = readGoals();
  lmSaveSection("objetivos", { goals: goals });
  renderGoalResults(goals);
}

(function init() {
  var saved = lmGetSection("objetivos");
  if (saved && saved.goals && saved.goals.length) {
    saved.goals.forEach(function (g) { addGoalRow(g); });
    renderGoalResults(saved.goals);
  } else {
    addGoalRow();
  }
})();
