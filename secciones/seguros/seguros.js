/* Logic Money — Manual Digital — Seguros (págs. 339-340) */

var insuranceRowsEl = document.getElementById("insurance-rows");
var FIXED_INSURANCE = ["Médico", "Vehículo", "Vida"];
var insuranceRowCount = 0;

function addInsuranceRow(prefill, fixedLabel) {
  insuranceRowCount++;
  var id = "ins-" + insuranceRowCount;
  var row = document.createElement("div");
  row.className = "lm-debt-row";
  row.dataset.id = id;

  var nameField = fixedLabel
    ? '<div class="lm-debt-row-title" style="font-size:15px;color:var(--text);margin-bottom:10px">' + fixedLabel + '</div><input type="hidden" data-field="type" value="' + fixedLabel + '">'
    : '<div class="lm-field" style="margin-bottom:10px"><input class="lm-input" type="text" placeholder="Tipo de seguro (ej. Incapacidad)" data-field="type"></div>';

  row.innerHTML =
    (fixedLabel ? '' : '<div class="lm-debt-row-head"><span class="lm-debt-row-title">Otro seguro</span><button class="lm-remove-btn lm-no-print" type="button" data-remove="' + id + '">Quitar</button></div>') +
    nameField +
    '<div class="lm-row" style="margin-bottom:10px">' +
      '<label style="display:flex;align-items:center;gap:6px;font-size:13px;color:var(--text-mid)">' +
        '<input type="checkbox" data-field="has"> Lo tengo' +
      '</label>' +
    '</div>' +
    '<div class="lm-row">' +
      '<input class="lm-input" type="number" placeholder="Pago (mensual o anual)" min="0" data-field="payment">' +
      '<input class="lm-input" type="number" placeholder="Cobertura $" min="0" data-field="coverage">' +
    '</div>';
  insuranceRowsEl.appendChild(row);

  if (prefill) {
    row.querySelector('[data-field="has"]').checked = !!prefill.has;
    row.querySelector('[data-field="payment"]').value = prefill.payment || "";
    row.querySelector('[data-field="coverage"]').value = prefill.coverage || "";
  }

  if (!fixedLabel) {
    row.querySelector('[data-remove="' + id + '"]').addEventListener("click", function () { row.remove(); });
  }
}

document.getElementById("add-insurance").addEventListener("click", function () { addInsuranceRow(); });

function readInsurance() {
  var rows = insuranceRowsEl.querySelectorAll(".lm-debt-row");
  var list = [];
  rows.forEach(function (row) {
    var typeField = row.querySelector('[data-field="type"]');
    var type = (typeField.tagName === "INPUT" && typeField.type === "hidden") ? typeField.value : typeField.value.trim();
    var has = row.querySelector('[data-field="has"]').checked;
    var payment = parseFloat(row.querySelector('[data-field="payment"]').value) || 0;
    var coverage = parseFloat(row.querySelector('[data-field="coverage"]').value) || 0;
    if (type) list.push({ type: type, has: has, payment: payment, coverage: coverage });
  });
  return list;
}

function renderInsuranceResults(list) {
  var resultsEl = document.getElementById("results");
  resultsEl.innerHTML = "";
  if (list.length === 0) return;

  var card = document.createElement("div");
  card.className = "lm-card";
  var html = '<h3 class="lm-h3">Tu protección actual</h3><div class="lm-card-flat">';
  list.forEach(function (ins, i) {
    html += '<div style="padding:8px 0' + (i < list.length - 1 ? ";border-bottom:1px solid var(--border)" : "") + ';display:flex;justify-content:space-between;align-items:center">' +
      '<span>' + escapeInsHtml(ins.type) + '</span>' +
      (ins.has
        ? '<span class="lm-badge lm-badge-good">Sí' + (ins.payment ? ' · ' + lmMoney(ins.payment) : '') + (ins.coverage ? ' · ' + lmMoney(ins.coverage) + ' cob.' : '') + '</span>'
        : '<span class="lm-badge lm-badge-warn">No tiene</span>') +
      '</div>';
  });
  html += '</div>';
  card.innerHTML = html;
  resultsEl.appendChild(card);

  lmRenderSaveBanner(resultsEl);

  var bodyLines = ["Mis seguros — Logic Money Manual Digital", ""];
  list.forEach(function (ins) {
    bodyLines.push(ins.type + ": " + (ins.has ? "Sí" : "No") + (ins.payment ? ", pago " + lmMoney(ins.payment) : "") + (ins.coverage ? ", cobertura " + lmMoney(ins.coverage) : ""));
  });

  lmRenderSectionFooter({
    containerEl: resultsEl,
    mailtoSubject: "Mis seguros — Logic Money",
    mailtoBody: bodyLines.join("\n"),
    nextSectionHref: "../presupuesto/index.html",
  });
}

function escapeInsHtml(s) {
  var div = document.createElement("div");
  div.textContent = s;
  return div.innerHTML;
}

document.getElementById("save-btn").addEventListener("click", function () {
  var list = readInsurance();
  lmSaveSection("seguros", { insurance: list });
  renderInsuranceResults(list);
});

(function init() {
  var saved = lmGetSection("seguros");
  var savedByType = {};
  if (saved && saved.insurance) {
    saved.insurance.forEach(function (ins) { savedByType[ins.type] = ins; });
  }

  FIXED_INSURANCE.forEach(function (label) { addInsuranceRow(savedByType[label], label); });

  if (saved && saved.insurance) {
    saved.insurance.forEach(function (ins) {
      if (FIXED_INSURANCE.indexOf(ins.type) === -1) addInsuranceRow(ins);
    });
    renderInsuranceResults(saved.insurance);
  }
})();
