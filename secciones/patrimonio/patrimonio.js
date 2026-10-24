/* Logic Money — Manual Digital — Patrimonio (págs. 347-350) */

var activosInput = document.getElementById("activos");
var pasivosInput = document.getElementById("pasivos");

function updatePatrimonio() {
  var activos = parseFloat(activosInput.value) || 0;
  var pasivos = parseFloat(pasivosInput.value) || 0;
  var patrimonio = activos - pasivos;

  var el = document.getElementById("patrimonio-value");
  el.textContent = lmMoney(patrimonio);
  el.style.color = patrimonio >= 0 ? "var(--good)" : "var(--warn)";

  var note;
  if (patrimonio < 0) {
    note = "Es común que el patrimonio sea negativo durante la etapa donde tenemos más responsabilidades (casa, carro, estudios). No te asustes — no significa que vas por mal camino, pero tampoco te confíes.";
  } else {
    note = "Tu patrimonio es positivo — lo que tienes supera lo que debes. Sigue así.";
  }
  document.getElementById("interpretation").innerHTML =
    '<div class="lm-callout ' + (patrimonio >= 0 ? "lm-callout-good" : "lm-callout-warn") + '">' + note + '</div>';

  return { activos: activos, pasivos: pasivos, patrimonio: patrimonio };
}

activosInput.addEventListener("input", updatePatrimonio);
pasivosInput.addEventListener("input", updatePatrimonio);

function renderPatrimonioResults(state) {
  var resultsEl = document.getElementById("results");
  resultsEl.innerHTML = "";
  lmRenderSaveBanner(resultsEl);

  lmRenderSectionFooter({
    containerEl: resultsEl,
    mailtoSubject: "Mi patrimonio — Logic Money",
    mailtoBody: "Mi patrimonio — Logic Money Manual Digital\n\nActivos: " + lmMoney(state.activos) +
      "\nPasivos: " + lmMoney(state.pasivos) + "\nPatrimonio: " + lmMoney(state.patrimonio),
    nextSectionHref: "../reduccion-deudas/index.html",
  });
}

document.getElementById("save-btn").addEventListener("click", function () {
  var state = updatePatrimonio();
  lmSaveSection("patrimonio", state);
  renderPatrimonioResults(state);
});

(function init() {
  var saved = lmGetSection("patrimonio");
  activosInput.value = saved ? saved.activos : (lmGetSavingsTotal() || "");
  pasivosInput.value = saved ? saved.pasivos : (lmGetDebtsTotalBalance() || "");
  var state = updatePatrimonio();
  if (saved) renderPatrimonioResults(state);
})();
