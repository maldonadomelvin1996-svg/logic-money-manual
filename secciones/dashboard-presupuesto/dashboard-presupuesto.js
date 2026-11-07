/* Logic Money — Manual Digital — Dashboard: Presupuesto
   Cierre del plan enfocado "Presupuesto": junta Ingresos, Presupuesto y
   Patrimonio (ya llenados en ese recorrido) en una sola vista, sin pedir
   nada nuevo. */

var contentEl = document.getElementById("content");

function dashRow(icon, soft, color, title, sub, amount, pct) {
  return '<div class="lm-dash-row">' +
    '<div class="lm-dash-row-icon" style="background:' + soft + ';color:' + color + '">' + icon + '</div>' +
    '<div class="lm-dash-row-body"><div class="lm-dash-row-title">' + title + '</div><div class="lm-dash-row-sub">' + sub + '</div></div>' +
    '<div class="lm-dash-row-right">' +
      (pct !== null ? '<div class="lm-dash-row-pct" style="background:' + soft + ';color:' + color + '">' + pct + '%</div>' : '') +
      '<div class="lm-dash-row-value">' + lmMoney(amount) + '</div>' +
    '</div></div>';
}

if (!lmHasSection("ingresos") && !lmHasSection("presupuesto")) {
  lmRenderDataGuard(contentEl, "Este dashboard se arma solo con tu información de Ingresos y Presupuesto. Completa primero esas secciones para verlo aquí.");
} else {
  var ingreso = lmGetIncomeTotal();
  var ahorros = lmGetPresupuestoAhorrosTotal();
  var gastos = Math.max(0, lmGetPresupuestoTotalGastos() - ahorros);
  var deudas = lmGetDebtsTotalPayment();
  var superavit = ingreso - ahorros - gastos - deudas;
  var pctOf = function (n) { return ingreso > 0 ? Math.round((n / ingreso) * 100) : 0; };
  var pctLibre = pctOf(superavit);

  var html = '<div class="lm-card lm-card-good">';
  html += '<h3 class="lm-h3">Distribución del ingreso mensual</h3>';
  html += '<div class="lm-card-flat" style="margin-bottom:14px">';
  html += dashRow("\u{1F4B5}", "var(--good-soft)", "var(--good)", "Ingresos", "Lo que entra cada mes", ingreso, null);
  html += dashRow("\u{1F437}", "var(--teal-soft)", "var(--teal)", "Ahorros", "Para el futuro", ahorros, pctOf(ahorros));
  html += dashRow("\u{1F9FE}", "var(--warn-soft)", "var(--warn)", "Gastos", "Vida cotidiana", gastos, pctOf(gastos));
  html += dashRow("\u{1F4B3}", "var(--gold-soft)", "var(--gold)", "Deudas", "Pago de créditos", deudas, pctOf(deudas));
  html += '</div>';

  if (ingreso > 0) {
    html += '<div class="lm-dash-pie-wrap">' + lmBuildPieSVG([
      { value: ahorros, color: "var(--teal)" },
      { value: gastos, color: "var(--warn)" },
      { value: deudas, color: "var(--gold)" },
      { value: Math.max(0, superavit), color: "var(--good)" },
    ], 170) + '</div>';
    html += '<div class="lm-dash-pie-legend">' +
      '<span class="lm-dash-pie-legend-item"><span class="lm-dash-pie-dot" style="background:var(--teal)"></span>Ahorros</span>' +
      '<span class="lm-dash-pie-legend-item"><span class="lm-dash-pie-dot" style="background:var(--warn)"></span>Gastos</span>' +
      '<span class="lm-dash-pie-legend-item"><span class="lm-dash-pie-dot" style="background:var(--gold)"></span>Deudas</span>' +
      '<span class="lm-dash-pie-legend-item"><span class="lm-dash-pie-dot" style="background:var(--good)"></span>Libre</span>' +
      '</div>';
  }

  var deficit = superavit < 0;
  var superTint = deficit ? "var(--warn)" : "var(--good)";
  html += '<div class="lm-card-flat" style="margin-top:4px;margin-bottom:0;background:' + (deficit ? "var(--warn-soft)" : "var(--good-soft)") + '">' +
    '<div style="display:flex;justify-content:space-between;align-items:center">' +
      '<div><div class="lm-tile-label" style="color:' + superTint + '">' + (deficit ? "Déficit mensual" : "Superávit mensual") + '</div>' +
        '<div style="font-family:\'Helvetica Neue\',Helvetica,Arial,sans-serif;font-size:32px;font-weight:700;color:' + superTint + '">' + (deficit ? "-" : "") + lmMoney(Math.abs(superavit)) + '</div>' +
        '<div class="lm-dash-row-sub">' + (deficit ? "Gastas más de lo que entra cada mes" : "Libre después de todos tus compromisos") + '</div></div>' +
      '<div class="lm-status-pill" style="background:' + superTint + ';color:#06130D">' + Math.abs(pctLibre) + '%<br>' + (deficit ? "sobregasto" : "libre") + '</div>' +
    '</div></div>';
  html += '</div>';

  // Patrimonio neto
  var patrimonioSaved = lmGetSection("patrimonio");
  var activos = patrimonioSaved ? (patrimonioSaved.activos || 0) : lmGetSavingsTotal();
  var pasivos = patrimonioSaved ? (patrimonioSaved.pasivos || 0) : lmGetDebtsTotalBalance();
  var patrimonio = activos - pasivos;
  var scale = Math.max(Math.abs(pasivos), Math.abs(activos), 1);
  var markerPct = 50 + 50 * Math.max(-1, Math.min(1, patrimonio / scale));

  html += '<div class="lm-card ' + (patrimonio >= 0 ? "lm-card-good" : "lm-card-attn") + '">';
  html += '<h3 class="lm-h3">Lo que tienes vs. lo que debes</h3>';
  html += '<div class="lm-tile-row">' +
    '<div class="lm-tile"><div class="lm-tile-label">Activos</div><div class="lm-tile-value">' + lmMoney(activos) + '</div></div>' +
    '<div class="lm-tile"><div class="lm-tile-label">Deudas</div><div class="lm-tile-value" style="color:var(--warn)">' + lmMoney(pasivos) + '</div></div>' +
    '</div>';
  html += '<div class="lm-hero">' +
    '<div class="lm-hero-label">Patrimonio neto</div>' +
    '<div class="lm-hero-value" style="color:' + (patrimonio >= 0 ? "var(--good)" : "var(--warn)") + '">' + (patrimonio >= 0 ? "+" : "") + lmMoney(patrimonio) + '</div>' +
    '</div>';
  html += '<div class="lm-dash-slider-track"><div class="lm-dash-slider-marker" style="left:' + markerPct + '%"></div></div>';
  html += '<div class="lm-dash-slider-scale"><span>En deuda</span><span>Positivo</span></div>';
  html += '</div>';

  contentEl.innerHTML = html;

  lmRenderSectionFooter({
    containerEl: contentEl,
    mailtoSubject: "Mi dashboard de presupuesto — Logic Money",
    mailtoBody: "Mi dashboard de presupuesto — Logic Money Manual Digital\n\n" +
      "Ingresos: " + lmMoney(ingreso) + "\nAhorros: " + lmMoney(ahorros) + "\nGastos: " + lmMoney(gastos) + "\nDeudas: " + lmMoney(deudas) +
      "\nSuperávit mensual: " + lmMoney(superavit) + "\n\nActivos: " + lmMoney(activos) + "\nPasivos: " + lmMoney(pasivos) + "\nPatrimonio neto: " + lmMoney(patrimonio),
    nextSectionHref: null,
    prevSectionHref: "../patrimonio/index.html",
  });
}
