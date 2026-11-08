/* Logic Money — Manual Digital — Dashboard: Crecimiento
   Cierre del plan enfocado "Crecimiento": los 6 pasos de Retiro, ya
   llenados en ese recorrido, en una sola vista.

   Envuelto en una función para que el hub de dashboards (ver
   secciones/dashboards/) también pueda llamarla — ver la misma nota en
   dashboard-presupuesto.js. */

function monthlyPMT(fv, ratePct, years) {
  var n = years * 12;
  if (n <= 0 || fv <= 0) return 0;
  if (ratePct === 0) return fv / n;
  var i = (ratePct / 100) / 12;
  return fv * i / (Math.pow(1 + i, n) - 1);
}

/* Área a mejorar propia de Crecimiento: no es "te falta tanto para el
   retiro" (ese faltante es normal si quedan años por delante) — lo que
   importa es si la aportación mensual actual (lo que ya se está
   metiendo a Ahorros con propósito "retiro") alcanza la aportación
   recomendada para el perfil de riesgo del lector (o 6%/moderado si
   todavía no definió un perfil). Reutilizada también por
   secciones/areas-mejorar (las 3 categorías juntas). */
function lmGetCrecimientoMejoraItems() {
  var items = [];
  var retiroAportacionM = lmGetSection("retiro-aportacion");
  if (retiroAportacionM && retiroAportacionM.rates && retiroAportacionM.rates.length) {
    var retiroPerfilM = lmGetSection("retiro-perfil");
    var targetRateM = retiroPerfilM ? retiroPerfilM.rate : 6;
    var matchM = retiroAportacionM.rates.filter(function (r) { return r.rate === targetRateM; })[0] ||
      retiroAportacionM.rates.filter(function (r) { return r.rate === 6; })[0];
    if (matchM) {
      var requeridaM = matchM.mensual;
      var actualM = lmGetMonthlySavingsByPurpose("retiro|jubilaci");
      var faltaMensualM = requeridaM - actualM;
      if (faltaMensualM > 0) {
        items.push(lmMejoraItem("retiro", "Tu aportación al retiro está por debajo de lo recomendado",
          "Aportas " + lmMoney(actualM) + "/mes; se recomiendan " + lmMoney(requeridaM) + "/mes (" + matchM.rate + "% de crecimiento esperado).",
          "var(--warn)", "var(--warn-soft)", "../ahorros/index.html", "red"));
      }
    }
  }
  return items;
}

function lmRenderDashboardCrecimiento(contentEl, opts) {
  opts = opts || {};
  var retiroCuando = lmGetSection("retiro-cuando");
  if (!retiroCuando) {
    lmRenderDataGuard(contentEl, "Este dashboard se arma solo con tu información de Retiro. Completa primero esos pasos para verlo aquí.");
    return;
  }

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

  var mejoraItems = lmGetCrecimientoMejoraItems();
  if (mejoraItems.length) {
    html += '<h3 class="lm-h3" style="margin-top:4px">Áreas a mejorar de Crecimiento</h3>';
    html += lmRenderMejoraList(mejoraItems, "");
  }

  contentEl.innerHTML = html;

  var bodyLines = ["Mi dashboard de crecimiento — Logic Money Manual Digital", "",
    "Años para retiro: " + retiroCuando.anios];
  if (retiroNif) bodyLines.push("Número de independencia financiera: " + lmMoney(retiroNif.nif));

  if (opts.showFooter === false) return;

  lmRenderSectionFooter({
    containerEl: contentEl,
    mailtoSubject: "Mi dashboard de crecimiento — Logic Money",
    mailtoBody: bodyLines.join("\n"),
    nextSectionHref: null,
    prevSectionHref: "../retiro-perfil/index.html",
  });
}

if (!window.LM_DASHBOARD_HUB) {
  lmRenderDashboardCrecimiento(document.getElementById("content"));
}
