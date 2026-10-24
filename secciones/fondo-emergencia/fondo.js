/* Logic Money — Manual Digital — Fondo de emergencia (págs. 353-354) */

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

  var card = document.createElement("div");
  card.className = "lm-card";
  var html = '<h3 class="lm-h3">Tu objetivo de fondo de emergencia</h3>';

  [
    { label: "Gastos necesarios × " + state.months, objetivo: state.objetivoGastos, base: state.gastosNecesarios, basisLabel: "gastos necesarios" },
    { label: "Ingreso mensual × " + state.months, objetivo: state.objetivoIngreso, base: state.ingreso, basisLabel: "ingreso" },
  ].forEach(function (row, i) {
    var falta = Math.max(0, row.objetivo - state.tienes);
    html += '<div class="lm-card-flat" style="margin-bottom:' + (i === 0 ? '10px' : '0') + '">' +
      '<div style="font-size:13px;color:var(--text-mid);margin-bottom:6px">' + row.label + '</div>' +
      '<div style="display:flex;justify-content:space-between;align-items:center">' +
        '<span style="font-size:20px;font-weight:700">' + lmMoney(row.objetivo) + '</span>' +
        (falta > 0
          ? '<span class="lm-badge lm-badge-warn">Faltan ' + lmMoney(falta) + '</span>'
          : '<span class="lm-badge lm-badge-good">&#10003; Completo</span>') +
      '</div>' +
      '</div>';
  });

  html += '<div class="lm-hint" style="text-align:center;margin-top:12px">Tienes ahorrado para esto: ' + lmMoney(state.tienes) + '</div>';
  if (!state.gastosNecesarios && !state.ingreso) {
    html += '<div class="lm-callout lm-callout-neutral" style="margin-top:10px">Completa <a href="../presupuesto/index.html" style="color:inherit">Presupuesto</a> e <a href="../../secciones/ingresos/index.html" style="color:inherit">Ingresos</a> para que esto se calcule solo.</div>';
  }
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
  });

  lmSaveSection("fondo-emergencia", state);
}

monthsSelect.addEventListener("change", renderFondo);

(function init() {
  var saved = lmGetSection("fondo-emergencia");
  if (saved && saved.months) monthsSelect.value = saved.months;
  renderFondo();
})();
