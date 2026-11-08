/* Logic Money — Manual Digital — Descargar mi resumen
   Junta lo ya guardado de las 3 categorías (lo que el lector haya
   completado) más la lista de Áreas a mejorar en una sola vista pensada
   para imprimir/guardar como PDF (window.print(), igual que el botón
   "Guardar como PDF" que ya existe en cada sección — ver
   lmRenderSectionFooter en section-ui.js). El nombre es opcional y nunca
   se guarda: vive solo en el campo de texto mientras esta pantalla está
   abierta. */

var DISCLAIMER_HTML = "Este resumen es una guía general basada en lo que llenaste — te da una idea clara de dónde estás, pero no sustituye el análisis de un profesional licenciado. Para un plan específico sobre cómo atender estas áreas, comunícate con tu asesor de confianza, o con <strong>Melvin Joel Maldonado Santos, CFEI&reg;</strong> &mdash; 787-345-9728.";

function sumRow(label, value, color) {
  return '<div style="display:flex;justify-content:space-between;gap:10px;padding:7px 0;border-bottom:1px solid var(--border)">' +
    '<span>' + label + '</span>' +
    '<span style="font-weight:700;text-align:right' + (color ? ';color:' + color : '') + '">' + value + '</span>' +
    '</div>';
}

var contentEl = document.getElementById("content");
var nombreInput = document.getElementById("nombre-input");

var HAS_ANY = ["ingresos", "presupuesto", "patrimonio", "fondo-emergencia", "credito", "nivel-deuda", "seguros", "proteccion", "retiro-cuando"]
  .some(function (k) { return lmHasSection(k); });

