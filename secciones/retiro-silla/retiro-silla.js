/* Logic Money — Manual Digital — Retiro 3/5: Silla de retiro (págs. 365-366) */

lmRenderSectionDemoButton(document.getElementById("demo-btn-slot"), "retiro-silla");

var seguroSocialInput = document.getElementById("seguro-social");
var patronalInput = document.getElementById("patronal");
var personalInput = document.getElementById("personal");

lmWrapUnknown(seguroSocialInput);
lmWrapUnknown(patronalInput);
lmWrapUnknown(personalInput);

/* Fuentes extra de ingreso en el retiro (renta, negocio propio, etc.) —
   mismo patrón de fila repetible que usa el resto del sitio (ver
   addDebtRow en deudas.js), solo que más compacta: un nombre y un
   monto mensual por fila. */
var extraWrap = document.getElementById("extra-fuentes");
var extraRowCount = 0;

function addExtraFuenteRow(prefill) {
  extraRowCount++;
  var id = "fuente-" + extraRowCount;
  var row = document.createElement("div");
  row.className = "lm-row";
  row.style.cssText = "align-items:flex-end;gap:8px;margin-bottom:14px";
  row.dataset.id = id;
  row.innerHTML =
    '<div class="lm-field" style="margin-bottom:0;flex:2">' +
      '<label class="lm-label" style="font-size:13px;margin-bottom:6px">Fuente</label>' +
      '<input class="lm-input" type="text" placeholder="Ej. Renta, negocio propio" data-field="label">' +
    '</div>' +
    '<div class="lm-field" style="margin-bottom:0;flex:1">' +
      '<label class="lm-label" style="font-size:13px;margin-bottom:6px">Mensual</label>' +
      '<input class="lm-input" type="number" inputmode="decimal" placeholder="$0" min="0" data-field="amount">' +
    '</div>' +
    '<button class="lm-remove-btn lm-no-print" type="button" data-remove="' + id + '">Quitar</button>';
  extraWrap.appendChild(row);

  row.querySelectorAll('[data-field]').forEach(function (input) {
    input.addEventListener("input", render);
  });
  row.querySelector('[data-remove="' + id + '"]').addEventListener("click", function () {
    row.remove();
    render();
  });

  if (prefill) {
    row.querySelector('[data-field="label"]').value = prefill.label || "";
    row.querySelector('[data-field="amount"]').value = prefill.amount || "";
  }
}
document.getElementById("add-fuente").addEventListener("click", function () { addExtraFuenteRow(); });

function readExtraFuentes() {
  var rows = extraWrap.querySelectorAll('[data-id]');
  var list = [];
  rows.forEach(function (row) {
    var label = row.querySelector('[data-field="label"]').value.trim();
    var amount = parseFloat(row.querySelector('[data-field="amount"]').value) || 0;
    if (label || amount > 0) list.push({ label: label || "Otra fuente", amount: amount });
  });
  return list;
}

function render() {
  var seguroSocial = parseFloat(seguroSocialInput.value) || 0;
  var patronal = parseFloat(patronalInput.value) || 0;
  var personal = parseFloat(personalInput.value) || 0;
  var extras = readExtraFuentes();
  var extrasTotal = extras.reduce(function (sum, e) { return sum + e.amount; }, 0);
  var fuentes = seguroSocial + patronal + personal + extrasTotal;

  var retiroCuanto = lmGetSection("retiro-cuanto");
  var objetivo = retiroCuanto ? (retiroCuanto.resultado || 0) : 0;
  var falta = Math.max(0, objetivo - fuentes);

  var resultsEl = document.getElementById("results");
  resultsEl.innerHTML = "";

  var card = document.createElement("div");
  if (!objetivo) {
    card.className = "lm-card";
    card.innerHTML = '<div class="lm-callout lm-callout-neutral">Completa el paso anterior ("¿Cuánto necesito recibir al mes?") para ver cuánto te falta cubrir.</div>';
  } else if (falta <= 0) {
    card.className = "lm-card lm-card-good";
    card.innerHTML = '<div class="lm-hero"><div class="lm-hero-value" style="color:var(--good)">&#10003;</div><div class="lm-hero-sub">Ya puedes retirarte — tus fuentes cubren tu objetivo de ' + lmMoney(objetivo) + '/mes</div></div>';
  } else {
    card.className = "lm-card lm-card-attn";
    card.innerHTML =
      '<div class="lm-hero">' +
        '<div class="lm-hero-label">Te falta conseguir al mes</div>' +
        '<div class="lm-hero-value" style="color:var(--warn)">' + lmMoney(falta) + '</div>' +
      '</div>' +
      '<div class="lm-tile-row" style="margin-top:14px">' +
        '<div class="lm-tile"><div class="lm-tile-label">Objetivo mensual</div><div class="lm-tile-value">' + lmMoney(objetivo) + '</div></div>' +
        '<div class="lm-tile"><div class="lm-tile-label">Tus fuentes conocidas</div><div class="lm-tile-value">' + lmMoney(fuentes) + '</div></div>' +
      '</div>';
  }
  resultsEl.appendChild(card);

  lmRenderSaveBanner(resultsEl);

  var extrasBody = extras.map(function (e) { return "\n" + e.label + ": " + lmMoney(e.amount); }).join("");

  lmRenderSectionFooter({
    containerEl: resultsEl,
    mailtoSubject: "Mi silla de retiro — Logic Money",
    mailtoBody: "Mi silla de retiro — Logic Money\n\nSeguro Social: " + lmMoney(seguroSocial) + "\nPatronal: " + lmMoney(patronal) + "\nPersonal: " + lmMoney(personal) + extrasBody + "\nFalta conseguir: " + lmMoney(falta),
    nextSectionHref: "../retiro-nif/index.html",
    prevSectionHref: "../retiro-cuanto/index.html",
  });

  lmSaveSection("retiro-silla", { seguroSocial: seguroSocial, patronal: patronal, personal: personal, extras: extras, objetivo: objetivo, falta: falta });
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
    if (saved.extras) saved.extras.forEach(function (e) { addExtraFuenteRow(e); });
  }
  render();
})();
