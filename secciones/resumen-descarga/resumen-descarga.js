/* Logic Money — Manual Digital — Descargar mi resumen
   Junta lo ya guardado en una vista pensada para imprimir/guardar como
   PDF (window.print(), igual que el botón "Guardar como PDF" que ya
   existe en cada sección — ver lmRenderSectionFooter en section-ui.js).
   El nombre es opcional y nunca se guarda: vive solo en el campo de
   texto mientras esta pantalla está abierta.

   Acotado automáticamente al plan enfocado activo (lmGetActiveFlow(),
   igual que el resto del sitio — ver LM_FLOWS en section-ui.js): si el
   lector llega aquí desde el dashboard de Presupuesto/Estabilidad/
   Crecimiento, el resumen es solo de esa categoría. Si llega desde el
   hub del manual completo (sin plan enfocado activo), junta las 3. Las
   tarjetas usan .lm-card (no .lm-card-flat) a propósito: con un plan
   enfocado activo, lmApplyFlowTheme ya le puso al <body> la misma clase
   de tema que usa el dashboard de esa categoría, así que estas tarjetas
   se ven exactamente igual — mismo tinte, mismo brillo. */

var DISCLAIMER_HTML = "Este resumen es una guía general basada en lo que llenaste — te da una idea clara de dónde estás, pero no sustituye el análisis de un profesional licenciado. Para un plan específico sobre cómo atender estas áreas, comunícate con tu asesor de confianza, o con <strong>Melvin Joel Maldonado Santos, CFEI&reg;</strong> &mdash; 787-345-9728.";

function sumRow(label, value, color) {
  return '<div style="display:flex;justify-content:space-between;gap:10px;padding:7px 0;border-bottom:1px solid var(--border)">' +
    '<span>' + label + '</span>' +
    '<span style="font-weight:700;text-align:right' + (color ? ';color:' + color : '') + '">' + value + '</span>' +
    '</div>';
}

function buildPresupuestoBlock() {
  if (!lmHasSection("ingresos") && !lmHasSection("presupuesto") && !lmHasSection("patrimonio")) return "";
  var ingreso = lmGetIncomeTotal();
  var ahorrosP = lmGetPresupuestoAhorrosTotal();
  var gastosP = Math.max(0, lmGetPresupuestoTotalGastos() - ahorrosP);
  var deudasP = lmGetDebtsTotalPayment();
  var superavitP = ingreso - ahorrosP - gastosP - deudasP;
  var deficitP = superavitP < 0;

  var html = '<h3 class="lm-h3" style="margin-top:20px">Presupuesto</h3>';
  html += '<div class="lm-card">';
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
  return html;
}

function buildEstabilidadBlock() {
  if (!lmHasSection("fondo-emergencia") && !lmHasSection("credito") && !lmHasSection("nivel-deuda") && !lmHasSection("seguros")) return "";
  var html = '<h3 class="lm-h3" style="margin-top:20px">Estabilidad</h3>';
  html += '<div class="lm-card">';

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
  return html;
}

function buildCrecimientoBlock() {
  var retiroCuandoR = lmGetSection("retiro-cuando");
  if (!retiroCuandoR) return "";
  var html = '<h3 class="lm-h3" style="margin-top:20px">Crecimiento</h3>';
  html += '<div class="lm-card">';
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
  return html;
}

var CATEGORIES = {
  presupuesto: { label: "Presupuesto", icon: "presupuesto", build: buildPresupuestoBlock, mejora: function () { return lmGetPresupuestoMejoraItems(); } },
  estabilidad: { label: "Estabilidad", icon: "fondo-emergencia", build: buildEstabilidadBlock, mejora: function () { return lmGetEstabilidadMejoraItems(); } },
  crecimiento: { label: "Crecimiento", icon: "retiro", build: buildCrecimientoBlock, mejora: function () { return lmGetCrecimientoMejoraItems(); } },
};

var SCOPE_FLOW = lmGetActiveFlow();
var scoped = SCOPE_FLOW && CATEGORIES[SCOPE_FLOW] ? SCOPE_FLOW : null;
var activeCatKeys = scoped ? [scoped] : ["presupuesto", "estabilidad", "crecimiento"];

var contentEl = document.getElementById("content");
var nombreInput = document.getElementById("nombre-input");

(function updateHeader() {
  if (!scoped) return;
  var cat = CATEGORIES[scoped];
  document.getElementById("resumen-h1").textContent = "Descargar mi resumen de " + cat.label;
  document.getElementById("resumen-h2").textContent = "Tu situación de " + cat.label + " y tus áreas a mejorar, lista para guardar como PDF o imprimir. Nada de esto se guarda en ningún lado.";
  document.getElementById("resumen-icon").src = "../../assets/icons/categories/" + cat.icon + ".png";
  document.getElementById("resumen-nombre-hint").textContent = 'Si lo dejas en blanco, el resumen dice simplemente "Mi resumen de ' + cat.label + '".';
})();

var hasDataKeys = {
  presupuesto: ["ingresos", "presupuesto", "patrimonio"],
  estabilidad: ["fondo-emergencia", "credito", "nivel-deuda", "seguros", "proteccion"],
  crecimiento: ["retiro-cuando", "retiro-cuanto", "retiro-nif", "retiro-aportacion"],
};
var relevantKeys = [];
activeCatKeys.forEach(function (k) { relevantKeys = relevantKeys.concat(hasDataKeys[k]); });
var HAS_ANY = relevantKeys.some(function (k) { return lmHasSection(k); });

if (!HAS_ANY) {
  lmRenderDataGuard(contentEl, scoped
    ? "Este resumen se arma solo con lo que ya llenaste de " + CATEGORIES[scoped].label + ". Completa esas secciones para descargarlo."
    : "Este resumen se arma solo con lo que ya llenaste en el manual. Completa al menos una categoría (Presupuesto, Estabilidad o Crecimiento) para descargarlo.");
} else {
  var html = '<div class="lm-callout lm-callout-gold">' + DISCLAIMER_HTML + '</div>';

  var mejoraItems = [];
  activeCatKeys.forEach(function (key) {
    html += CATEGORIES[key].build();
    mejoraItems = mejoraItems.concat(CATEGORIES[key].mejora());
  });

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
  var base = scoped ? "resumen de " + CATEGORIES[scoped].label : "resumen financiero";
  var wrap = document.getElementById("resumen-titulo");
  if (!wrap) {
    wrap = document.createElement("div");
    wrap.id = "resumen-titulo";
    contentEl.parentNode.insertBefore(wrap, contentEl);
  }
  wrap.innerHTML =
    '<div style="font-family:\'Helvetica Neue\',Helvetica,Arial,sans-serif;font-size:26px;font-weight:700;margin-bottom:4px">' +
      (nombre ? "Resumen de " + (scoped ? CATEGORIES[scoped].label + " de " : "") + nombre : "Mi " + base) +
    '</div>' +
    '<div style="color:var(--text-faint);font-size:13px;margin-bottom:16px">' + fechaHoy + '</div>';
}
if (HAS_ANY) {
  updateTitle();
  nombreInput.addEventListener("input", updateTitle);
}

document.getElementById("print-btn").addEventListener("click", function () { window.print(); });
