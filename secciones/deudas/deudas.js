/* Logic Money — Manual Digital — Deudas
   Replica el patrón de la página 335-336 del manual: lista de deudas con
   balance/pago/interés, ordenadas de menor a mayor tiempo restante (la casa
   siempre al final), con un total. Sin estrategia de pago ni DTI aquí —
   esas viven en "Reducción de deudas" y "Nivel de deuda" (Tanda 2). */

var debtsListEl = document.getElementById("debts-list");
var rowCount = 0;

function addDebtRow(prefill) {
  rowCount++;
  var id = "debt-" + rowCount;
  var row = document.createElement("div");
  row.className = "lm-debt-row";
  row.dataset.id = id;
  row.innerHTML =
    '<div class="lm-debt-row-head">' +
      '<span class="lm-debt-row-title">Deuda ' + rowCount + '</span>' +
      '<button class="lm-remove-btn lm-no-print" type="button" data-remove="' + id + '">Quitar</button>' +
    '</div>' +
    '<div class="lm-field" style="margin-bottom:10px">' +
      '<input class="lm-input" type="text" placeholder="Nombre (ej. Tarjeta, Carro, Casa)" data-field="name">' +
    '</div>' +
    '<div class="lm-row" style="margin-bottom:10px">' +
      '<input class="lm-input" type="number" placeholder="Balance" min="0" data-field="balance">' +
      '<input class="lm-input" type="number" placeholder="Pago mensual" min="0" data-field="payment">' +
    '</div>' +
    '<div class="lm-row">' +
      '<input class="lm-input" type="number" placeholder="Interés % (ej. 18)" min="0" step="0.01" data-field="apr">' +
      '<label style="display:flex;align-items:center;gap:6px;font-size:13px;color:var(--text-mid);white-space:nowrap">' +
        '<input type="checkbox" data-field="isHome"> Es mi casa' +
      '</label>' +
    '</div>';
  debtsListEl.appendChild(row);

  if (prefill) {
    row.querySelector('[data-field="name"]').value = prefill.name || "";
    row.querySelector('[data-field="balance"]').value = prefill.balance || "";
    row.querySelector('[data-field="payment"]').value = prefill.payment || "";
    row.querySelector('[data-field="apr"]').value = prefill.apr || "";
    row.querySelector('[data-field="isHome"]').checked = !!prefill.isHome;
  }

  row.querySelector('[data-remove="' + id + '"]').addEventListener("click", function () {
    row.remove();
  });
}

document.getElementById("add-debt").addEventListener("click", function () { addDebtRow(); });

function readDebts() {
  var rows = debtsListEl.querySelectorAll(".lm-debt-row");
  var debts = [];
  rows.forEach(function (row) {
    var name = row.querySelector('[data-field="name"]').value.trim();
    var balance = parseFloat(row.querySelector('[data-field="balance"]').value) || 0;
    var payment = parseFloat(row.querySelector('[data-field="payment"]').value) || 0;
    var apr = parseFloat(row.querySelector('[data-field="apr"]').value) || 0;
    var isHome = row.querySelector('[data-field="isHome"]').checked;
    if (name || balance > 0) {
      debts.push({ name: name || "Deuda", balance: balance, payment: payment, apr: apr, isHome: isHome });
    }
  });
  return debts;
}

function monthsToPayoff(d) {
  if (d.payment <= 0) return Infinity;
  if (d.balance <= 0) return 0;
  var monthlyRate = d.apr / 1200;
  if (monthlyRate <= 0) return d.balance / d.payment;
  if (d.payment <= d.balance * monthlyRate) return Infinity;
  return Math.log(d.payment / (d.payment - d.balance * monthlyRate)) / Math.log(1 + monthlyRate);
}

function orderDebts(debts) {
  var homes = debts.filter(function (d) { return d.isHome; });
  var rest = debts.filter(function (d) { return !d.isHome; });
  rest.sort(function (a, b) { return monthsToPayoff(a) - monthsToPayoff(b); });
  return rest.concat(homes);
}

function renderResults(debts) {
  var resultsEl = document.getElementById("results");
  resultsEl.innerHTML = "";
  if (debts.length === 0) return;

  var ordered = orderDebts(debts);
  var totalBalance = debts.reduce(function (s, d) { return s + d.balance; }, 0);
  var totalPayment = debts.reduce(function (s, d) { return s + d.payment; }, 0);
  var weightedApr = totalBalance > 0
    ? debts.reduce(function (s, d) { return s + d.apr * d.balance; }, 0) / totalBalance
    : 0;

  var card = document.createElement("div");
  card.className = "lm-card";
  var html = '<h3 class="lm-h3">Tu orden de pago sugerido</h3>';
  html += '<div class="lm-card-flat" style="margin-bottom:14px">';
  ordered.forEach(function (d, i) {
    html += '<div style="display:flex;justify-content:space-between;padding:8px 0' +
      (i < ordered.length - 1 ? ";border-bottom:1px solid var(--border)" : "") + '">' +
      '<span>' + (i + 1) + '. ' + escapeHtml(d.name) + (d.isHome ? ' <span class="lm-badge lm-badge-muted">casa</span>' : '') + '</span>' +
      '<span style="color:var(--text-mid)">' + lmMoney(d.balance) + ' · ' + lmMoney(d.payment) + '/mes</span>' +
      '</div>';
  });
  html += '</div>';
  html += '<div class="lm-stat-grid">' +
    '<div class="lm-stat"><div class="lm-stat-value">' + lmMoney(totalBalance) + '</div><div class="lm-stat-label">Balance total</div></div>' +
    '<div class="lm-stat"><div class="lm-stat-value">' + lmMoney(totalPayment) + '</div><div class="lm-stat-label">Pago mensual total</div></div>' +
    '</div>';
  html += '<div class="lm-hint" style="text-align:center;margin-top:6px">Interés promedio ponderado: ' + weightedApr.toFixed(1) + '%</div>';
  card.innerHTML = html;
  resultsEl.appendChild(card);

  lmRenderSaveBanner(resultsEl);

  var bodyLines = ["Mis deudas — Logic Money Manual Digital", ""];
  ordered.forEach(function (d, i) {
    bodyLines.push((i + 1) + ". " + d.name + (d.isHome ? " (casa)" : "") + ": " + lmMoney(d.balance) + " balance, " + lmMoney(d.payment) + "/mes, " + d.apr + "% interés");
  });
  bodyLines.push("", "Total: " + lmMoney(totalBalance) + " en balance, " + lmMoney(totalPayment) + "/mes");

  lmRenderSectionFooter({
    containerEl: resultsEl,
    mailtoSubject: "Mis deudas — Logic Money",
    mailtoBody: bodyLines.join("\n"),
    nextSectionHref: "../ahorros/index.html",
  });
}

function escapeHtml(s) {
  var div = document.createElement("div");
  div.textContent = s;
  return div.innerHTML;
}

document.getElementById("calc-btn").addEventListener("click", function () {
  var debts = readDebts();
  var msgEl = document.getElementById("validation-msg");
  if (debts.length === 0) {
    msgEl.innerHTML = '<div class="lm-callout lm-callout-warn">Añade al menos una deuda con balance.</div>';
    return;
  }
  msgEl.innerHTML = "";
  lmSaveSection("deudas", { debts: debts });
  renderResults(debts);
});

/* Precarga si ya había datos guardados */
(function init() {
  var saved = lmGetSection("deudas");
  if (saved && saved.debts && saved.debts.length) {
    saved.debts.forEach(function (d) { addDebtRow(d); });
    renderResults(saved.debts);
  } else {
    addDebtRow();
  }
})();
