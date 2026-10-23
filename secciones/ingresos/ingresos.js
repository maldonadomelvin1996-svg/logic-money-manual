/* Logic Money — Manual Digital — Ingresos (págs. 331-334) */

var INCOME_CATEGORIES = [
  { key: "principal", label: "Ingreso principal" },
  { key: "pareja", label: "2do ingreso o pareja" },
  { key: "segurosocial", label: "Seguro Social" },
  { key: "pensiones", label: "Pensiones o beneficios" },
  { key: "inversiones", label: "Inversiones o renta" },
  { key: "otros", label: "Otros" },
];

var rowsEl = document.getElementById("income-rows");

INCOME_CATEGORIES.forEach(function (cat) {
  var row = document.createElement("div");
  row.className = "lm-field";
  row.style.marginBottom = "12px";
  row.innerHTML =
    '<label class="lm-label">' + cat.label + '</label>' +
    '<input class="lm-input" type="number" placeholder="$0" min="0" data-cat="' + cat.key + '">';
  rowsEl.appendChild(row);
});

function readIncome() {
  var total = 0;
  var byCategory = {};
  INCOME_CATEGORIES.forEach(function (cat) {
    var val = parseFloat(rowsEl.querySelector('[data-cat="' + cat.key + '"]').value) || 0;
    byCategory[cat.key] = val;
    total += val;
  });
  return { byCategory: byCategory, total: total };
}

function updateTotal() {
  var r = readIncome();
  document.getElementById("income-total").textContent = lmMoney(r.total);
}

rowsEl.addEventListener("input", updateTotal);

function renderIncomeResults(data) {
  var resultsEl = document.getElementById("results");
  resultsEl.innerHTML = "";

  lmRenderSaveBanner(resultsEl);

  var bodyLines = ["Mis ingresos — Logic Money Manual Digital", ""];
  INCOME_CATEGORIES.forEach(function (cat) {
    if (data.byCategory[cat.key] > 0) bodyLines.push(cat.label + ": " + lmMoney(data.byCategory[cat.key]));
  });
  bodyLines.push("", "Total mensual: " + lmMoney(data.total));

  lmRenderSectionFooter({
    containerEl: resultsEl,
    mailtoSubject: "Mis ingresos — Logic Money",
    mailtoBody: bodyLines.join("\n"),
    nextSectionHref: "../deudas/index.html",
  });
}

document.getElementById("save-btn").addEventListener("click", function () {
  var data = readIncome();
  lmSaveSection("ingresos", data);
  renderIncomeResults(data);
});

(function init() {
  var saved = lmGetSection("ingresos");
  if (saved && saved.byCategory) {
    INCOME_CATEGORIES.forEach(function (cat) {
      var v = saved.byCategory[cat.key];
      if (v) rowsEl.querySelector('[data-cat="' + cat.key + '"]').value = v;
    });
    updateTotal();
    renderIncomeResults(saved);
  }
})();
