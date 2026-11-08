/* Logic Money — Manual Digital — Reducción de deudas (págs. 351-352)
   100% automática: lee la lista de deudas ya guardada en la sección
   Deudas y simula el efecto bola de nieve mes a mes (igual que el modo
   presentación del software de asesor, simplificado): cada deuda paga lo
   que ya paga hoy, y solo cuando una deuda anterior en el orden queda en
   $0, su pago se suma al de la siguiente. La primera deuda del orden no
   recibe pago adicional de nadie — sigue pagando lo mismo hasta saldarse. */

lmRenderSectionDemoButton(document.getElementById("demo-btn-slot"), "deudas");

var contentEl = document.getElementById("content");
var debts = lmGetDebts();

var MAX_MONTHS = 600;

function monthLabel(months) {
  var d = new Date();
  d.setMonth(d.getMonth() + months);
  var s = d.toLocaleDateString("es-ES", { month: "long", year: "numeric" });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function simulateSnowball(ordered) {
  var live = ordered.map(function (d) {
    return { name: d.name, isHome: d.isHome, balance: d.balance, payment: d.payment, apr: d.apr, remaining: d.balance, paidOffMonth: null, extra: 0 };
  });
  if (live.length === 0) return { months: 0, debts: [] };

  var pool = 0, month = 0;
  while (live.some(function (d) { return d.remaining > 0.005; }) && month < MAX_MONTHS) {
    month++;
    live.forEach(function (d) {
      if (d.remaining > 0.005) d.remaining += (d.remaining * d.apr) / 1200;
    });
    live.forEach(function (d) {
      if (d.remaining > 0.005) d.remaining -= Math.min(d.payment, d.remaining);
    });
    var target = live.filter(function (d) { return d.remaining > 0.005; })[0];
    if (target && pool > 0) target.remaining -= Math.min(pool, target.remaining);
    live.forEach(function (d, i) {
      if (d.remaining <= 0.005 && d.paidOffMonth === null) {
        d.paidOffMonth = month;
        pool += d.payment;
        var next = live[i + 1];
        if (next && next.extra === 0) next.extra = pool;
      }
    });
  }
  return { months: month, debts: live };
}

function escapeRedHtml(s) {
  var div = document.createElement("div");
  div.textContent = s;
  return div.innerHTML;
}

if (debts.length === 0) {
  lmRenderDataGuard(contentEl, "Esto se arma solo con tu información de Deudas. Completa primero la sección de Tomar datos para ver tu plan aquí.");
} else if (debts.length === 1) {
  contentEl.innerHTML = '<div class="lm-callout lm-callout-neutral">Como solo tienes una deuda, la forma de reducirla es aportar dinero adicional de tu sobrante mensual directamente a ella.</div>';
} else {
  var ordered = lmOrderDebts(debts);
  var sim = simulateSnowball(ordered);
  var rows = sim.debts;
  var anyStalled = rows.some(function (d) { return d.paidOffMonth === null; });

  var card = document.createElement("div");
  card.className = "lm-card";
  var html = '<div class="lm-card-flat">';
  rows.forEach(function (r, i) {
    var totalPago = r.payment + r.extra;
    var sePagaLabel = r.paidOffMonth === null ? "No se saldaría así" : monthLabel(r.paidOffMonth);
    html += '<div style="padding:12px 0' + (i < rows.length - 1 ? ";border-bottom:1px solid var(--border)" : "") + '">' +
      '<div style="display:flex;justify-content:space-between;gap:10px;font-weight:600">' +
        '<span>' + (i + 1) + '. ' + escapeRedHtml(r.name) + (r.isHome ? ' <span class="lm-badge lm-badge-muted">casa</span>' : '') + '</span>' +
        '<span>' + lmMoney(r.balance) + '</span>' +
      '</div>' +
      '<div style="display:flex;justify-content:space-between;align-items:baseline;color:var(--text-mid);font-size:13px;margin-top:4px">' +
        (i === 0
          ? '<span>Pago: ' + lmMoney(r.payment) + ' (tu pago mínimo actual)</span>'
          : r.extra > 0
            ? '<span>Pago: ' + lmMoney(r.payment) + ' + ' + lmMoney(r.extra) + ' adicional</span>'
            : '<span>Pago: ' + lmMoney(r.payment) + ' (sin cambio hasta que se salde la anterior)</span>') +
        (r.extra > 0 ? '<span style="color:var(--good);font-weight:700">' + lmMoney(totalPago) + ' nuevo pago</span>' : '') +
      '</div>' +
      '<div style="margin-top:6px;font-size:12.5px;color:var(--gold);font-weight:600">Se salda: ' + sePagaLabel + '</div>' +
      '</div>';
  });
  html += '</div>';
  card.innerHTML = html;
  contentEl.appendChild(card);

  if (anyStalled) {
    var warnEl = document.createElement("div");
    warnEl.className = "lm-callout lm-callout-warn";
    warnEl.textContent = "Una o más deudas no se saldarían nunca con el pago actual (el pago no alcanza a cubrir el interés). Esa deuda necesita un pago más alto, no solo el efecto bola de nieve.";
    contentEl.appendChild(warnEl);
  } else {
    var lastMonth = Math.max.apply(Math, rows.map(function (d) { return d.paidOffMonth || 0; }));
    var noteEl = document.createElement("div");
    noteEl.className = "lm-callout lm-callout-gold";
    noteEl.innerHTML = 'Pagando en este orden, quedarías <strong>libre de estas deudas en ' + monthLabel(lastMonth) + '</strong> (' + lastMonth + ' meses). Cada deuda sigue pagando lo mismo de siempre — solo cuando una se salda, su pago se suma completo a la siguiente.';
    contentEl.appendChild(noteEl);
  }

  lmSaveSection("reduccion-deudas", {
    rows: rows.map(function (r) { return { name: r.name, payment: r.payment, extra: r.extra, paidOffMonth: r.paidOffMonth, isHome: r.isHome }; }),
    months: anyStalled ? null : Math.max.apply(Math, rows.map(function (d) { return d.paidOffMonth || 0; })),
  });

  var bodyLines = ["Mi plan de reducción de deudas — Logic Money Manual Digital", ""];
  rows.forEach(function (r, i) {
    var totalPago = r.payment + r.extra;
    bodyLines.push((i + 1) + ". " + r.name + ": pago " + lmMoney(r.payment) + (r.extra > 0 ? " + " + lmMoney(r.extra) + " adicional = " + lmMoney(totalPago) : "") + " — se salda: " + (r.paidOffMonth === null ? "no se saldaría así" : monthLabel(r.paidOffMonth)));
  });

  lmRenderSectionFooter({
    containerEl: document.getElementById("footer-slot"),
    mailtoSubject: "Mi plan de reducción de deudas — Logic Money",
    mailtoBody: bodyLines.join("\n"),
    nextSectionHref: "../fondo-emergencia/index.html",
    prevSectionHref: "../patrimonio/index.html",
  });
}
