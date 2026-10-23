/* Logic Money — Manual Digital — Ahorros (págs. 337-338) */

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
      '<span class="lm-debt-row-title">Ahorro ' + savingRowCount + '</span>' +
      '<button class="lm-remove-btn lm-no-print" type="button" data-remove="' + id + '">Quitar</button>' +
    '</div>' +
    '<div class="lm-field" style="margin-bottom:10px">' +
      '<input class="lm-input" type="text" placeholder="Propósito (ej. Fondo de emergencia, retiro, sin propósito)" data-field="purpose">' +
    '</div>' +
    '<div class="lm-row" style="margin-bottom:10px">' +
      '<input class="lm-input" type="number" placeholder="Cantidad ahorrada" min="0" data-field="amount">' +
      '<input class="lm-input" type="number" placeholder="Aportación mensual" min="0" data-field="monthly">' +
    '</div>';
  savingsListEl.appendChild(row);

  if (prefill) {
    row.querySelector('[data-field="purpose"]').value = prefill.purpose || "";
    row.querySelector('[data-field="amount"]').value = prefill.amount || "";
    row.querySelector('[data-field="monthly"]').value = prefill.monthly || "";
  }

  row.querySelector('[data-remove="' + id + '"]').addEventListener("click", function () { row.remove(); });
}

document.getElementById("add-saving").addEventListener("click", function () { addSavingRow(); });

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
  html += '<div class="lm-stat-grid">' +
    '<div class="lm-stat"><div class="lm-stat-value">' + lmMoney(totalAmount) + '</div><div class="lm-stat-label">Total ahorrado</div></div>' +
    '<div class="lm-stat"><div class="lm-stat-value">' + lmMoney(totalMonthly) + '</div><div class="lm-stat-label">Aportación mensual total</div></div>' +
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
  });
}

function escapeSavingHtml(s) {
  var div = document.createElement("div");
  div.textContent = s;
  return div.innerHTML;
}

document.getElementById("save-btn").addEventListener("click", function () {
  var savings = readSavings();
  var msgEl = document.getElementById("validation-msg");
  if (savings.length === 0) {
    msgEl.innerHTML = '<div class="lm-callout lm-callout-warn">Añade al menos un ahorro (puede ser $0 con un propósito).</div>';
    return;
  }
  msgEl.innerHTML = "";
  lmSaveSection("ahorros", { savings: savings });
  renderSavingResults(savings);
});

(function init() {
  var saved = lmGetSection("ahorros");
  if (saved && saved.savings && saved.savings.length) {
    saved.savings.forEach(function (s) { addSavingRow(s); });
    renderSavingResults(saved.savings);
  } else {
    addSavingRow();
  }
})();
