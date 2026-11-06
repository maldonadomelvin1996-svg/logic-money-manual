/* Logic Money — Manual Digital — Retiro 4/5: Número de independencia financiera (págs. 367-368) */

lmRenderSectionDemoButton(document.getElementById("demo-btn-slot"), "retiro-nif");

var objetivoInput = document.getElementById("objetivo-mensual");

function render() {
  var objetivo = parseFloat(objetivoInput.value) || 0;
  var anual = objetivo * 12;
  var nif = anual / 0.05;

  var resultsEl = document.getElementById("results");
  resultsEl.innerHTML = "";

  var card = document.createElement("div");
  if (objetivo <= 0) {
    card.className = "lm-card";
    card.innerHTML = '<div class="lm-callout lm-callout-good">Si ya no te falta nada mensual por conseguir, significa que tus fuentes actuales ya cubren tu retiro — no necesitas acumular más.</div>';
  } else {
    card.className = "lm-card lm-card-good";
    card.innerHTML =
      '<div class="lm-hero">' +
        '<div class="lm-hero-label">Número de independencia financiera</div>' +
        '<div class="lm-hero-value" style="color:var(--good)">' + lmMoney(nif) + '</div>' +
      '</div>' +
      '<div class="lm-tile-row" style="margin-top:14px">' +
        '<div class="lm-tile"><div class="lm-tile-label">Te falta al mes</div><div class="lm-tile-value">' + lmMoney(objetivo) + '</div></div>' +
        '<div class="lm-tile"><div class="lm-tile-label">Anual (x12)</div><div class="lm-tile-value">' + lmMoney(anual) + '</div></div>' +
      '</div>';
  }
  resultsEl.appendChild(card);

  lmRenderSaveBanner(resultsEl);

  lmRenderSectionFooter({
    containerEl: resultsEl,
    mailtoSubject: "Mi número de independencia financiera — Logic Money",
    mailtoBody: "Número de independencia financiera — Logic Money\n\nObjetivo mensual: " + lmMoney(objetivo) + "\nAnual: " + lmMoney(anual) + "\nNúmero de independencia financiera: " + lmMoney(nif),
    nextSectionHref: "../retiro-aportacion/index.html",
  });

  lmSaveSection("retiro-nif", { objetivo: objetivo, anual: anual, nif: nif });
}

objetivoInput.addEventListener("input", render);

(function init() {
  var saved = lmGetSection("retiro-nif");
  var retiroSilla = lmGetSection("retiro-silla");
  objetivoInput.value = saved ? saved.objetivo : ((retiroSilla && retiroSilla.falta) || "");
  render();
})();
