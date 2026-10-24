/* Logic Money — Manual Digital — Reducción de deudas (págs. 351-352)
   100% automática: lee la lista de deudas ya guardada en la sección
   Deudas y aplica el efecto bola de nieve (sin pedir nada nuevo). */

var contentEl = document.getElementById("content");
var debts = lmGetDebts();

if (debts.length === 0) {
  contentEl.innerHTML = '<div class="lm-callout lm-callout-warn">Primero completa la sección de <a href="../deudas/index.html" style="color:inherit">Deudas</a> — esta página se arma sola con esa información.</div>';
} else if (debts.length === 1) {
  contentEl.innerHTML = '<div class="lm-callout lm-callout-neutral">Como solo tienes una deuda, la forma de reducirla es aportar dinero adicional de tu sobrante mensual directamente a ella.</div>';
} else {
  var ordered = lmOrderDebts(debts);
  var cumulative = 0;
  var rows = ordered.map(function (d, i) {
    var pagoAdicional = cumulative;
    var nuevoPago = d.payment + pagoAdicional;
    cumulative += d.payment;
    return { name: d.name, balance: d.balance, payment: d.payment, pagoAdicional: pagoAdicional, nuevoPago: nuevoPago, isHome: d.isHome };
  });

  var card = document.createElement("div");
  card.className = "lm-card";
  var html = '<div class="lm-card-flat">';
  rows.forEach(function (r, i) {
    html += '<div style="padding:10px 0' + (i < rows.length - 1 ? ";border-bottom:1px solid var(--border)" : "") + '">' +
      '<div style="display:flex;justify-content:space-between;font-weight:600">' +
        '<span>' + (i + 1) + '. ' + escapeRedHtml(r.name) + (r.isHome ? ' <span class="lm-badge lm-badge-muted">casa</span>' : '') + '</span>' +
        '<span>' + lmMoney(r.balance) + '</span>' +
      '</div>' +
      '<div style="display:flex;justify-content:space-between;color:var(--text-mid);font-size:13px;margin-top:4px">' +
        '<span>Pago: ' + lmMoney(r.payment) + (r.pagoAdicional > 0 ? ' + ' + lmMoney(r.pagoAdicional) + ' adicional' : '') + '</span>' +
        '<span style="color:var(--good);font-weight:600">' + lmMoney(r.nuevoPago) + ' nuevo pago</span>' +
      '</div>' +
      '</div>';
  });
  html += '</div>';
  card.innerHTML = html;
  contentEl.appendChild(card);

  var noteEl = document.createElement("div");
  noteEl.className = "lm-callout lm-callout-gold";
  noteEl.textContent = "El \"pago adicional\" de cada deuda es la suma de los pagos de las deudas anteriores en la fila, una vez las vayas saldando en orden. Si quieres saber cuánto tiempo e intereses te vas a ahorrar en detalle, consulta a tu asesor financiero de confianza.";
  contentEl.appendChild(noteEl);

  lmSaveSection("reduccion-deudas", { rows: rows });

  var bodyLines = ["Mi plan de reducción de deudas — Logic Money Manual Digital", ""];
  rows.forEach(function (r, i) {
    bodyLines.push((i + 1) + ". " + r.name + ": pago " + lmMoney(r.payment) + (r.pagoAdicional > 0 ? " + " + lmMoney(r.pagoAdicional) + " adicional" : "") + " = " + lmMoney(r.nuevoPago) + " nuevo pago");
  });

  lmRenderSectionFooter({
    containerEl: document.getElementById("footer-slot"),
    mailtoSubject: "Mi plan de reducción de deudas — Logic Money",
    mailtoBody: bodyLines.join("\n"),
    nextSectionHref: "../fondo-emergencia/index.html",
  });
}

function escapeRedHtml(s) {
  var div = document.createElement("div");
  div.textContent = s;
  return div.innerHTML;
}
