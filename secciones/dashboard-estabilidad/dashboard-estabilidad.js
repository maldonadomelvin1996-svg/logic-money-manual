/* Logic Money — Manual Digital — Dashboard: Estabilidad
   Cierre del plan enfocado "Estabilidad": Fondo de emergencia, Crédito,
   Nivel de deuda y Seguros, ya llenados en ese recorrido.

   Envuelto en una función para que el hub de dashboards (ver
   secciones/dashboards/) también pueda llamarla — ver la misma nota en
   dashboard-presupuesto.js. */

function monthLabel(months) {
  var d = new Date();
  d.setMonth(d.getMonth() + months);
  var s = d.toLocaleDateString("es-ES", { month: "long", year: "numeric" });
  return s.charAt(0).toUpperCase() + s.slice(1);
}
function escapeDashHtml(s) {
  var div = document.createElement("div");
  div.textContent = s;
  return div.innerHTML;
}

function scoreBand(score) {
  if (score >= 750) return { label: "Excelente", color: "var(--blue)", soft: "var(--blue-soft)" };
  if (score >= 670) return { label: "Bueno", color: "var(--teal)", soft: "var(--teal-soft)" };
  if (score >= 580) return { label: "Regular", color: "var(--gold)", soft: "var(--gold-soft)" };
  return { label: "Necesita mejorar", color: "var(--warn)", soft: "var(--warn-soft)" };
}
/* El azul es mejor que el verde en esta escala — "Ideal" (0% de deuda)
   es el único nivel que lo usa, igual que "Excelente" en scoreBand(). */
var BAND_COLORS = { "Ideal": "var(--blue)", "Estable": "var(--teal)", "Riesgoso": "var(--gold)", "Crítico": "#FF9A4D", "Embrollao": "var(--warn)" };
var BAND_SOFT = { "Ideal": "var(--blue-soft)", "Estable": "var(--teal-soft)", "Riesgoso": "var(--gold-soft)", "Crítico": "rgba(255,154,77,0.14)", "Embrollao": "var(--warn-soft)" };

