/* Logic Money — Manual Digital — Retiro 3/5: Silla de retiro (págs. 365-366) */

var seguroSocialInput = document.getElementById("seguro-social");
var patronalInput = document.getElementById("patronal");
var personalInput = document.getElementById("personal");

lmWrapUnknown(seguroSocialInput);
lmWrapUnknown(patronalInput);
lmWrapUnknown(personalInput);

function render() {
  var seguroSocial = parseFloat(seguroSocialInput.value) || 0;
  var patronal = parseFloat(patronalInput.value) || 0;
  var personal = parseFloat(personalInput.value) || 0;
  var fuentes = seguroSocial + patronal + personal;

  var retiroCuanto = lmGetSection("retiro-cuanto");
  var objetivo = retiroCuanto ? (retiroCuanto.resultado || 0) : 0;
  var falta = Math.max(0, objetivo - fuentes);

  var resultsEl = document.getElementById("results");
  resultsEl.innerHTML = "";

  var card = document.createElement("div");
  card.className = "lm-card";
  if (!objetivo) {
    card.innerHTML = '<div class="lm-callout lm-callout-neutral">Completa el paso anterior ("¿Cuánto necesito recibir al mes?") para ver cuánto te falta cubrir.</div>';
  } else if (falta <= 0) {
    card.innerHTML = '<div class="lm-stat"><div class="lm-stat-value" style="color:var(--good)">&#10003;</div><div class="lm-stat-label">Ya puedes retirarte — tus fuentes cubren tu objetivo de ' + lmMoney(objetivo) + '/mes</div></div>';
  } else {
    card.innerHTML =
      '<div class="lm-stat-grid" style="margin-bottom:12px">' +
        '<div class="lm-stat"><div class="lm-stat-value">' + lmMoney(objetivo) + '</div><div class="lm-stat-label">Objetivo mensual</div></div>' +
        '<div class="lm-stat"><div class="lm-stat-value">' + lmMoney(fuentes) + '</div><div class="lm-stat-label">Tus fuentes conocidas</div></div>' +
      '</div>' +
      '<hr class="lm-divider">' +
      '<div class="lm-stat"><div class="lm-stat-value" style="color:var(--warn)">' + lmMoney(falta) + '</div><div class="lm-stat-label">Te falta conseguir al mes</div></div>';
  }
  resultsEl.appendChild(card);

  lmRenderSaveBanner(resultsEl);

  lmRenderSectionFooter({
    containerEl: resultsEl,
    mailtoSubject: "Mi silla de retiro — Logic Money",
    mailtoBody: "Mi silla de retiro — Logic Money\n\nSeguro Social: " + lmMoney(seguroSocial) + "\nPatronal: " + lmMoney(patronal) + "\nPersonal: " + lmMoney(personal) + "\nFalta conseguir: " + lmMoney(falta),
    nextSectionHref: "../retiro-nif/index.html",
  });

  lmSaveSection("retiro-silla", { seguroSocial: seguroSocial, patronal: patronal, personal: personal, objetivo: objetivo, falta: falta });
}

seguroSocialInput.addEventListener("input", render);
patronalInput.addEventListener("input", render);
personalInput.addEventListener("input", render);

(function init() {
  var saved = lmGetSection("retiro-silla");
  if (saved) {
    seguroSocialInput.value = saved.seguroSocial || "";
    patronalInput.value = saved.patronal || "";
    personalInput.value = saved.personal || "";
  }
  render();
})();
