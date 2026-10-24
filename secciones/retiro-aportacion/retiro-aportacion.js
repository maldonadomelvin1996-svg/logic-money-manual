/* Logic Money — Manual Digital — Retiro 5/5: Aportación requerida (págs. 369-370)
   PMT mensual = FV * i / ((1+i)^n - 1), con i = tasa_anual/12, n = años*12.
   Para 0% de crecimiento: PMT = FV / n (división simple). */

var nifInput = document.getElementById("nif");
var aniosInput = document.getElementById("anios");
var RATES = [0, 3, 6, 10];

function monthlyPMT(fv, ratePct, years) {
  var n = years * 12;
  if (n <= 0 || fv <= 0) return 0;
  if (ratePct === 0) return fv / n;
  var i = (ratePct / 100) / 12;
  return fv * i / (Math.pow(1 + i, n) - 1);
}

function render() {
  var nif = parseFloat(nifInput.value) || 0;
  var anios = parseFloat(aniosInput.value) || 0;

  var resultsEl = document.getElementById("results");
  resultsEl.innerHTML = "";

  if (nif <= 0 || anios <= 0) {
    resultsEl.innerHTML = '<div class="lm-callout lm-callout-neutral">Completa tu número de independencia financiera y los años para tu retiro para ver la tabla.</div>';
  } else {
    var card = document.createElement("div");
    card.className = "lm-card";
    var html = '<div class="lm-card-flat">';
    RATES.forEach(function (rate, i) {
      var mensual = monthlyPMT(nif, rate, anios);
      var anual = mensual * 12;
      html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0' + (i < RATES.length - 1 ? ";border-bottom:1px solid var(--border)" : "") + '">' +
        '<span class="lm-badge lm-badge-gold">' + rate + '%</span>' +
        '<span style="color:var(--text-mid);font-size:13px">' + lmMoney(anual) + '/año</span>' +
        '<span style="font-weight:700">' + lmMoney(mensual) + '/mes</span>' +
        '</div>';
    });
    html += '</div>';
    card.innerHTML = html;
    resultsEl.appendChild(card);
  }

  lmRenderSaveBanner(resultsEl);

  var bodyLines = ["Aportación requerida para mi retiro — Logic Money", ""];
  RATES.forEach(function (rate) {
    bodyLines.push(rate + "% de crecimiento: " + lmMoney(monthlyPMT(nif, rate, anios)) + "/mes");
  });

  lmRenderSectionFooter({
    containerEl: resultsEl,
    mailtoSubject: "Mi aportación requerida — Logic Money",
    mailtoBody: bodyLines.join("\n"),
    nextSectionHref: "../retiro-perfil/index.html",
  });

  lmSaveSection("retiro-aportacion", { nif: nif, anios: anios, rates: RATES.map(function (r) { return { rate: r, mensual: monthlyPMT(nif, r, anios) }; }) });
}

nifInput.addEventListener("input", render);
aniosInput.addEventListener("input", render);

(function init() {
  var saved = lmGetSection("retiro-aportacion");
  var retiroNif = lmGetSection("retiro-nif");
  var retiroCuando = lmGetSection("retiro-cuando");
  nifInput.value = saved ? saved.nif : ((retiroNif && retiroNif.nif) || "");
  aniosInput.value = saved ? saved.anios : ((retiroCuando && retiroCuando.anios) || "");
  render();
})();
