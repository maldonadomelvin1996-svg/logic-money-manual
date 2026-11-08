/* Logic Money — Manual Digital — Áreas a mejorar
   Junta las banderas rojas (y algunas doradas, menos urgentes) de los 3
   dashboards en una sola lista — mismos criterios que ya usa cada
   dashboard, solo que aquí se consolidan en vez de estar repartidos.
   Lee únicamente datos ya guardados, no pide nada nuevo. */

var contentEl = document.getElementById("content");

function scoreBand(score) {
  if (score >= 750) return { label: "Excelente", color: "var(--blue)", soft: "var(--blue-soft)" };
  if (score >= 670) return { label: "Bueno", color: "var(--teal)", soft: "var(--teal-soft)" };
  if (score >= 580) return { label: "Regular", color: "var(--gold)", soft: "var(--gold-soft)" };
  return { label: "Necesita mejorar", color: "var(--warn)", soft: "var(--warn-soft)" };
}
var BAND_COLORS = { "Ideal": "var(--blue)", "Estable": "var(--teal)", "Riesgoso": "var(--gold)", "Crítico": "#FF9A4D", "Embrollao": "var(--warn)" };
var BAND_SOFT = { "Ideal": "var(--blue-soft)", "Estable": "var(--teal-soft)", "Riesgoso": "var(--gold-soft)", "Crítico": "rgba(255,154,77,0.14)", "Embrollao": "var(--warn-soft)" };

var HAS_ANY = ["ingresos", "presupuesto", "patrimonio", "fondo-emergencia", "credito", "nivel-deuda", "seguros", "proteccion", "retiro-nif"]
  .some(function (k) { return lmHasSection(k); });

