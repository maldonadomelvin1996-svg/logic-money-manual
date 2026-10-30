/* Logic Money — Manual Digital — Resumen de datos (págs. 345-346)
   Página 100% de lectura: no pide nada nuevo, solo junta lo ya guardado. */

var ahorrosTotal = lmGetSavingsTotal();
var deudasTotal = lmGetDebtsTotalBalance();
var ingresoTotal = lmGetIncomeTotal();
var gastosTotal = lmGetPresupuestoTotalGastos() + lmGetDebtsTotalPayment();
var sobrante = ingresoTotal - gastosTotal;

var rows = [
  { label: "Ahorros", value: lmMoney(ahorrosTotal), cls: "" },
  { label: "Deudas", value: lmMoney(deudasTotal), cls: deudasTotal > 0 ? "lm-badge-warn" : "" },
  { label: "Ingresos mensuales", value: lmMoney(ingresoTotal), cls: "lm-badge-good" },
  { label: "Gastos mensuales (incl. deudas)", value: lmMoney(gastosTotal), cls: "lm-badge-warn" },
  { label: "Sobrante mensual", value: lmMoney(sobrante), cls: sobrante >= 0 ? "lm-badge-good" : "lm-badge-warn" },
];

var rowsEl = document.getElementById("summary-rows");
rows.forEach(function (r, i) {
  var div = document.createElement("div");
  div.style.cssText = "display:flex;justify-content:space-between;align-items:center;padding:12px 0" +
    (i < rows.length - 1 ? ";border-bottom:1px solid var(--border)" : "");
  div.innerHTML = '<span style="color:var(--text-mid);font-size:14px">' + r.label + '</span>' +
    '<span style="font-weight:700;font-size:15px">' + r.value + '</span>';
  rowsEl.appendChild(div);
});

var hasAny = ahorrosTotal || deudasTotal || ingresoTotal || gastosTotal;
var missingParts = [];
if (!lmHasSection("ingresos")) missingParts.push("Ingresos");
if (!lmHasSection("deudas")) missingParts.push("Deudas");
if (!lmHasSection("ahorros")) missingParts.push("Ahorros");
if (!lmHasSection("presupuesto")) missingParts.push("Presupuesto");

if (missingParts.length) {
  document.getElementById("missing-note").innerHTML =
    '<div class="lm-callout lm-callout-neutral">Aún te falta llenar: ' + missingParts.join(", ") + '. Este resumen se actualiza solo en cuanto las completes.</div>';
}

/* ---------- Detalle por sección: para ver/probar todo lo guardado ---------- */

function esc(s) {
  var div = document.createElement("div");
  div.textContent = s == null ? "" : String(s);
  return div.innerHTML;
}

function rowHtml(label, value) {
  return '<div style="display:flex;justify-content:space-between;gap:10px;padding:7px 0;border-bottom:1px solid var(--border)">' +
    '<span style="color:var(--text-mid);font-size:13px">' + esc(label) + '</span>' +
    '<span style="font-weight:600;font-size:13px;text-align:right">' + value + '</span></div>';
}

function detailCard(title, sectionKey, hrefIfMissing, buildRowsHtml) {
  var saved = lmGetSection(sectionKey);
  var card = document.createElement("div");
  card.className = "lm-card";
  var html = '<h3 class="lm-h3">' + title + '</h3>';
  if (!saved) {
    html += '<div class="lm-callout lm-callout-neutral" style="margin-bottom:0">Pendiente — no has llenado <a href="' + hrefIfMissing + '" style="color:inherit">esta sección</a> todavía.</div>';
  } else {
    html += '<div class="lm-card-flat" style="margin-bottom:0">' + buildRowsHtml(saved) + '</div>';
  }
  card.innerHTML = html;
  return card;
}

var detailEl = document.getElementById("detail-cards");

detailEl.appendChild(detailCard("Objetivos", "objetivos", "../objetivos/index.html", function (s) {
  return (s.goals || []).map(function (g) {
    return rowHtml(g.goal, esc(g.amount || "—") + " · " + esc(g.when || "—"));
  }).join("") || rowHtml("Sin objetivos guardados", "");
}));

detailEl.appendChild(detailCard("Ingresos", "ingresos", "../ingresos/index.html", function (s) {
  var html = "";
  var labels = { principal: "Ingreso principal", pareja: "2do ingreso o pareja", segurosocial: "Seguro Social", pensiones: "Pensiones o beneficios", inversiones: "Inversiones o renta", otros: "Otros" };
  Object.keys(labels).forEach(function (k) {
    if (s.byCategory && s.byCategory[k]) html += rowHtml(labels[k], lmMoney(s.byCategory[k]));
  });
  html += rowHtml("Total mensual", lmMoney(s.total));
  return html;
}));