function lmRenderDashboardEstabilidad(contentEl, opts) {
  opts = opts || {};
  if (!lmHasSection("fondo-emergencia") && !lmHasSection("credito") && !lmHasSection("nivel-deuda") && !lmHasSection("seguros")) {
    lmRenderDataGuard(contentEl, "Este dashboard se arma solo con tu información de Fondo de emergencia, Crédito, Nivel de deuda y Seguros. Completa primero esas secciones para verlo aquí.");
    return;
  }

  var html = "";

  // ---- Fondo de emergencia ----
  var fondo = lmGetSection("fondo-emergencia");
  if (fondo) {
    var coberturaMeses = fondo.gastosNecesarios > 0 ? (fondo.tienes / fondo.gastosNecesarios) : 0;
    var objetivo = fondo.objetivoGastos || fondo.objetivoIngreso || 0;
    var pct = objetivo > 0 ? Math.min(100, Math.round((fondo.tienes / objetivo) * 100)) : 0;
    var falta = Math.max(0, objetivo - fondo.tienes);
    var done = falta <= 0 && objetivo > 0;
    html += '<div class="lm-card ' + (done ? "lm-card-good" : "lm-card-attn") + '">';
    html += '<h3 class="lm-h3">Fondo de emergencia</h3>';
    html += '<div class="lm-tile-row">' +
      '<div class="lm-tile"><div class="lm-tile-label">Cobertura actual</div><div class="lm-tile-value">' + coberturaMeses.toFixed(1) + ' meses</div></div>' +
      '<div class="lm-tile"><div class="lm-tile-label">Meta</div><div class="lm-tile-value">' + fondo.months + ' meses</div></div>' +
      '</div>';
    html += '<div class="lm-mini-bar-track"><div class="lm-mini-bar-fill" style="width:' + Math.max(pct, 2) + '%;background:' + (done ? "var(--good)" : "var(--gold)") + '"></div></div>';
    html += '<div class="lm-mini-bar-scale"><span>' + lmMoney(fondo.tienes) + ' ahorrados</span><span>Objetivo: ' + lmMoney(objetivo) + '</span></div>';
    if (!done) html += '<div class="lm-status-pill" style="display:block;text-align:center;background:var(--warn-soft);color:var(--warn);margin-top:10px">Aún te falta ' + lmMoney(falta) + '</div>';
    html += '</div>';
  }

  // ---- Reducción de deudas (efecto bola de nieve) ----
  var reduccion = lmGetSection("reduccion-deudas");
  if (reduccion && reduccion.rows && reduccion.rows.length) {
    html += '<div class="lm-card">';
    html += '<h3 class="lm-h3">Reducción de deudas &mdash; efecto bola de nieve</h3>';
    html += '<div class="lm-card-flat" style="margin-bottom:' + (reduccion.months !== null ? "14px" : "0") + '">';
    reduccion.rows.forEach(function (r, i) {
      var sePagaLabel = r.paidOffMonth === null ? "No se saldaría así" : monthLabel(r.paidOffMonth);
      html += '<div style="padding:8px 0;' + (i < reduccion.rows.length - 1 ? "border-bottom:1px solid var(--border);" : "") + '">' +
        '<div style="display:flex;justify-content:space-between;align-items:baseline">' +
          '<span>' + (i + 1) + '. ' + escapeDashHtml(r.name) + (r.isHome ? ' <span class="lm-badge lm-badge-muted">casa</span>' : '') + '</span>' +
          '<span class="lm-dash-row-sub">Se salda: ' + sePagaLabel + '</span>' +
        '</div>' +
        '<div style="display:flex;justify-content:space-between;align-items:baseline;color:var(--text-mid);font-size:13px;margin-top:4px">' +
          (r.extra > 0
            ? '<span>Pago: ' + lmMoney(r.payment) + ' + ' + lmMoney(r.extra) + ' adicional</span>'
            : '<span>Pago: ' + lmMoney(r.payment) + ' (sin cambio hasta que se salde la anterior)</span>') +
        '</div>' +
      '</div>';
    });
    html += '</div>';
    if (reduccion.months !== null) {
      html += '<div class="lm-callout lm-callout-good" style="margin-bottom:0">Pagando en este orden, quedarías libre de estas deudas en <strong>' + monthLabel(reduccion.months) + '</strong> (' + reduccion.months + ' meses).</div>';
    }
    html += '</div>';
  }

  // ---- Crédito ----
  var credito = lmGetSection("credito");
  if (credito) {
    if (credito.score) {
      var band = scoreBand(credito.score);
      var scoreMarkerPct = Math.max(2, Math.min(98, ((credito.score - 300) / (850 - 300)) * 100));
      html += '<div class="lm-card lm-card-tint" style="--tint:' + band.color + ';--tint-soft:' + band.soft + '">';
      html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px"><h3 class="lm-h3" style="margin-bottom:0">Crédito</h3>';
      html += '<span class="lm-badge" style="background:' + band.soft + ';color:' + band.color + '">' + band.label + '</span></div>';
      html += '<div class="lm-hero" style="padding-top:0"><div class="lm-hero-value" style="color:' + band.color + ';font-size:40px">' + credito.score + '</div></div>';
      html += '<div class="lm-mini-bar-track" style="background:linear-gradient(to right, var(--warn), var(--gold), var(--teal), var(--blue))">' +
        '<div class="lm-mini-bar-marker" style="left:' + scoreMarkerPct + '%;background:' + band.color + '"></div>' +
        '</div>' +
        '<div class="lm-mini-bar-scale"><span>300</span><span>850</span></div>';
    } else {
      html += '<div class="lm-card">';
      html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px"><h3 class="lm-h3" style="margin-bottom:0">Crédito</h3>';
      html += '<span class="lm-badge lm-badge-muted">Sin historial</span></div>';
      html += '<div class="lm-callout lm-callout-neutral" style="margin-bottom:0">Sin historial crediticio todavía. Construir crédito abre mejores oportunidades.</div>';
    }
    html += '</div>';
  }

  // ---- Nivel de deuda ----
  var nivelDeuda = lmGetSection("nivel-deuda");
  if (nivelDeuda) {
    var bandColor = BAND_COLORS[nivelDeuda.band] || "var(--text)";
    var bandSoft = BAND_SOFT[nivelDeuda.band] || "var(--card3)";
    html += '<div class="lm-card lm-card-tint" style="--tint:' + bandColor + ';--tint-soft:' + bandSoft + '">';
    html += '<h3 class="lm-h3">Nivel de deuda</h3>';
    html += '<div class="lm-hero" style="padding-top:0">' +
      '<div class="lm-hero-value" style="color:' + bandColor + ';font-size:40px">' + nivelDeuda.pct + '%</div>' +
      '<span class="lm-status-pill" style="background:' + bandSoft + ';color:' + bandColor + '">' + nivelDeuda.band + '</span>' +
      '</div>';
    var nivelMarkerPct = Math.max(2, Math.min(98, nivelDeuda.pct));
    html += '<div class="lm-mini-bar-track" style="background:linear-gradient(to right, var(--blue), var(--blue) 15%, var(--teal) 15%, var(--teal) 35%, var(--gold) 35%, var(--gold) 43%, #FF9A4D 43%, #FF9A4D 55%, var(--warn) 55%, var(--warn) 100%)">' +
      '<div class="lm-mini-bar-marker" style="left:' + nivelMarkerPct + '%;background:' + bandColor + '"></div>' +
      '</div>' +
      '<div class="lm-mini-bar-scale"><span>0%</span><span>56%+</span></div>';
    html += '<div class="lm-dash-row-sub" style="text-align:center;margin-top:4px">' + lmMoney(nivelDeuda.payments) + ' de ' + lmMoney(nivelDeuda.income) + ' en deudas</div>';
    if (nivelDeuda.pct <= 35) html += '<div class="lm-callout lm-callout-good" style="margin-top:12px;margin-bottom:0">&#10003; Tus deudas están bajo control.</div>';
    html += '</div>';
  }

  // ---- Seguros ----
  var seguros = lmGetSection("seguros");
  if (seguros && seguros.insurance) {
    var byType = {};
    seguros.insurance.forEach(function (i) { byType[i.type] = i; });
    var medico = byType["Médico"], vehiculo = byType["Vehículo"], vida = byType["Vida"];
    html += '<div class="lm-card">';
    html += '<h3 class="lm-h3">Seguros</h3>';
    html += '<div class="lm-card-flat" style="margin-bottom:14px">';
    [["Seguro médico", medico], ["Seguro de vehículo", vehiculo], ["Seguro de vida", vida]].forEach(function (pair) {
      var label = pair[0], ins = pair[1];
      html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border)">' +
        '<span>' + label + '</span>' +
        (ins && ins.has ? '<span class="lm-badge lm-badge-good">&#10003; Cubierto</span>' : '<span class="lm-badge lm-badge-warn">No tiene</span>') +
        '</div>';
    });
    html += '</div>';

    var proteccion = lmGetSection("proteccion");
    if (proteccion && proteccion.needsLife) {
      var responsabilidades = (proteccion.deudas || 0) + (proteccion.funeral || 0) + (proteccion.reemplazo || 0);
      var recomendada = Math.max(0, responsabilidades - (proteccion.ahorros || 0));
      var actual = proteccion.coberturaActual || 0;
      var superavitSeguro = actual - recomendada;
      html += '<div class="lm-tile-row">' +
        '<div class="lm-tile"><div class="lm-tile-label">Cobertura actual</div><div class="lm-tile-value" style="font-size:16px">' + lmMoney(actual) + '</div></div>' +
        '<div class="lm-tile"><div class="lm-tile-label">Recomendada</div><div class="lm-tile-value" style="font-size:16px">' + lmMoney(recomendada) + '</div></div>' +
        '</div>';
      html += '<div class="lm-dash-row-sub" style="text-align:center;font-size:13px;color:' + (superavitSeguro >= 0 ? "var(--good)" : "var(--warn)") + ';font-weight:700">' +
        (superavitSeguro >= 0 ? "Superávit: " : "Te falta: ") + lmMoney(Math.abs(superavitSeguro)) + '</div>';
    } else if (proteccion && proteccion.needsLife === false) {
      html += '<div class="lm-callout lm-callout-neutral" style="margin-bottom:0">Nadie depende financieramente de ti por ahora — no se calculó cobertura de vida recomendada.</div>';
    } else {
      html += '<div class="lm-callout lm-callout-neutral" style="margin-bottom:0">Completa <a href="../proteccion/index.html" style="color:inherit">Análisis de protección</a> para ver cuánta cobertura de vida necesitas.</div>';
    }
    html += '</div>';
  }

  contentEl.innerHTML = html;

  var bodyLines = ["Mi dashboard de estabilidad — Logic Money Manual Digital", ""];
  if (fondo) bodyLines.push("Fondo de emergencia: " + lmMoney(fondo.tienes) + " de " + lmMoney(fondo.objetivoGastos || 0));
  if (reduccion && reduccion.months !== null) bodyLines.push("Libre de deudas en: " + monthLabel(reduccion.months) + " (" + reduccion.months + " meses)");
  if (credito) bodyLines.push("Crédito: " + (credito.score || "sin historial"));
  if (nivelDeuda) bodyLines.push("Nivel de deuda: " + nivelDeuda.pct + "% (" + nivelDeuda.band + ")");

  if (opts.showFooter === false) return;

  lmRenderSectionFooter({
    containerEl: contentEl,
    mailtoSubject: "Mi dashboard de estabilidad — Logic Money",
    mailtoBody: bodyLines.join("\n"),
    nextSectionHref: null,
    prevSectionHref: "../proteccion/index.html",
  });
}

if (!window.LM_DASHBOARD_HUB) {
  lmRenderDashboardEstabilidad(document.getElementById("content"));
}
