/* Logic Money — Manual Digital — Descargar mi resumen
   Ya no reconstruye un resumen aparte: llama a las mismas funciones
   lmRenderDashboardPresupuesto() / lmRenderDashboardEstabilidad() /
   lmRenderDashboardCrecimiento() que ya usa cada dashboard (y el hub),
   así que lo que se ve/descarga aquí es exactamente lo mismo que el
   dashboard — mismas tarjetas, misma sección "Áreas a mejorar" — sin
   duplicar esa lógica en un tercer lugar. Esta pantalla solo le añade
   alrededor: el nombre opcional, el aviso de asesor profesional, y el
   botón para guardarlo como PDF (window.print()).

   La categoría a mostrar viene del parámetro ?cat= en la URL (lo pone
   cada dashboard en su propio link "Descargar mi resumen"), NO de
   lmGetActiveFlow() — ese estado global puede quedar desactualizado si
   el lector llega a un dashboard sin pasar por el botón "comenzar
   análisis" (ver el bug que reportó el usuario), así que esta página
   nunca depende de él. Sin ?cat=, se muestran las 3 categorías (llegó
   desde el hub del manual completo). */

var DASH_RENDERERS = {
  presupuesto: { render: lmRenderDashboardPresupuesto, label: "Presupuesto" },
  estabilidad: { render: lmRenderDashboardEstabilidad, label: "Estabilidad" },
  crecimiento: { render: lmRenderDashboardCrecimiento, label: "Crecimiento" },
};
var HAS_DATA_KEYS = {
  presupuesto: ["ingresos", "presupuesto", "patrimonio"],
  estabilidad: ["fondo-emergencia", "credito", "nivel-deuda", "seguros", "proteccion"],
  crecimiento: ["retiro-cuando", "retiro-cuanto", "retiro-nif", "retiro-aportacion"],
};

var urlCat = new URLSearchParams(location.search).get("cat");
var scoped = DASH_RENDERERS[urlCat] ? urlCat : null;

/* Corrige el tema/insignia que lmApplyFlowTheme ya le puso al <body> en
   base a lmActiveFlow (puede no coincidir con ?cat=, por la razón de
   arriba) — esta página manda sobre su propio tema. */
document.body.className = document.body.className.split(" ").filter(function (c) { return c.indexOf("lm-theme-") !== 0; }).join(" ");
var existingBadge = document.querySelector(".lm-flow-badge");
if (existingBadge) existingBadge.remove();
if (scoped) {
  document.body.classList.add("lm-theme-" + scoped);
  var mainEl = document.querySelector("main.lm-wrap");
  var badgeEl = document.createElement("div");
  badgeEl.className = "lm-flow-badge lm-no-print";
  badgeEl.innerHTML = '<img src="../../assets/icons/flows/' + scoped + '.png" alt="Análisis de ' + DASH_RENDERERS[scoped].label + '">';
  mainEl.insertBefore(badgeEl, mainEl.firstChild);
}

var DISCLAIMER_HTML = "Este resumen es una guía general basada en lo que llenaste — te da una idea clara de dónde estás, pero no sustituye el análisis de un profesional licenciado. Para un plan específico sobre cómo atender estas áreas, comunícate con tu asesor de confianza, o con <strong>Melvin Joel Maldonado Santos, CFEI&reg;</strong> &mdash; 787-345-9728.";

var contentEl = document.getElementById("content");
var nombreInput = document.getElementById("nombre-input");

function hasCatData(key) {
  return HAS_DATA_KEYS[key].some(function (k) { return lmHasSection(k); });
}
var catsToShow = (scoped ? [scoped] : ["presupuesto", "estabilidad", "crecimiento"]).filter(hasCatData);

(function updateHeader() {
  if (!scoped) return;
  var label = DASH_RENDERERS[scoped].label;
  document.getElementById("resumen-h1").textContent = "Descargar mi resumen de " + label;
  document.getElementById("resumen-h2").textContent = "Tu situación de " + label + " y tus áreas a mejorar, lista para guardar como PDF o imprimir. Nada de esto se guarda en ningún lado.";
  document.getElementById("resumen-icon").style.display = "none";
  document.getElementById("resumen-nombre-hint").textContent = 'Si lo dejas en blanco, el resumen dice simplemente "Mi resumen de ' + label + '".';
})();

if (catsToShow.length === 0) {
  lmRenderDataGuard(contentEl, scoped
    ? "Este resumen se arma solo con lo que ya llenaste de " + DASH_RENDERERS[scoped].label + ". Completa esas secciones para descargarlo."
    : "Este resumen se arma solo con lo que ya llenaste en el manual. Completa al menos una categoría (Presupuesto, Estabilidad o Crecimiento) para descargarlo.");
} else {
  var disclaimerEl = document.createElement("div");
  disclaimerEl.className = "lm-callout lm-callout-gold";
  disclaimerEl.innerHTML = DISCLAIMER_HTML;
  contentEl.appendChild(disclaimerEl);

  catsToShow.forEach(function (key) {
    var sub = document.createElement("div");
    contentEl.appendChild(sub);
    DASH_RENDERERS[key].render(sub, { showFooter: false });
  });
}

var fechaHoy = new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
function updateTitle() {
  var nombre = nombreInput.value.trim();
  var base = scoped ? "resumen de " + DASH_RENDERERS[scoped].label : "resumen financiero";
  var wrap = document.getElementById("resumen-titulo");
  if (!wrap) {
    wrap = document.createElement("div");
    wrap.id = "resumen-titulo";
    contentEl.parentNode.insertBefore(wrap, contentEl);
  }
  wrap.innerHTML =
    '<div style="font-family:\'Helvetica Neue\',Helvetica,Arial,sans-serif;font-size:26px;font-weight:700;margin-bottom:4px">' +
      (nombre ? "Resumen de " + (scoped ? DASH_RENDERERS[scoped].label + " de " : "") + nombre : "Mi " + base) +
    '</div>' +
    '<div style="color:var(--text-faint);font-size:13px;margin-bottom:16px">' + fechaHoy + '</div>';
}
if (catsToShow.length) {
  updateTitle();
  nombreInput.addEventListener("input", updateTitle);
}

document.getElementById("print-btn").addEventListener("click", function () { window.print(); });