detailEl.appendChild(detailCard("Deudas", "deudas", "../deudas/index.html", function (s) {
  var html = (s.debts || []).map(function (d) {
    return rowHtml(d.name + (d.isHome ? " (casa)" : ""), lmMoney(d.balance) + " · " + lmMoney(d.payment) + "/mes · " + d.apr + "%");
  }).join("");
  html += rowHtml("Balance total", lmMoney(lmGetDebtsTotalBalance()));
  html += rowHtml("Pago mensual total", lmMoney(lmGetDebtsTotalPayment()));
  return html;
}));

detailEl.appendChild(detailCard("Ahorros", "ahorros", "../ahorros/index.html", function (s) {
  var html = (s.savings || []).map(function (a) {
    return rowHtml(a.purpose, lmMoney(a.amount) + (a.monthly ? " · " + lmMoney(a.monthly) + "/mes" : ""));
  }).join("");
  html += rowHtml("Total ahorrado", lmMoney(lmGetSavingsTotal()));
  return html;
}));

detailEl.appendChild(detailCard("Seguros", "seguros", "../seguros/index.html", function (s) {
  return (s.insurance || []).map(function (i) {
    return rowHtml(i.type, i.has ? ("Sí · " + lmMoney(i.payment) + (i.coverage ? " · " + lmMoney(i.coverage) + " cob." : "")) : "No tiene");
  }).join("");
}));

detailEl.appendChild(detailCard("Presupuesto", "presupuesto", "../presupuesto/index.html", function (s) {
  return rowHtml("Gastos totales", lmMoney(s.totalGastos)) +
    rowHtml("Necesario", lmMoney(s.totalNecesario)) +
    rowHtml("Opcional", lmMoney(s.totalOpcional)) +
    rowHtml("Ingreso usado", lmMoney(s.income));
}));

detailEl.appendChild(detailCard("Patrimonio", "patrimonio", "../patrimonio/index.html", function (s) {
  return rowHtml("Activos", lmMoney(s.activos)) + rowHtml("Pasivos", lmMoney(s.pasivos)) + rowHtml("Patrimonio neto", lmMoney(s.patrimonio));
}));

detailEl.appendChild(detailCard("Fondo de emergencia", "fondo-emergencia", "../fondo-emergencia/index.html", function (s) {
  return rowHtml("Meses objetivo", s.months) + rowHtml("Tienes ahorrado", lmMoney(s.tienes)) +
    rowHtml("Objetivo (gastos x" + s.months + ")", lmMoney(s.objetivoGastos));
}));

detailEl.appendChild(detailCard("Crédito", "credito", "../credito/index.html", function (s) {
  return s.score ? rowHtml("Puntaje", s.score) : rowHtml("Puntaje", "No sé todavía");
}));

detailEl.appendChild(detailCard("Nivel de deuda", "nivel-deuda", "../nivel-deuda/index.html", function (s) {
  return rowHtml("Resultado", s.pct + "% · " + s.band);
}));

detailEl.appendChild(detailCard("Análisis de protección", "proteccion", "../proteccion/index.html", function (s) {
  if (!s.needsLife) return rowHtml("¿Necesita seguro de vida?", "No");
  return rowHtml("¿Necesita seguro de vida?", "Sí") +
    rowHtml("Resultado", (s.resultado >= 0 ? "+" : "") + lmMoney(s.resultado) + (s.resultado >= 0 ? " (cubierto)" : " (déficit)"));
}));

detailEl.appendChild(detailCard("Retiro", "retiro-cuando", "../retiro-cuando/index.html", function () {
  var html = "";
  var cuando = lmGetSection("retiro-cuando");
  var cuanto = lmGetSection("retiro-cuanto");
  var silla = lmGetSection("retiro-silla");
  var nif = lmGetSection("retiro-nif");
  var perfil = lmGetSection("retiro-perfil");
  if (cuando) html += rowHtml("Años para retiro", cuando.edadActual + " → " + cuando.edadRetiro + " (" + cuando.anios + " años)");
  if (cuanto) html += rowHtml("Necesitas al mes (ajustado)", lmMoney(cuanto.resultado));
  if (silla) html += rowHtml("Te falta conseguir al mes", lmMoney(silla.falta));
  if (nif) html += rowHtml("Número de independencia financiera", lmMoney(nif.nif));
  if (perfil) html += rowHtml("Perfil de inversor", perfil.label + " (" + perfil.rate + "%)");
  return html || rowHtml("Sin datos de retiro todavía", "");
}));

lmRenderSectionFooter({
  containerEl: document.getElementById("footer-slot"),
  mailtoSubject: "Mi resumen de datos — Logic Money",
  mailtoBody: rows.map(function (r) { return r.label + ": " + r.value; }).join("\n"),
  nextSectionHref: "../patrimonio/index.html",
});
