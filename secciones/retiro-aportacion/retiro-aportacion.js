/* Logic Money — Manual Digital — Retiro 5/5: Aportación requerida (págs. 369-370)
   PMT mensual = FV * i / ((1+i)^n - 1), con i = tasa_anual/12, n = años*12.
   Para 0% de crecimiento: PMT = FV / n (división simple). */

lmRenderSectionDemoButton(document.getElementById("demo-btn-slot"), "retiro-aportacion");

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
    var RATE_COLORS = { 0: "var(--warn)", 3: "#FF9A4D", 6: "var(--gold)", 10: "var(--good)" };
    var card = document.createElement("div");
    card.className = "lm-card";
    var html = '<div class="lm-hero-label" style="text-align:left;margin-bottom:10px">Aportación mensual por crecimiento</div>';
    html += '<div class="lm-tile-row" style="flex-wrap:wrap">';
    RATES.forEach(function (rate) {
      var mensual = monthlyPMT(nif, rate, anios);
      var color = RATE_COLORS[rate] || "var(--gold)";
      html += '<div class="lm-tile" style="flex:1 1 40%;border-color:' + color + '55">' +
        '<div class="lm-tile-label" style="color:' + color + '">' + rate + '% anual</div>' +
        '<div class="lm-tile-value" style="color:' + color + ';font-size:17px">' + lmMoney(mensual) + '</div>' +
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
    prevSectionHref: "../retiro-nif/index.html",
  });

  lmSaveSection("retiro-aportacion", { nif: nif, anios: anios, rates: RATES.map(function (r) { return { rate: r, mensual: monthlyPMT(nif, r, anios) }; }) });
}

nifInput.addEventListener("input", render);
aniosInput.addEventListener("input", render);

(function init() {
  var saved = lmGetSection("retiro-aportacion");
  var retiroNif = lmGetSection("retiro-nif");
  var retiroCuando = lmGetSection("retiro-cuando");
  nifInput.value = saved ? lmRound(saved.nif) : lmRoundOrBlank(retiroNif && retiroNif.nif);
  aniosInput.value = saved ? lmRound(saved.anios) : lmRoundOrBlank(retiroCuando && retiroCuando.anios);
  render();
})();
