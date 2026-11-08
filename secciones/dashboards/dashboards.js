/* Logic Money — Manual Digital — Hub de dashboards
   Los 3 botones de arriba siempre están activos y visibles — tocar uno
   muestra ese dashboard en esta misma pantalla (sin navegar a otra
   página), así que el lector puede saltar entre los tres las veces que
   quiera. Cada dashboard se renderiza con su misma función de siempre
   (ver dashboard-presupuesto.js, dashboard-estabilidad.js,
   dashboard-crecimiento.js), solo que sin su pie de "Siguiente/Anterior"
   — aquí ese rol lo cumplen los mismos 3 botones. */

var DASH_RENDERERS = {
  presupuesto: lmRenderDashboardPresupuesto,
  estabilidad: lmRenderDashboardEstabilidad,
  crecimiento: lmRenderDashboardCrecimiento,
};
var DASH_META = {
  presupuesto: { label: "Presupuesto", sub: "A dónde se va tu dinero cada mes, y qué tan sólido es lo que tienes vs. lo que debes." },
  estabilidad: { label: "Estabilidad", sub: "Qué tan preparado estás ante lo inesperado: fondo de emergencia, crédito, nivel de deuda y seguros." },
  crecimiento: { label: "Crecimiento", sub: "Tu camino al retiro: cuánto necesitas, y cuánto invertir cada mes para llegar." },
};

var contentEl = document.getElementById("content");
var wordmarkEl = document.getElementById("dash-wordmark");
var subtitleEl = document.getElementById("dash-subtitle");
var tabBtns = Array.prototype.slice.call(document.querySelectorAll("#dash-tabs .lm-flow-sq-btn"));

function showDash(key) {
  tabBtns.forEach(function (btn) {
    btn.classList.toggle("lm-flow-sq-btn-active", btn.dataset.dash === key);
  });
  /* Mismo tinte de fondo + tarjetas, y el mismo wordmark/subtítulo, que
     ya usa cada análisis enfocado (ver lmApplyFlowTheme en
     section-ui.js) — aquí no hay un plan enfocado activo, así que se
     ponen a mano según la pestaña que esté abierta, en vez de depender
     de lmActiveFlow. */
  document.body.classList.remove("lm-theme-presupuesto", "lm-theme-estabilidad", "lm-theme-crecimiento");
  document.body.classList.add("lm-theme-" + key);
  wordmarkEl.src = "../../assets/icons/flows/" + key + ".png";
  wordmarkEl.alt = DASH_META[key].label;
  subtitleEl.textContent = DASH_META[key].sub;
  DASH_RENDERERS[key](contentEl, { showFooter: false });
  window.scrollTo(0, 0);
}

tabBtns.forEach(function (btn) {
  btn.addEventListener("click", function () { showDash(btn.dataset.dash); });
});

showDash("presupuesto");
