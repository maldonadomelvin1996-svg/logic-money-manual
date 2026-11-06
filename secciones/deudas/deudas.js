/* Logic Money — Manual Digital — Deudas
   Replica el patrón de la página 335-336 del manual: lista de deudas con
   balance/pago/interés, ordenadas de menor a mayor tiempo restante (la casa
   siempre al final), con un total. Sin estrategia de pago ni DTI aquí —
   esas viven en "Reducción de deudas" y "Nivel de deuda" (Tanda 2). */

lmRenderSectionDemoButton(document.getElementById("demo-btn-slot"), "deudas");

var DEBT_TYPES = ["Tarjeta de crédito", "Préstamo personal", "Préstamo de auto", "Hipoteca / Casa", "Préstamo estudiantil"];

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
      '<span class="lm-debt-row-title" data-title>Nueva deuda</span>' +
      '<button class="lm-remove-btn lm-no-print" type="button" data-remove="' + id + '">Quitar</button>' +
    '</div>' +
    '<div class="lm-field" style="margin-bottom:14px">' +
      '<input class="lm-input lm-input-title" type="text" placeholder="Ej. Tarjeta, Carro, Casa" data-field="name">' +
    '</div>' +
    '<div class="lm-row-3" style="margin-bottom:10px">' +
      '<div><label class="lm-mini-label">Balance</label><input class="lm-input" type="number" inputmode="decimal" placeholder="$0" min="0" data-field="balance"></div>' +
      '<div><label class="lm-mini-label">Pago/mes</label><input class="lm-input" type="number" inputmode="decimal" placeholder="$0" min="0" data-field="payment"></div>' +
      '<div><label class="lm-mini-label">Interés %</label><input class="lm-input" type="number" inputmode="decimal" placeholder="0" min="0" step="0.01" data-field="apr"></div>' +
    '</div>' +
    '<div style="display:flex;align-items:center;justify-content:space-between;gap:10px">' +
      '<label style="display:flex;align-items:center;gap:6px;font-size:13px;color:var(--text-mid);white-space:nowrap">' +
        '<input type="checkbox" data-field="isHome"> Es mi casa' +
      '</label>' +
      '<button type="button" class="lm-link-btn" data-note-toggle style="padding:4px">+ Añadir nota</button>' +
    '</div>' +
    '<div class="lm-field" data-note-field style="display:none;margin:12px 0 0">' +
      '<input class="lm-input" type="text" placeholder="Nota (opcional)" data-field="note">' +
    '</div>';
  debtsListEl.appendChild(row);

  var nameInput = row.querySelector('[data-field="name"]');
  var titleEl = row.querySelector('[data-title]');
  nameInput.addEventListener("input", function () {
    titleEl.textContent = nameInput.value.trim() || "Nueva deuda";
    saveAndRender();
  });
  lmAttachCombo(nameInput, DEBT_TYPES);

  row.querySelectorAll('[data-field="balance"], [data-field="payment"], [data-field="apr"], [data-field="note"]').forEach(function (input) {
    input.addEventListener("input", saveAndRender);
  });
  row.querySelector('[data-field="isHome"]').addEventListener("change", saveAndRender);

  var noteField = row.querySelector('[data-note-field]');
  var noteToggle = row.querySelector('[data-note-toggle]');
  noteToggle.addEventListener("click", function () {
    var showing = noteField.style.display !== "none";
    noteField.style.display = showing ? "none" : "block";
    noteToggle.textContent = showing ? "+ Añadir nota" : "− Quitar nota";
  });

  if (prefill) {
    nameInput.value = prefill.name || "";
    titleEl.textContent = (prefill.name || "").trim() || "Nueva deuda";
    row.querySelector('[data-field="balance"]').value = prefill.balance || "";
    row.querySelector('[data-field="payment"]').value = prefill.payment || "";
    row.querySelector('[data-field="apr"]').value = prefill.apr || "";
    row.querySelector('[data-field="isHome"]').checked = !!prefill.isHome;
    if (prefill.note) {
      row.querySelector('[data-field="note"]').value = prefill.note;
      noteField.style.display = "block";
      noteToggle.textContent = "− Quitar nota";
    }
  }

  row.querySelector('[data-remove="' + id + '"]').addEventListener("click", function () {
    row.remove();
    saveAndRender();
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
    var note = row.querySelector('[data-field="note"]').value.trim();
    if (name || balance > 0) {
      debts.push({ name: name || "Deuda", balance: balance, payment: payment, apr: apr, isHome: isHome, note: note });
    }
  });
  return debts;
}

function renderResults(debts) {
  var resultsEl = document.getElementById("results");
  resultsEl.innerHTML = "";
  if (debts.length === 0) return;

  var ordered = lmOrderDebts(debts);
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
  html += '<div class="lm-tile-row">' +
    '<div class="lm-tile"><div class="lm-tile-label">Balance total</div><div class="lm-tile-value">' + lmMoney(totalBalance) + '</div></div>' +
    '<div class="lm-tile"><div class="lm-tile-label">Pago mensual</div><div class="lm-tile-value">' + lmMoney(totalPayment) + '</div></div>' +
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
    prevSectionHref: "../ingresos/index.html",
  });
}

function escapeHtml(s) {
  var div = document.createElement("div");
  div.textContent = s;
  return div.innerHTML;
}

function saveAndRender() {
  var debts = readDebts();
  lmSaveSection("deudas", { debts: debts });
  renderResults(debts);
}

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
