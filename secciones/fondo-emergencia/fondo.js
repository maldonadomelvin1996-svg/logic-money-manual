/* Logic Money — Manual Digital — Fondo de emergencia (págs. 353-354) */

lmRenderSectionDemoButton(document.getElementById("demo-btn-slot"), "fondo-emergencia");

var monthsSelect = document.getElementById("months");

function computeFondo() {
  var months = parseInt(monthsSelect.value, 10);
  var gastosNecesarios = lmGetPresupuestoTotalNecesario();
  var ingreso = lmGetIncomeTotal();
  var tienes = lmGetSavingsByPurpose("emergencia");

  var objetivoGastos = gastosNecesarios * months;
  var objetivoIngreso = ingreso * months;

  return {
    months: months,
    gastosNecesarios: gastosNecesarios,
    ingreso: ingreso,
    tienes: tienes,
    objetivoGastos: objetivoGastos,
    objetivoIngreso: objetivoIngreso,
  };
}

function renderFondo() {
  var state = computeFondo();
  var resultsEl = document.getElementById("results");
  resultsEl.innerHTML = "";

  var objetivo = state.objetivoGastos || state.objetivoIngreso;
  var falta = Math.max(0, objetivo - state.tienes);
  var pct = objetivo > 0 ? Math.min(100, Math.round((state.tienes / objetivo) * 100)) : 0;
  var done = falta <= 0 && objetivo > 0;

  var card = document.createElement("div");
  card.className = "lm-card " + (done ? "lm-card-good" : "");
  var html = '<div class="lm-hero">' +
    '<div class="lm-hero-label">Tienes ahorrado</div>' +
    '<div class="lm-hero-value" style="color:' + (done ? "var(--good)" : "var(--gold)") + '">' + lmMoney(state.tienes) + '</div>' +
    '<div class="lm-hero-sub">de ' + lmMoney(objetivo) + ' (' + pct + '%)</div>' +
  '</div>' +
  '<div class="lm-mini-bar-track">' +
    '<div class="lm-mini-bar-fill" style="width:' + Math.max(pct, 2) + '%;background:' + (done ? "var(--good)" : "var(--gold)") + '"></div>' +
  '</div>';

  if (!done) {
    html += '<div class="lm-status-pill" style="display:block;text-align:center;background:var(--warn-soft);color:var(--warn);margin-top:12px">Faltan ' + lmMoney(falta) + '</div>';
  }

  html += '<div class="lm-tile-row" style="margin-top:16px">' +
    '<div class="lm-tile"><div class="lm-tile-label">Gastos necesarios x' + state.months + '</div><div class="lm-tile-value" style="font-size:16px">' + lmMoney(state.objetivoGastos) + '</div></div>' +
    '<div class="lm-tile"><div class="lm-tile-label">Ingreso x' + state.months + '</div><div class="lm-tile-value" style="font-size:16px">' + lmMoney(state.objetivoIngreso) + '</div></div>' +
  '</div>';

  card.innerHTML = html;
  resultsEl.appendChild(card);

  lmRenderSaveBanner(resultsEl);

  var bodyLines = ["Mi fondo de emergencia — Logic Money Manual Digital", "",
    "Objetivo (gastos x " + state.months + "): " + lmMoney(state.objetivoGastos),
    "Objetivo (ingreso x " + state.months + "): " + lmMoney(state.objetivoIngreso),
    "Tienes ahorrado: " + lmMoney(state.tienes)];

  lmRenderSectionFooter({
    containerEl: resultsEl,
    mailtoSubject: "Mi fondo de emergencia — Logic Money",
    mailtoBody: bodyLines.join("\n"),
    nextSectionHref: "../credito/index.html",
    prevSectionHref: "../reduccion-deudas/index.html",
  });

  lmSaveSection("fondo-emergencia", state);
}

monthsSelect.addEventListener("change", renderFondo);

(function init() {
  var saved = lmGetSection("fondo-emergencia");
  if (!saved && !lmHasSection("presupuesto") && !lmHasSection("ingresos")) {
    document.getElementById("inputs-card").style.display = "none";
    lmRenderDataGuard(document.getElementById("data-guard"), "Esto se arma solo con tu información de Presupuesto e Ingresos. Completa primero la sección de Tomar datos para ver tu meta de fondo de emergencia aquí.");
    return;
  }
  if (saved && saved.months) monthsSelect.value = saved.months;
  renderFondo();
})();
