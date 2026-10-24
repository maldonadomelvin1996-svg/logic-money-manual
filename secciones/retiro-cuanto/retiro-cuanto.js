/* Logic Money — Manual Digital — Retiro 2/5: ¿Cuánto necesito? (págs. 363-364)
   multiplicador = 1.03^años (misma tabla del libro: 3% de inflación anual). */

var ingresoInput = document.getElementById("ingreso-objetivo");
var aniosInput = document.getElementById("anios");

function render() {
  var ingreso = parseFloat(ingresoInput.value) || 0;
  var anios = parseFloat(aniosInput.value) || 0;
  var multiplicador = Math.pow(1.03, anios);
  var resultado = ingreso * multiplicador;

  var resultsEl = document.getElementById("results");
  resultsEl.innerHTML = "";

  if (ingreso > 0) {
    var card = document.createElement("div");
    card.className = "lm-card";
    card.innerHTML =
      '<div class="lm-stat-grid" style="margin-bottom:12px">' +
        '<div class="lm-stat"><div class="lm-stat-value">x' + multiplicador.toFixed(2) + '</div><div class="lm-stat-label">Multiplicador (' + anios + ' años)</div></div>' +
        '<div class="lm-stat"><div class="lm-stat-value">' + lmMoney(resultado) + '</div><div class="lm-stat-label">Necesitas al mes en el retiro</div></div>' +
      '</div>';
    resultsEl.appendChild(card);
  } else {
    resultsEl.innerHTML = '<div class="lm-callout lm-callout-neutral">Pon un ingreso mensual objetivo arriba para ver el ajuste por inflación.</div>';
  }

  lmRenderSaveBanner(resultsEl);

  lmRenderSectionFooter({
    containerEl: resultsEl,
    mailtoSubject: "Mi retiro — Logic Money",
    mailtoBody: "Cuánto necesito al mes en el retiro — Logic Money\n\nIngreso objetivo hoy: " + lmMoney(ingreso) + "\nAños para retiro: " + anios + "\nMultiplicador: x" + multiplicador.toFixed(2) + "\nResultado: " + lmMoney(resultado),
    nextSectionHref: "../retiro-silla/index.html",
  });

  lmSaveSection("retiro-cuanto", { ingreso: ingreso, anios: anios, multiplicador: multiplicador, resultado: resultado });
}

ingresoInput.addEventListener("input", render);
aniosInput.addEventListener("input", render);

(function init() {
  var saved = lmGetSection("retiro-cuanto");
  var retiroCuando = lmGetSection("retiro-cuando");
  ingresoInput.value = saved ? saved.ingreso : (lmGetIncomeTotal() || "");
  aniosInput.value = saved ? saved.anios : ((retiroCuando && retiroCuando.anios) || "");
  render();
})();
