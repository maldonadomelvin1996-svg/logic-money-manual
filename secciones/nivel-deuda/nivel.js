/* Logic Money — Manual Digital — Nivel de deuda (págs. 357-358) */

var paymentsInput = document.getElementById("payments");
var incomeInput = document.getElementById("income");

function debtBand(pct) {
  if (pct <= 15) return { label: "Ideal", cls: "lm-badge-good" };
  if (pct <= 35) return { label: "Estable", cls: "lm-badge-teal" };
  if (pct <= 43) return { label: "Riesgoso", cls: "lm-badge-gold" };
  if (pct <= 55) return { label: "Crítico", cls: "lm-badge-warn" };
  return { label: "Embrollao", cls: "lm-badge-warn" };
}

function renderNivel() {
  var payments = parseFloat(paymentsInput.value) || 0;
  var income = parseFloat(incomeInput.value) || 0;
  var resultsEl = document.getElementById("results");
  resultsEl.innerHTML = "";
  if (income <= 0) return;

  var pct = Math.round((payments / income) * 100);
  var band = debtBand(pct);

  var card = document.createElement("div");
  card.className = "lm-card";
  card.innerHTML =
    '<div class="lm-stat">' +
      '<div class="lm-stat-value">' + pct + '%</div>' +
      '<div class="lm-stat-label">' + lmMoney(payments) + ' / ' + lmMoney(income) + '</div>' +
      '<span class="lm-badge ' + band.cls + '" style="margin-top:10px">' + band.label + '</span>' +
    '</div>';
  resultsEl.appendChild(card);

  lmRenderSaveBanner(resultsEl);

  lmRenderSectionFooter({
    containerEl: resultsEl,
    mailtoSubject: "Mi nivel de deuda — Logic Money",
    mailtoBody: "Mi nivel de deuda — Logic Money Manual Digital\n\nPagos mensuales: " + lmMoney(payments) + "\nIngreso mensual: " + lmMoney(income) + "\nResultado: " + pct + "% (" + band.label + ")",
    nextSectionHref: "../proteccion/index.html",
  });

  lmSaveSection("nivel-deuda", { payments: payments, income: income, pct: pct, band: band.label });
}

paymentsInput.addEventListener("input", renderNivel);
incomeInput.addEventListener("input", renderNivel);

(function init() {
  var saved = lmGetSection("nivel-deuda");
  paymentsInput.value = saved ? saved.payments : (lmGetDebtsTotalPayment() || "");
  incomeInput.value = saved ? saved.income : (lmGetIncomeTotal() || "");
  renderNivel();
})();
