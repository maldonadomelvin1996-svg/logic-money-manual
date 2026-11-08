/* Logic Money — Manual Digital
   Lectores compartidos para que una sección pueda auto-rellenarse con
   datos que el lector ya puso en OTRA sección (Ingresos, Deudas, Ahorros,
   Seguros, Presupuesto), sin pedírselos de nuevo. Todo sigue viviendo
   únicamente en localStorage del propio teléfono. */

function lmGetIncomeTotal() {
  var s = lmGetSection("ingresos");
  return s ? (s.total || 0) : 0;
}

function lmGetDebts() {
  var s = lmGetSection("deudas");
  return s && s.debts ? s.debts : [];
}
function lmGetDebtsTotalBalance() {
  return lmGetDebts().reduce(function (sum, d) { return sum + (d.balance || 0); }, 0);
}
function lmGetDebtsTotalPayment() {
  return lmGetDebts().reduce(function (sum, d) { return sum + (d.payment || 0); }, 0);
}

function lmGetSavings() {
  var s = lmGetSection("ahorros");
  return s && s.savings ? s.savings : [];
}
function lmGetSavingsTotal() {
  return lmGetSavings().reduce(function (sum, s) { return sum + (s.amount || 0); }, 0);
}
function lmGetSavingsByPurpose(pattern) {
  var re = new RegExp(pattern, "i");
  return lmGetSavings().filter(function (s) { return re.test(s.purpose); })
    .reduce(function (sum, s) { return sum + (s.amount || 0); }, 0);
}
/* Igual que lmGetSavingsByPurpose, pero suma el aporte MENSUAL (campo
   "monthly" de cada fila de Ahorros) en vez del total ya ahorrado — para
   comparar cuánto se está aportando al retiro hoy contra cuánto se
   debería aportar (ver dashboard-crecimiento.js). */
function lmGetMonthlySavingsByPurpose(pattern) {
  var re = new RegExp(pattern, "i");
  return lmGetSavings().filter(function (s) { return re.test(s.purpose); })
    .reduce(function (sum, s) { return sum + (s.monthly || 0); }, 0);
}

function lmGetInsurance() {
  var s = lmGetSection("seguros");
  return s && s.insurance ? s.insurance : [];
}
function lmGetInsuranceByType(type) {
  return lmGetInsurance().filter(function (i) { return i.type === type; })[0] || null;
}

function lmGetPresupuesto() {
  return lmGetSection("presupuesto");
}
function lmGetPresupuestoTotalGastos() {
  var p = lmGetPresupuesto();
  return p ? (p.totalGastos || 0) : 0;
}
function lmGetPresupuestoTotalNecesario() {
  var p = lmGetPresupuesto();
  return p ? (p.totalNecesario || 0) : 0;
}
/* Subtotal de la categoría "Ahorros" del presupuesto (Fondo de Emergencia,
   Plan de Retiro, Otros) — separado del resto de los gastos para el
   dashboard de Presupuesto (Ingresos / Ahorros / Gastos / Deudas). */
function lmGetPresupuestoAhorrosTotal() {
  var p = lmGetPresupuesto();
  var items = p && p.categories && p.categories.ahorros ? p.categories.ahorros : [];
  return items.reduce(function (sum, i) { return sum + (i.amount || 0); }, 0);
}

/* Orden de pago: de menos a más tiempo restante, la casa siempre al final.
   Compartido entre la sección de Deudas y Reducción de deudas. */
function lmMonthsToPayoff(d) {
  if (d.payment <= 0) return Infinity;
  if (d.balance <= 0) return 0;
  var monthlyRate = d.apr / 1200;
  if (monthlyRate <= 0) return d.balance / d.payment;
  if (d.payment <= d.balance * monthlyRate) return Infinity;
  return Math.log(d.payment / (d.payment - d.balance * monthlyRate)) / Math.log(1 + monthlyRate);
}
function lmOrderDebts(debts) {
  var homes = debts.filter(function (d) { return d.isHome; });
  var rest = debts.filter(function (d) { return !d.isHome; });
  rest.sort(function (a, b) { return lmMonthsToPayoff(a) - lmMonthsToPayoff(b); });
  return rest.concat(homes);
}
