/* Logic Money — Manual Digital — Nivel de deuda (págs. 357-358) */

lmRenderSectionDemoButton(document.getElementById("demo-btn-slot"), "nivel-deuda");

var paymentsInput = document.getElementById("payments");
var incomeInput = document.getElementById("income");

var DEBT_BANDS = [
  { max: 15, label: "Ideal", color: "var(--good)", soft: "var(--good-soft)" },
  { max: 35, label: "Estable", color: "var(--teal)", soft: "var(--teal-soft)" },
  { max: 43, label: "Riesgoso", color: "var(--gold)", soft: "var(--gold-soft)" },
  { max: 55, label: "Crítico", color: "#FF9A4D", soft: "rgba(255,154,77,0.14)" },
  { max: Infinity, label: "Embrollao", color: "var(--warn)", soft: "var(--warn-soft)" },
];
function debtBand(pct) {
  for (var i = 0; i < DEBT_BANDS.length; i++) if (pct <= DEBT_BANDS[i].max) return DEBT_BANDS[i];
  return DEBT_BANDS[DEBT_BANDS.length - 1];
}

function renderNivel() {
  var payments = parseFloat(paymentsInput.value) || 0;
  var income = parseFloat(incomeInput.value) || 0;
  var resultsEl = document.getElementById("results");
  resultsEl.innerHTML = "";
  if (income <= 0) return;

  var pct = Math.round((payments / income) * 100);
  var band = debtBand(pct);
  var markerPct = Math.max(2, Math.min(98, pct));

  var card = document.createElement("div");
  card.className = "lm-card " + (pct <= 35 ? "lm-card-good" : "lm-card-attn");
  card.innerHTML =
    '<div class="lm-hero">' +
      '<div class="lm-hero-label">Nivel de deuda</div>' +
      '<div class="lm-hero-value" style="color:' + band.color + '">' + pct + '%</div>' +
      '<span class="lm-status-pill" style="background:' + band.soft + ';color:' + band.color + '">' + band.label + '</span>' +
    '</div>' +
    '<div class="lm-mini-bar-track" style="background:linear-gradient(to right, var(--good) 0%, var(--good) 15%, var(--teal) 15%, var(--teal) 35%, var(--gold) 35%, var(--gold) 43%, #FF9A4D 43%, #FF9A4D 55%, var(--warn) 55%, var(--warn) 100%)">' +
      '<div class="lm-mini-bar-marker" style="left:' + markerPct + '%;background:' + band.color + '"></div>' +
    '</div>' +
    '<div class="lm-mini-bar-scale"><span>0%</span><span>56%+</span></div>' +
    '<div class="lm-tile-row" style="margin-top:18px">' +
      '<div class="lm-tile"><div class="lm-tile-label">Pagas en deudas</div><div class="lm-tile-value">' + lmMoney(payments) + '</div></div>' +
      '<div class="lm-tile"><div class="lm-tile-label">Ingreso mensual</div><div class="lm-tile-value">' + lmMoney(income) + '</div></div>' +
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
