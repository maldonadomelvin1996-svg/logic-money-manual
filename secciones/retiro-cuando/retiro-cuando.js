/* Logic Money — Manual Digital — Retiro 1/5: ¿Cuándo? (págs. 361-362) */

var edadActualInput = document.getElementById("edad-actual");
var edadRetiroInput = document.getElementById("edad-retiro");

function render() {
  var edadActual = parseFloat(edadActualInput.value) || 0;
  var edadRetiro = parseFloat(edadRetiroInput.value) || 0;
  var anios = Math.max(0, edadRetiro - edadActual);

  var resultsEl = document.getElementById("results");
  resultsEl.innerHTML = "";

  if (edadActual > 0 && edadRetiro > 0) {
    var card = document.createElement("div");
    card.className = "lm-card";
    card.innerHTML = '<div class="lm-stat"><div class="lm-stat-value">' + anios + ' años</div><div class="lm-stat-label">Para tu retiro</div></div>';
    resultsEl.appendChild(card);
  } else {
    resultsEl.innerHTML = '<div class="lm-callout lm-callout-neutral">Si no sabes aún a qué edad te quieres retirar, pon un número aproximado — siempre puedes ajustarlo más adelante.</div>';
  }

  lmRenderSaveBanner(resultsEl);

  lmRenderSectionFooter({
    containerEl: resultsEl,
    mailtoSubject: "Mi retiro — Logic Money",
    mailtoBody: "Mi retiro — Logic Money Manual Digital\n\nEdad actual: " + (edadActual || "?") + "\nEdad de retiro: " + (edadRetiro || "?") + "\nAños para retiro: " + anios,
    nextSectionHref: "../retiro-cuanto/index.html",
  });

  lmSaveSection("retiro-cuando", { edadActual: edadActual, edadRetiro: edadRetiro, anios: anios });
}

edadActualInput.addEventListener("input", render);
edadRetiroInput.addEventListener("input", render);

(function init() {
  var saved = lmGetSection("retiro-cuando");
  if (saved) {
    edadActualInput.value = saved.edadActual || "";
    edadRetiroInput.value = saved.edadRetiro || "";
  }
  render();
})();
