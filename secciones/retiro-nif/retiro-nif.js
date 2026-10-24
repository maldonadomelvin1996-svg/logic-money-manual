/* Logic Money — Manual Digital — Retiro 4/5: Número de independencia financiera (págs. 367-368) */

var objetivoInput = document.getElementById("objetivo-mensual");

function render() {
  var objetivo = parseFloat(objetivoInput.value) || 0;
  var anual = objetivo * 12;
  var nif = anual / 0.05;

  var resultsEl = document.getElementById("results");
  resultsEl.innerHTML = "";

  var card = document.createElement("div");
  card.className = "lm-card";
  if (objetivo <= 0) {
    card.innerHTML = '<div class="lm-callout lm-callout-good">Si ya no te falta nada mensual por conseguir, significa que tus fuentes actuales ya cubren tu retiro — no necesitas acumular más.</div>';
  } else {
    card.innerHTML =
      '<div class="lm-stat-grid" style="margin-bottom:12px">' +
        '<div class="lm-stat"><div class="lm-stat-value">' + lmMoney(anual) + '</div><div class="lm-stat-label">Anual (x12)</div></div>' +
      '</div>' +
      '<hr class="lm-divider">' +
      '<div class="lm-stat"><div class="lm-stat-value">' + lmMoney(nif) + '</div><div class="lm-stat-label">Tu número de independencia financiera</div></div>';
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
