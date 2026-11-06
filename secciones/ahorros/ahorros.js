/* Logic Money — Manual Digital — Ahorros (págs. 337-338) */

lmRenderSectionDemoButton(document.getElementById("demo-btn-slot"), "ahorros");

var savingsListEl = document.getElementById("savings-list");
var savingRowCount = 0;

function addSavingRow(prefill) {
  savingRowCount++;
  var id = "saving-" + savingRowCount;
  var row = document.createElement("div");
  row.className = "lm-debt-row";
  row.dataset.id = id;
  row.innerHTML =
    '<div class="lm-debt-row-head">' +
      '<span class="lm-debt-row-title" data-title>Nuevo ahorro</span>' +
      '<button class="lm-remove-btn lm-no-print" type="button" data-remove="' + id + '">Quitar</button>' +
    '</div>' +
    '<div class="lm-field" style="margin-bottom:14px">' +
      '<input class="lm-input lm-input-title" type="text" placeholder="Ej. Fondo de emergencia, retiro" data-field="purpose">' +
    '</div>' +
    '<div class="lm-row" style="max-width:280px">' +
      '<div><label class="lm-mini-label">Ahorrado</label><input class="lm-input" type="number" inputmode="decimal" placeholder="$0" min="0" data-field="amount"></div>' +
      '<div><label class="lm-mini-label">Al mes</label><input class="lm-input" type="number" inputmode="decimal" placeholder="$0" min="0" data-field="monthly"></div>' +
    '</div>';
  savingsListEl.appendChild(row);

  var purposeInput = row.querySelector('[data-field="purpose"]');
  var titleEl = row.querySelector('[data-title]');
  purposeInput.addEventListener("input", function () {
    titleEl.textContent = purposeInput.value.trim() || "Nuevo ahorro";
  });

  if (prefill) {
    purposeInput.value = prefill.purpose || "";
    titleEl.textContent = (prefill.purpose || "").trim() || "Nuevo ahorro";
    row.querySelector('[data-field="amount"]').value = prefill.amount || "";
    row.querySelector('[data-field="monthly"]').value = prefill.monthly || "";
  }

  row.querySelector('[data-remove="' + id + '"]').addEventListener("click", function () { row.remove(); saveAndRender(); });
  row.querySelectorAll("input").forEach(function (input) { input.addEventListener("input", saveAndRender); });
}

document.getElementById("add-saving").addEventListener("click", function () { addSavingRow(); saveAndRender(); });

function readSavings() {
  var rows = savingsListEl.querySelectorAll(".lm-debt-row");
  var savings = [];
  rows.forEach(function (row) {
    var purpose = row.querySelector('[data-field="purpose"]').value.trim();
    var amount = parseFloat(row.querySelector('[data-field="amount"]').value) || 0;
    var monthly = parseFloat(row.querySelector('[data-field="monthly"]').value) || 0;
    if (purpose || amount > 0) savings.push({ purpose: purpose || "Sin propósito", amount: amount, monthly: monthly });
  });
  return savings;
}

function renderSavingResults(savings) {
  var resultsEl = document.getElementById("results");
  resultsEl.innerHTML = "";
  if (savings.length === 0) return;

  var totalAmount = savings.reduce(function (s, x) { return s + x.amount; }, 0);
  var totalMonthly = savings.reduce(function (s, x) { return s + x.monthly; }, 0);

  var card = document.createElement("div");
  card.className = "lm-card";
  var html = '<h3 class="lm-h3">Tus ahorros guardados</h3><div class="lm-card-flat" style="margin-bottom:14px">';
  savings.forEach(function (s, i) {
    html += '<div style="padding:8px 0' + (i < savings.length - 1 ? ";border-bottom:1px solid var(--border)" : "") + '">' +
      '<div style="font-weight:600">' + escapeSavingHtml(s.purpose) + '</div>' +
      '<div style="color:var(--text-mid);font-size:13px;margin-top:2px">' + lmMoney(s.amount) + (s.monthly > 0 ? ' · ' + lmMoney(s.monthly) + '/mes' : '') + '</div>' +
      '</div>';
  });
  html += '</div>';
  html += '<div class="lm-tile-row">' +
    '<div class="lm-tile"><div class="lm-tile-label">Total ahorrado</div><div class="lm-tile-value">' + lmMoney(totalAmount) + '</div></div>' +
    '<div class="lm-tile"><div class="lm-tile-label">Aportación mensual</div><div class="lm-tile-value">' + lmMoney(totalMonthly) + '</div></div>' +
    '</div>';
  card.innerHTML = html;
  resultsEl.appendChild(card);

  lmRenderSaveBanner(resultsEl);

  var bodyLines = ["Mis ahorros — Logic Money Manual Digital", ""];
  savings.forEach(function (s) { bodyLines.push("- " + s.purpose + ": " + lmMoney(s.amount) + (s.monthly > 0 ? ", " + lmMoney(s.monthly) + "/mes" : "")); });
  bodyLines.push("", "Total ahorrado: " + lmMoney(totalAmount), "Aportación mensual total: " + lmMoney(totalMonthly));

  lmRenderSectionFooter({
    containerEl: resultsEl,
    mailtoSubject: "Mis ahorros — Logic Money",
    mailtoBody: bodyLines.join("\n"),
    nextSectionHref: "../seguros/index.html",
    prevSectionHref: "../deudas/index.html",
  });
}

function escapeSavingHtml(s) {
  var div = document.createElement("div");
  div.textContent = s;
  return div.innerHTML;
}

function saveAndRender() {
  var savings = readSavings();
  lmSaveSection("ahorros", { savings: savings });
  renderSavingResults(savings);
}

(function init() {
  var saved = lmGetSection("ahorros");
  if (saved && saved.savings && saved.savings.length) {
    saved.savings.forEach(function (s) { addSavingRow(s); });
  } else {
    addSavingRow();
  }
  renderSavingResults(readSavings());
})();
