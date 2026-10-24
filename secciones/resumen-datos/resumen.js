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

lmRenderSectionFooter({
  containerEl: document.getElementById("footer-slot"),
  mailtoSubject: "Mi resumen de datos — Logic Money",
  mailtoBody: rows.map(function (r) { return r.label + ": " + r.value; }).join("\n"),
  nextSectionHref: "../patrimonio/index.html",
});
