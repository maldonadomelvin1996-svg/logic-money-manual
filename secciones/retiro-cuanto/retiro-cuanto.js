/* Logic Money — Manual Digital — Retiro 2/5: ¿Cuánto necesito? (págs. 363-364)
   multiplicador = 1.03^años (misma tabla del libro: 3% de inflación anual). */

lmRenderSectionDemoButton(document.getElementById("demo-btn-slot"), "retiro-cuanto");

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
    card.className = "lm-card lm-card-good";
    card.innerHTML =
      '<div class="lm-hero">' +
        '<div class="lm-hero-label">Necesitas al mes en el retiro</div>' +
        '<div class="lm-hero-value" style="color:var(--gold)">' + lmMoney(resultado) + '</div>' +
      '</div>' +
      '<div class="lm-tile-row" style="margin-top:14px">' +
        '<div class="lm-tile"><div class="lm-tile-label">Hoy te sentirías cómodo con</div><div class="lm-tile-value">' + lmMoney(ingreso) + '</div></div>' +
        '<div class="lm-tile"><div class="lm-tile-label">Multiplicador (' + anios + ' años)</div><div class="lm-tile-value">x' + multiplicador.toFixed(2) + '</div></div>' +
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
    prevSectionHref: "../retiro-cuando/index.html",
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
