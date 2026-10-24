/* Logic Money — Manual Digital — Presupuesto (págs. 341-344) */

var CATEGORIES = [
  { key: "vivienda", label: "Vivienda", items: ["Alquiler", "Luz", "Celular", "Internet", "Agua", "Mantenimiento, basura, otros", "Mascotas", "Otros"] },
  { key: "transportacion", label: "Transportación", items: ["Gasolina", "Seguro(s) y marbete de auto", "Mantenimiento, lavado, mecánica", "Peajes", "Taxi, Uber, tren, otros", "Otros"] },
  { key: "ahorros", label: "Ahorros", items: ["Fondo de Emergencia", "Plan de Retiro, inversión", "Otros"] },
  { key: "proteccion", label: "Protección", items: ["Seguro de vida", "Seguro de incapacidad", "Seguro de cáncer", "Otros"] },
  { key: "salud", label: "Salud", items: ["Seguro médico", "Citas médicas, farmacia, deducibles", "Terapias o tratamiento", "Otros"] },
  { key: "alimentos", label: "Alimentos", items: ["Compra del supermercado", "Comida en el trabajo", "Restaurante", "Otros"] },
  { key: "familia", label: "Familia", items: ["Pensión", "Matrícula colegio", "Cuido o tutorías", "Meriendas", "Vestimenta", "Barbería, beauty, uñas, estética", "Otros"] },
  { key: "entretenimiento", label: "Entretenimiento y otros", items: ["Suscripciones o cable TV", "Membresías", "Vacaciones", "Diezmo u ofrendas", "Pasatiempos (hobbies)", "Otros"] },
];

var categoriesEl = document.getElementById("categories");

function buildCategoryCard(cat) {
  var card = document.createElement("div");
  card.className = "lm-card";
  var html = '<h3 class="lm-h3">' + cat.label + '</h3>';
  cat.items.forEach(function (item, i) {
    html += '<div class="lm-pitem" data-item="' + i + '">' +
      '<span class="lm-pitem-label">' + item + '</span>' +
      '<select data-field="necesario">' +
        '<option value="necesario">Necesario</option>' +
        '<option value="opcional">Opcional</option>' +
      '</select>' +
      '<input type="number" class="lm-input" min="0" placeholder="$0" data-field="amount">' +
      '</div>';
  });
  html += '<div class="lm-cat-total"><span>Total</span><span data-cat-total>$0</span></div>';
  card.innerHTML = html;
  categoriesEl.appendChild(card);
  return card;
}

var categoryCards = {};
CATEGORIES.forEach(function (cat) { categoryCards[cat.key] = buildCategoryCard(cat); });

function readCategory(cat) {
  var card = categoryCards[cat.key];
  var rows = card.querySelectorAll(".lm-pitem");
  var items = [];
  rows.forEach(function (row, i) {
    var amount = parseFloat(row.querySelector('[data-field="amount"]').value) || 0;
    var necesario = row.querySelector('[data-field="necesario"]').value === "necesario";
    items.push({ label: cat.items[i], amount: amount, necesario: necesario });
  });
  return items;
}

function updateCategoryTotal(cat) {
  var items = readCategory(cat);
  var total = items.reduce(function (s, i) { return s + i.amount; }, 0);
  categoryCards[cat.key].querySelector("[data-cat-total]").textContent = lmMoney(total);
  return total;
}

CATEGORIES.forEach(function (cat) {
  categoryCards[cat.key].addEventListener("input", function () { updateCategoryTotal(cat); updateResults(); });
  categoryCards[cat.key].addEventListener("change", function () { updateCategoryTotal(cat); updateResults(); });
});

var incomeInput = document.getElementById("income-input");
incomeInput.addEventListener("input", updateResults);

function readAll() {
  var categories = {};
  var totalGastos = 0, totalNecesario = 0;
  CATEGORIES.forEach(function (cat) {
    var items = readCategory(cat);
    categories[cat.key] = items;
    items.forEach(function (i) {
      totalGastos += i.amount;
      if (i.necesario) totalNecesario += i.amount;
    });
  });
  return { categories: categories, totalGastos: totalGastos, totalNecesario: totalNecesario, totalOpcional: totalGastos - totalNecesario };
}

function updateResults() {
  var data = readAll();
  var income = parseFloat(incomeInput.value) || 0;
  var debtPayment = lmGetDebtsTotalPayment();
  var result = income - data.totalGastos - debtPayment;

  document.getElementById("stat-gastos").textContent = lmMoney(data.totalGastos);
  document.getElementById("stat-deudas").textContent = lmMoney(debtPayment);
  var resultEl = document.getElementById("stat-result");
  resultEl.textContent = lmMoney(result);
  resultEl.style.color = result >= 0 ? "var(--good)" : "var(--warn)";
  document.getElementById("stat-result-label").textContent = result >= 0 ? "Superávit mensual" : "Déficit mensual";

  return { data: data, income: income, debtPayment: debtPayment, result: result };
}

function renderPresupuestoResults(state) {
  var resultsEl = document.getElementById("results");
  resultsEl.innerHTML = "";
  lmRenderSaveBanner(resultsEl);

  var bodyLines = ["Mi presupuesto — Logic Money Manual Digital", "",
    "Ingreso mensual: " + lmMoney(state.income),
    "Gastos: " + lmMoney(state.data.totalGastos),
    "Pagos de deudas: " + lmMoney(state.debtPayment),
    (state.result >= 0 ? "Superávit: " : "Déficit: ") + lmMoney(state.result)];

  lmRenderSectionFooter({
    containerEl: resultsEl,
    mailtoSubject: "Mi presupuesto — Logic Money",
    mailtoBody: bodyLines.join("\n"),
    nextSectionHref: "../patrimonio/index.html",
  });
}

document.getElementById("save-btn").addEventListener("click", function () {
  var state = updateResults();
  lmSaveSection("presupuesto", {
    categories: state.data.categories,
    totalGastos: state.data.totalGastos,
    totalNecesario: state.data.totalNecesario,
    totalOpcional: state.data.totalOpcional,
    income: state.income,
  });
  renderPresupuestoResults(state);
});

(function init() {
  incomeInput.value = lmGetIncomeTotal() || "";

  var saved = lmGetSection("presupuesto");
  if (saved && saved.categories) {
    CATEGORIES.forEach(function (cat) {
      var items = saved.categories[cat.key];
      if (!items) return;
      var rows = categoryCards[cat.key].querySelectorAll(".lm-pitem");
      rows.forEach(function (row, i) {
        if (items[i]) {
          row.querySelector('[data-field="amount"]').value = items[i].amount || "";
          row.querySelector('[data-field="necesario"]').value = items[i].necesario ? "necesario" : "opcional";
        }
      });
      updateCategoryTotal(cat);
    });
    if (saved.income) incomeInput.value = saved.income;
    var state = updateResults();
    renderPresupuestoResults(state);
  } else {
    updateResults();
  }
})();