if (!HAS_ANY) {
  lmRenderDataGuard(contentEl, "Esta lista se arma sola con lo que ya llenaste en el manual. Completa al menos una categoría (Presupuesto, Estabilidad o Crecimiento) para verla aquí.");
} else {
  var items = [];

  function addItem(icon, title, detail, color, soft, href) {
    items.push({ icon: icon, title: title, detail: detail, color: color, soft: soft, href: href });
  }

  // ---- Presupuesto: déficit mensual ----
  if (lmHasSection("presupuesto")) {
    var ingreso = lmGetIncomeTotal();
    var ahorrosPpto = lmGetPresupuestoAhorrosTotal();
    var gastosPpto = Math.max(0, lmGetPresupuestoTotalGastos() - ahorrosPpto);
    var deudasPpto = lmGetDebtsTotalPayment();
    var superavit = ingreso - ahorrosPpto - gastosPpto - deudasPpto;
    if (ingreso > 0 && superavit < 0) {
      addItem("presupuesto", "Tienes un déficit mensual", "Gastas " + lmMoney(Math.abs(superavit)) + " más de lo que entra cada mes.", "var(--warn)", "var(--warn-soft)", "../dashboard-presupuesto/index.html");
    }
  }

  // ---- Patrimonio neto negativo ----
  var patrimonioSaved = lmGetSection("patrimonio");
  if (patrimonioSaved) {
    var activos = patrimonioSaved.activos || 0;
    var pasivos = patrimonioSaved.pasivos || 0;
    var patrimonio = activos - pasivos;
    if (patrimonio < 0) {
      addItem("patrimonio", "Tu patrimonio neto es negativo", "Debes " + lmMoney(Math.abs(patrimonio)) + " más de lo que tienes.", "var(--warn)", "var(--warn-soft)", "../dashboard-presupuesto/index.html");
    }
  }

  // ---- Fondo de emergencia incompleto ----
  var fondo = lmGetSection("fondo-emergencia");
  if (fondo) {
    var objetivoFondo = fondo.objetivoGastos || fondo.objetivoIngreso || 0;
    var faltaFondo = Math.max(0, objetivoFondo - fondo.tienes);
    var fondoListo = faltaFondo <= 0 && objetivoFondo > 0;
    if (!fondoListo) {
      addItem("fondo-emergencia", "Tu fondo de emergencia está incompleto", "Te faltan " + lmMoney(faltaFondo) + " para completarlo.", "var(--warn)", "var(--warn-soft)", "../dashboard-estabilidad/index.html");
    }
  }

  // ---- Crédito ----
  var credito = lmGetSection("credito");
  if (credito) {
    if (credito.score) {
      var creditoBand = scoreBand(credito.score);
      if (creditoBand.label === "Regular" || creditoBand.label === "Necesita mejorar") {
        addItem("credito", "Tu puntaje de crédito tiene espacio para mejorar", "Puntaje actual: " + credito.score + " (" + creditoBand.label + ").", creditoBand.color, creditoBand.soft, "../dashboard-estabilidad/index.html");
      }
    } else {
      addItem("credito", "Aún no tienes historial crediticio", "Construir crédito abre mejores oportunidades a futuro.", "var(--gold)", "var(--gold-soft)", "../credito/index.html");
    }
  }

  // ---- Nivel de deuda alto ----
  var nivelDeuda = lmGetSection("nivel-deuda");
  if (nivelDeuda && nivelDeuda.pct > 35) {
    var nivelColor = BAND_COLORS[nivelDeuda.band] || "var(--warn)";
    var nivelSoft = BAND_SOFT[nivelDeuda.band] || "var(--warn-soft)";
    addItem("nivel-deuda", "Tu nivel de deuda está alto", nivelDeuda.pct + "% de tu ingreso va a deudas (" + nivelDeuda.band + ").", nivelColor, nivelSoft, "../dashboard-estabilidad/index.html");
  }

  // ---- Seguros faltantes ----
  var seguros = lmGetSection("seguros");
  if (seguros && seguros.insurance) {
    var byType = {};
    seguros.insurance.forEach(function (i) { byType[i.type] = i; });
    [["Médico", "No tienes seguro médico"], ["Vehículo", "No tienes seguro de vehículo"], ["Vida", "No tienes seguro de vida"]].forEach(function (pair) {
      var ins = byType[pair[0]];
      if (!ins || !ins.has) {
        addItem("seguros", pair[1], "Considera cotizar uno — te protege a ti y a quienes dependen de ti.", "var(--warn)", "var(--warn-soft)", "../dashboard-estabilidad/index.html");
      }
    });
  }

  // ---- Protección: cobertura de vida insuficiente ----
  var proteccion = lmGetSection("proteccion");
  if (proteccion && proteccion.needsLife) {
    var responsabilidades = (proteccion.deudas || 0) + (proteccion.funeral || 0) + (proteccion.reemplazo || 0);
    var recomendada = Math.max(0, responsabilidades - (proteccion.ahorros || 0));
    var actualCobertura = proteccion.coberturaActual || 0;
    var superavitSeguro = actualCobertura - recomendada;
    if (superavitSeguro < 0) {
      addItem("proteccion", "Te falta cobertura de seguro de vida", "Te faltan " + lmMoney(Math.abs(superavitSeguro)) + " en cobertura recomendada.", "var(--warn)", "var(--warn-soft)", "../dashboard-estabilidad/index.html");
    }
  }

  // ---- Retiro: falta para el número de independencia financiera ----
  var retiroNif = lmGetSection("retiro-nif");
  if (retiroNif) {
    var yaTienes = lmGetSavingsByPurpose("retiro|jubilaci");
    var teFalta = Math.max(0, retiroNif.nif - yaTienes);
    if (teFalta > 0) {
      addItem("retiro", "Aún te falta para tu número de independencia financiera", "Te faltan " + lmMoney(teFalta) + " para alcanzar tu meta de retiro.", "var(--gold)", "var(--gold-soft)", "../dashboard-crecimiento/index.html");
    }
  }

  // Lo más urgente (rojo) primero, lo informativo (dorado) al final.
  items.sort(function (a, b) {
    var aUrgent = a.color === "var(--warn)" || a.color === "#FF9A4D" ? 0 : 1;
    var bUrgent = b.color === "var(--warn)" || b.color === "#FF9A4D" ? 0 : 1;
    return aUrgent - bUrgent;
  });

  var html = "";
  if (items.length === 0) {
    html += '<div class="lm-callout lm-callout-good">&#10003; No encontramos áreas urgentes qué mejorar en lo que has llenado hasta ahora. ¡Sigue así!</div>';
  } else {
    html += '<div class="lm-hint" style="margin-bottom:16px">' + items.length + (items.length === 1 ? " área encontrada — toca para ver el detalle en su dashboard." : " áreas encontradas — toca cualquiera para ver el detalle en su dashboard.") + '</div>';
    items.forEach(function (item) {
      html += '<a class="lm-card lm-card-tint" style="--tint:' + item.color + ';--tint-soft:' + item.soft + ';display:block;text-decoration:none" href="' + item.href + '">' +
        '<div style="display:flex;align-items:center;gap:14px">' +
          '<img src="../../assets/icons/categories/' + item.icon + '.png" alt="" style="width:48px;height:48px;object-fit:contain;flex-shrink:0">' +
          '<div style="flex:1;min-width:0">' +
            '<div style="font-weight:700;font-size:16px">' + item.title + '</div>' +
            '<div style="color:var(--text-mid);font-size:13px;margin-top:3px;line-height:1.4">' + item.detail + '</div>' +
          '</div>' +
          '<span class="lm-chevron">&#8250;</span>' +
        '</div></a>';
    });
  }
  contentEl.innerHTML = html;

  var bodyLines = ["Áreas a mejorar — Logic Money Manual Digital", ""];
  if (items.length === 0) {
    bodyLines.push("No se encontraron áreas urgentes.");
  } else {
    items.forEach(function (item) { bodyLines.push("- " + item.title + ": " + item.detail); });
  }

  lmRenderSectionFooter({
    containerEl: contentEl,
    mailtoSubject: "Mis áreas a mejorar — Logic Money",
    mailtoBody: bodyLines.join("\n"),
    nextSectionHref: null,
    prevSectionHref: "../dashboards/index.html",
  });
}
