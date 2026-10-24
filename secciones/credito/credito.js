/* Logic Money — Manual Digital — Crédito (págs. 355-356) */

var scoreInput = document.getElementById("score");
var notesInput = document.getElementById("notes");

function scoreBand(score) {
  if (score >= 750) return { label: "Excelente", cls: "lm-badge-good" };
  if (score >= 670) return { label: "Bueno", cls: "lm-badge-good" };
  if (score >= 580) return { label: "Regular", cls: "lm-badge-gold" };
  return { label: "Necesita mejorar", cls: "lm-badge-warn" };
}

function renderCredito() {
  var score = parseInt(scoreInput.value, 10);
  var resultsEl = document.getElementById("results");
  resultsEl.innerHTML = "";

  var bodyLines = ["Mi crédito — Logic Money Manual Digital", ""];

  if (score) {
    var band = scoreBand(score);
    var card = document.createElement("div");
    card.className = "lm-card";
    card.innerHTML =
      '<div class="lm-stat">' +
        '<div class="lm-stat-value">' + score + '</div>' +
        '<div class="lm-stat-label">Puntaje de crédito</div>' +
        '<span class="lm-badge ' + band.cls + '" style="margin-top:10px">' + band.label + '</span>' +
      '</div>';
    resultsEl.appendChild(card);

    var tip = document.createElement("div");
    tip.className = "lm-callout lm-callout-gold";
    tip.textContent = "El crédito es un músculo: la única forma de hacerlo crecer es ejercitándolo. Si no tienes crédito, empieza con una tarjeta garantizada o asegurada. Si está estancado, revisa que tus tarjetas no estén muy altas — usa menos del 30% del límite.";
    resultsEl.appendChild(tip);

    bodyLines.push("Puntaje: " + score + " (" + band.label + ")");
  } else {
    resultsEl.innerHTML = '<div class="lm-callout lm-callout-neutral">Sin problema — sigue adelante. Puedes revisar tu puntaje luego en Credit Karma o annualcreditreport.com y volver a esta página.</div>';
    bodyLines.push("Puntaje: pendiente de averiguar");
  }
  if (notesInput.value) bodyLines.push("Notas: " + notesInput.value);

  lmRenderSaveBanner(resultsEl);

  lmRenderSectionFooter({
    containerEl: resultsEl,
    mailtoSubject: "Mi crédito — Logic Money",
    mailtoBody: bodyLines.join("\n"),
    nextSectionHref: "../nivel-deuda/index.html",
  });

  lmSaveSection("credito", { score: score || null, notes: notesInput.value });
}

scoreInput.addEventListener("input", renderCredito);
notesInput.addEventListener("input", renderCredito);

(function init() {
  lmWrapUnknown(scoreInput);
  var saved = lmGetSection("credito");
  if (saved) {
    scoreInput.value = saved.score || "";
    notesInput.value = saved.notes || "";
  }
  renderCredito();
})();