if (!HAS_ANY) {
  lmRenderDataGuard(contentEl, "Este resumen se arma solo con lo que ya llenaste en el manual. Completa al menos una categoría (Presupuesto, Estabilidad o Crecimiento) para descargarlo.");
} else {
  var html = "";

  html += '<div class="lm-callout lm-callout-gold" id="resumen-fecha-disclaimer">' + DISCLAIMER_HTML + '</div>';

  // ---- Presupuesto ----
  if (lmHasSection("ingresos") || lmHasSection("presupuesto") || lmHasSection("patrimonio")) {
    var ingreso = lmGetIncomeTotal();
    var ahorrosP = lmGetPresupuestoAhorrosTotal();
    var gastosP = Math.max(0, lmGetPresupuestoTotalGastos() - ahorrosP);
    var deudasP = lmGetDebtsTotalPayment();
    var superavitP = ingreso - ahorrosP - gastosP - deudasP;
    var deficitP = superavitP < 0;

    html += '<h3 class="lm-h3" style="margin-top:20px">Presupuesto</h3>';
    html += '<div class="lm-card-flat">';
    html += sumRow("Ingresos", lmMoney(ingreso));
    html += sumRow("Ahorros", lmMoney(ahorrosP));
    html += sumRow("Gastos", lmMoney(gastosP));
    html += sumRow("Deudas", lmMoney(deudasP));
    html += sumRow(deficitP ? "Déficit mensual" : "Superávit mensual", (deficitP ? "-" : "+") + lmMoney(Math.abs(superavitP)), deficitP ? "var(--warn)" : "var(--good)");

    var patrimonioSec = lmGetSection("patrimonio");
    if (patrimonioSec) {
      var netoP = (patrimonioSec.activos || 0) - (patrimonioSec.pasivos || 0);
      html += sumRow("Patrimonio neto", (netoP >= 0 ? "+" : "") + lmMoney(netoP), netoP >= 0 ? "var(--good)" : "var(--warn)");
    }
    html += '</div>';
  }

  // ---- Estabilidad ----
  if (lmHasSection("fondo-emergencia") || lmHasSection("credito") || lmHasSection("nivel-deuda") || lmHasSection("seguros")) {
    html += '<h3 class="lm-h3" style="margin-top:20px">Estabilidad</h3>';
    html += '<div class="lm-card-flat">';

    var fondoR = lmGetSection("fondo-emergencia");
    if (fondoR) {
      var objetivoR = fondoR.objetivoGastos || fondoR.objetivoIngreso || 0;
      html += sumRow("Fondo de emergencia", lmMoney(fondoR.tienes) + " de " + lmMoney(objetivoR));
    }

    var creditoR = lmGetSection("credito");
    if (creditoR) {
      if (creditoR.score) {
        var bandR = scoreBand(creditoR.score);
        html += sumRow("Crédito", creditoR.score + " (" + bandR.label + ")", bandR.color);
      } else {
        html += sumRow("Crédito", "Sin historial");
      }
    }

    var nivelR = lmGetSection("nivel-deuda");
    if (nivelR) {
      var nivelColorR = BAND_COLORS[nivelR.band] || "var(--text)";
      html += sumRow("Nivel de deuda", nivelR.pct + "% (" + nivelR.band + ")", nivelColorR);
    }

    var segurosR = lmGetSection("seguros");
    if (segurosR && segurosR.insurance) {
      var byTypeR = {};
      segurosR.insurance.forEach(function (i) { byTypeR[i.type] = i; });
      var cubiertos = ["Médico", "Vehículo", "Vida"].filter(function (t) { return byTypeR[t] && byTypeR[t].has; });
      html += sumRow("Seguros cubiertos", cubiertos.length ? cubiertos.join(", ") : "Ninguno todavía");
    }

    html += '</div>';
  }

  // ---- Crecimiento ----
  var retiroCuandoR = lmGetSection("retiro-cuando");
  if (retiroCuandoR) {
    html += '<h3 class="lm-h3" style="margin-top:20px">Crecimiento</h3>';
    html += '<div class="lm-card-flat">';
    html += sumRow("Años para el retiro", retiroCuandoR.anios);

    var retiroNifR = lmGetSection("retiro-nif");
    if (retiroNifR) {
      var yaTienesR = lmGetSavingsByPurpose("retiro|jubilaci");
      var avanceR = retiroNifR.nif > 0 ? Math.min(100, Math.round((yaTienesR / retiroNifR.nif) * 100)) : 0;
      html += sumRow("Número de independencia financiera", lmMoney(retiroNifR.nif));
      html += sumRow("Ya tienes", lmMoney(yaTienesR) + " (" + avanceR + "%)");
    }

    var retiroAportacionR = lmGetSection("retiro-aportacion");
    if (retiroAportacionR && retiroAportacionR.rates && retiroAportacionR.rates.length) {
      var retiroPerfilR = lmGetSection("retiro-perfil");
      var targetRateR = retiroPerfilR ? retiroPerfilR.rate : 6;
      var matchR = retiroAportacionR.rates.filter(function (r) { return r.rate === targetRateR; })[0] ||
        retiroAportacionR.rates.filter(function (r) { return r.rate === 6; })[0];
      if (matchR) {
        var actualAporteR = lmGetMonthlySavingsByPurpose("retiro|jubilaci");
        var onTrackR = actualAporteR >= matchR.mensual;
        html += sumRow("Aportación al retiro", lmMoney(actualAporteR) + "/mes (recomendado: " + lmMoney(matchR.mensual) + "/mes)", onTrackR ? "var(--good)" : "var(--warn)");
      }
    }
    html += '</div>';
  }

  // ---- Áreas a mejorar ----
  var mejoraItems = []
    .concat(lmGetPresupuestoMejoraItems())
    .concat(lmGetEstabilidadMejoraItems())
    .concat(lmGetCrecimientoMejoraItems());

  html += '<h3 class="lm-h3" style="margin-top:24px">Áreas a mejorar</h3>';
  if (mejoraItems.length === 0) {
    html += '<div class="lm-callout lm-callout-good">&#10003; No se encontraron áreas urgentes qué mejorar en lo que has llenado hasta ahora.</div>';
  } else {
    html += lmRenderMejoraList(mejoraItems, "");
  }

  contentEl.innerHTML = html;
}

var fechaHoy = new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
function updateTitle() {
  var nombre = nombreInput.value.trim();
  var wrap = document.getElementById("resumen-titulo");
  if (!wrap) {
    wrap = document.createElement("div");
    wrap.id = "resumen-titulo";
    contentEl.parentNode.insertBefore(wrap, contentEl);
  }
  wrap.innerHTML =
    '<div style="font-family:\'Helvetica Neue\',Helvetica,Arial,sans-serif;font-size:26px;font-weight:700;margin-bottom:4px">' +
      (nombre ? "Resumen financiero de " + nombre : "Mi resumen financiero") +
    '</div>' +
    '<div style="color:var(--text-faint);font-size:13px;margin-bottom:16px">' + fechaHoy + '</div>';
}
if (HAS_ANY) {
  updateTitle();
  nombreInput.addEventListener("input", updateTitle);
}

document.getElementById("print-btn").addEventListener("click", function () { window.print(); });
