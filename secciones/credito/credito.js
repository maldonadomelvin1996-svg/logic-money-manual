/* Logic Money — Manual Digital — Crédito (págs. 355-356) */

lmRenderSectionDemoButton(document.getElementById("demo-btn-slot"), "credito");

var scoreInput = document.getElementById("score");
var notesInput = document.getElementById("notes");

function scoreBand(score) {
  if (score >= 750) return { label: "Excelente", color: "var(--good)", soft: "var(--good-soft)" };
  if (score >= 670) return { label: "Bueno", color: "var(--teal)", soft: "var(--teal-soft)" };
  if (score >= 580) return { label: "Regular", color: "var(--gold)", soft: "var(--gold-soft)" };
  return { label: "Necesita mejorar", color: "var(--warn)", soft: "var(--warn-soft)" };
}

function renderCredito() {
  var score = parseInt(scoreInput.value, 10);
  var resultsEl = document.getElementById("results");
  resultsEl.innerHTML = "";

  var bodyLines = ["Mi crédito — Logic Money Manual Digital", ""];

  if (score) {
    var band = scoreBand(score);
    var markerPct = Math.max(2, Math.min(98, ((score - 300) / (850 - 300)) * 100));
    var card = document.createElement("div");
    card.className = "lm-card";
    card.innerHTML =
      '<div class="lm-hero">' +
        '<div class="lm-hero-label">Puntaje de crédito</div>' +
        '<div class="lm-hero-value" style="color:' + band.color + '">' + score + '</div>' +
        '<span class="lm-status-pill" style="background:' + band.soft + ';color:' + band.color + '">' + band.label + '</span>' +
      '</div>' +
      '<div class="lm-mini-bar-track" style="background:linear-gradient(to right, var(--warn), var(--gold), var(--teal), var(--good))">' +
        '<div class="lm-mini-bar-marker" style="left:' + markerPct + '%;background:' + band.color + '"></div>' +
      '</div>' +
      '<div class="lm-mini-bar-scale"><span>300</span><span>850</span></div>';
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
    prevSectionHref: "../fondo-emergencia/index.html",
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
