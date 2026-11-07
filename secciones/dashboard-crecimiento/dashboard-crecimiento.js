/* Logic Money — Manual Digital — Dashboard: Crecimiento
   Cierre del plan enfocado "Crecimiento": los 6 pasos de Retiro, ya
   llenados en ese recorrido, en una sola vista. */

var contentEl = document.getElementById("content");

function monthlyPMT(fv, ratePct, years) {
  var n = years * 12;
  if (n <= 0 || fv <= 0) return 0;
  if (ratePct === 0) return fv / n;
  var i = (ratePct / 100) / 12;
  return fv * i / (Math.pow(1 + i, n) - 1);
}

var retiroCuando = lmGetSection("retiro-cuando");

if (!retiroCuando) {
  lmRenderDataGuard(contentEl, "Este dashboard se arma solo con tu información de Retiro. Completa primero esos pasos para verlo aquí.");
} else {
  var retiroCuanto = lmGetSection("retiro-cuanto");
  var retiroSilla = lmGetSection("retiro-silla");
  var retiroNif = lmGetSection("retiro-nif");

  var html = "";

  // ---- Horizonte temporal ----
  html += '<div class="lm-card lm-card-good">';
  html += '<h3 class="lm-h3">Camino al retiro</h3>';
  html += '<div class="lm-tile-row">' +
    '<div class="lm-tile"><div class="lm-tile-label">Hoy</div><div class="lm-tile-value">' + retiroCuando.edadActual + '</div></div>' +
    '<div class="lm-tile-arrow">&#8594;</div>' +
    '<div class="lm-tile"><div class="lm-tile-label">Meta de retiro</div><div class="lm-tile-value">' + retiroCuando.edadRetiro + '</div></div>' +
    '</div>';
  html += '<div class="lm-hero" style="padding-top:0">' +
    '<div class="lm-hero-value" style="color:var(--gold);font-size:clamp(28px,7vw,40px)">' + retiroCuando.anios + ' años restantes</div>' +
    '</div>';

  if (retiroCuanto) {
    html += '<div class="lm-card-flat" style="margin-top:6px">';
    html += '<div style="display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid var(--border)"><span class="lm-dash-row-sub">Objetivo de ingreso mensual hoy</span><span class="lm-dash-row-value">' + lmMoney(retiroCuanto.ingreso) + '</span></div>';
    html += '<div style="display:flex;justify-content:space-between;padding:7px 0"><span class="lm-dash-row-sub">Ajustado por inflación (' + retiroCuando.anios + ' años)</span><span class="lm-dash-row-value" style="color:var(--gold)">' + lmMoney(retiroCuanto.resultado) + '</span></div>';
    html += '</div>';
  }
  if (retiroSilla) {
    html += '<div class="lm-card-flat" style="margin-top:8px">';
    html += '<div style="display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid var(--border)"><span class="lm-dash-row-sub">Seguro Social y otras fuentes</span><span class="lm-dash-row-value">' + lmMoney(retiroSilla.objetivo - retiroSilla.falta) + '/mes</span></div>';
    html += '<div style="display:flex;justify-content:space-between;padding:7px 0"><span class="lm-dash-row-sub">A reemplazar con inversiones</span><span class="lm-dash-row-value" style="color:var(--warn)">' + lmMoney(retiroSilla.falta) + '/mes</span></div>';
    html += '</div>';
  }
  html += '</div>';

  // ---- Meta total (NIF) ----
  if (retiroNif) {
    var yaTienes = lmGetSavingsByPurpose("retiro|jubilaci");
    var teFalta = Math.max(0, retiroNif.nif - yaTienes);
    var avancePct = retiroNif.nif > 0 ? Math.min(100, Math.round((yaTienes / retiroNif.nif) * 100)) : 0;

    html += '<div class="lm-card">';
    html += '<h3 class="lm-h3">Capital necesario (número de independencia financiera)</h3>';
    html += '<div class="lm-hero" style="padding-top:0"><div class="lm-hero-value" style="color:var(--good)">' + lmMoney(retiroNif.nif) + '</div></div>';
    html += '<div class="lm-mini-bar-track"><div class="lm-mini-bar-fill" style="width:' + Math.max(avancePct, 2) + '%;background:var(--good)"></div></div>';
    html += '<div class="lm-tile-row" style="margin-top:10px">' +
      '<div class="lm-tile"><div class="lm-tile-label">Ya tienes</div><div class="lm-tile-value" style="font-size:16px">' + lmMoney(yaTienes) + '</div></div>' +
      '<div class="lm-tile"><div class="lm-tile-label">Te falta</div><div class="lm-tile-value" style="font-size:16px;color:var(--warn)">' + lmMoney(teFalta) + '</div></div>' +
      '<div class="lm-tile"><div class="lm-tile-label">Avance</div><div class="lm-tile-value" style="font-size:16px">' + avancePct + '%</div></div>' +
      '</div>';

    var ageMinus5 = Math.max(retiroCuando.edadActual, retiroCuando.edadRetiro - 5);
    var agePlus5 = retiroCuando.edadRetiro + 5;
    var ages = [ageMinus5, retiroCuando.edadRetiro, agePlus5];
    var strategies = [
      { label: "Conservador", rate: 3, color: "var(--warn)" },
      { label: "Moderado", rate: 6, color: "var(--gold)" },
      { label: "Agresivo", rate: 10, color: "var(--good)" },
    ];
    html += '<h3 class="lm-h3" style="margin-top:18px">&#191;Cuánto invertir al mes?</h3>';
    html += '<div style="overflow-x:auto"><table class="lm-dash-table"><thead><tr><th>Estrategia</th>' +
      ages.map(function (a) { return '<th>' + a + ' años</th>'; }).join("") + '</tr></thead><tbody>';
    strategies.forEach(function (st) {
      html += '<tr><td style="color:' + st.color + '">' + st.label + ' (' + st.rate + '%)</td>' +
        ages.map(function (a) {
          var years = Math.max(0, a - retiroCuando.edadActual);
          return '<td style="color:' + st.color + '">' + lmMoney(monthlyPMT(retiroNif.nif, st.rate, years)) + '</td>';
        }).join("") + '</tr>';
    });
    html += '</tbody></table></div>';
    html += '<div class="lm-hint" style="margin-top:10px">Estimados basados en rendimientos históricos. Los resultados pueden variar según el mercado, comisiones e inflación.</div>';
    html += '</div>';
  }

  contentEl.innerHTML = html;

  var bodyLines = ["Mi dashboard de crecimiento — Logic Money Manual Digital", "",
    "Años para retiro: " + retiroCuando.anios];
  if (retiroNif) bodyLines.push("Número de independencia financiera: " + lmMoney(retiroNif.nif));

  lmRenderSectionFooter({
    containerEl: contentEl,
    mailtoSubject: "Mi dashboard de crecimiento — Logic Money",
    mailtoBody: bodyLines.join("\n"),
    nextSectionHref: null,
    prevSectionHref: "../retiro-perfil/index.html",
  });
}
