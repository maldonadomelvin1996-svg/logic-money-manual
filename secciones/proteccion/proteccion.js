/* Logic Money — Manual Digital — Análisis de protección (págs. 359-360) */

var basicStatusEl = document.getElementById("basic-status");
var medico = lmGetInsuranceByType("Médico");
var vehiculo = lmGetInsuranceByType("Vehículo");
var vida = lmGetInsuranceByType("Vida");

function statusBadge(ins) {
  if (!ins) return '<span class="lm-badge lm-badge-muted">Sin datos</span>';
  return ins.has ? '<span class="lm-badge lm-badge-good">&#10003; Lo tiene</span>' : '<span class="lm-badge lm-badge-warn">No lo tiene</span>';
}
basicStatusEl.innerHTML =
  '<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)"><span>Seguro médico</span>' + statusBadge(medico) + '</div>' +
  '<div style="display:flex;justify-content:space-between;padding:8px 0">' +
    '<span>Seguro de vehículo</span>' + statusBadge(vehiculo) + '</div>';
if (!medico && !vehiculo) {
  basicStatusEl.innerHTML += '<div class="lm-hint" style="margin-top:8px">Se llena solo con tu sección de Seguros.</div>';
}

var lifeFormEl = document.getElementById("life-form");
var needYesBtn = document.getElementById("need-yes");
var needNoBtn = document.getElementById("need-no");
var needsLife = null;

var deudasInput = document.getElementById("deudas");
var funeralInput = document.getElementById("funeral");
var ingresoAnualInput = document.getElementById("ingreso-anual");
var aniosInput = document.getElementById("anios");
var ahorrosInput = document.getElementById("ahorros");
var coberturaInput = document.getElementById("cobertura-actual");

function setNeeds(value) {
  needsLife = value;
  needYesBtn.className = "lm-btn " + (value === true ? "lm-btn-primary" : "lm-btn-secondary");
  needNoBtn.className = "lm-btn " + (value === false ? "lm-btn-primary" : "lm-btn-secondary");
  lifeFormEl.style.display = value === true ? "block" : "none";
  renderProteccion();
}

needYesBtn.addEventListener("click", function () { setNeeds(true); });
needNoBtn.addEventListener("click", function () { setNeeds(false); });

[deudasInput, funeralInput, ingresoAnualInput, aniosInput, ahorrosInput, coberturaInput].forEach(function (input) {
  input.addEventListener("input", renderProteccion);
});

function renderProteccion() {
  var resultsEl = document.getElementById("results");
  resultsEl.innerHTML = "";

  if (needsLife === null) return;

  var state = { needsLife: needsLife };

  if (needsLife === false) {
    resultsEl.innerHTML = '<div class="lm-callout lm-callout-neutral">Como nadie depende financieramente de ti, no necesitas seguro de vida por ahora. Esto puede cambiar si tienes dependientes o deudas compartidas en el futuro.</div>';
  } else {
    var deudas = parseFloat(deudasInput.value) || 0;
    var funeral = parseFloat(funeralInput.value) || 0;
    var ingresoAnual = parseFloat(ingresoAnualInput.value) || 0;
    var anios = parseFloat(aniosInput.value) || 0;
    var ahorros = parseFloat(ahorrosInput.value) || 0;
    var coberturaActual = parseFloat(coberturaInput.value) || 0;

    var reemplazo = ingresoAnual * anios;
    var responsabilidades = deudas + funeral + reemplazo;
    var recursos = ahorros + coberturaActual;
    var resultado = recursos - responsabilidades;

    state = { needsLife: true, deudas: deudas, funeral: funeral, ingresoAnual: ingresoAnual, anios: anios, reemplazo: reemplazo, ahorros: ahorros, coberturaActual: coberturaActual, resultado: resultado };

    var card = document.createElement("div");
    card.className = "lm-card";
    card.innerHTML =
      '<h3 class="lm-h3">Responsabilidades vs. recursos</h3>' +
      '<div class="lm-stat-grid" style="margin-bottom:14px">' +
        '<div class="lm-stat"><div class="lm-stat-value">' + lmMoney(responsabilidades) + '</div><div class="lm-stat-label">Deudas + reemplazo + funeral</div></div>' +
        '<div class="lm-stat"><div class="lm-stat-value">' + lmMoney(recursos) + '</div><div class="lm-stat-label">Ahorros + cobertura actual</div></div>' +
      '</div>' +
      '<hr class="lm-divider">' +
      '<div class="lm-stat">' +
        '<div class="lm-stat-value" style="color:' + (resultado >= 0 ? "var(--good)" : "var(--warn)") + '">' + (resultado >= 0 ? "+" : "") + lmMoney(resultado) + '</div>' +
        '<div class="lm-stat-label">' + (resultado >= 0 ? "Estás cubierto (superávit)" : "Te falta cobertura (déficit)") + '</div>' +
      '</div>';
    resultsEl.appendChild(card);
  }

  lmRenderSaveBanner(resultsEl);

  var bodyLines = ["Mi análisis de protección — Logic Money Manual Digital", ""];
  if (needsLife === false) {
    bodyLines.push("No necesita seguro de vida por ahora.");
  } else {
    bodyLines.push("Responsabilidades: " + lmMoney(state.deudas + state.funeral + state.reemplazo));
    bodyLines.push("Recursos: " + lmMoney(state.ahorros + state.coberturaActual));
    bodyLines.push("Resultado: " + (state.resultado >= 0 ? "+" : "") + lmMoney(state.resultado));
  }

  lmRenderSectionFooter({
    containerEl: resultsEl,
    mailtoSubject: "Mi análisis de protección — Logic Money",
    mailtoBody: bodyLines.join("\n"),
    nextSectionHref: "../retiro-cuando/index.html",
  });

  lmSaveSection("proteccion", state);
}

(function init() {
  lmWrapUnknown(aniosInput);

  var saved = lmGetSection("proteccion");
  deudasInput.value = saved ? saved.deudas : (lmGetDebtsTotalBalance() || "");
  ingresoAnualInput.value = saved ? saved.ingresoAnual : ((lmGetIncomeTotal() * 12) || "");
  ahorrosInput.value = saved ? saved.ahorros : (lmGetSavingsTotal() || "");
  coberturaInput.value = saved ? saved.coberturaActual : ((vida && vida.coverage) || "");
  if (saved && typeof saved.funeral === "number") funeralInput.value = saved.funeral;
  if (saved && saved.anios) aniosInput.value = saved.anios;

  if (saved && saved.needsLife !== undefined && saved.needsLife !== null) {
    setNeeds(saved.needsLife);
  }
})();
