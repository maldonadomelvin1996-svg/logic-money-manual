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

var contentEl = document.getElementById("content");
var tabBtns = Array.prototype.slice.call(document.querySelectorAll("#dash-tabs .lm-flow-sq-btn"));

function showDash(key) {
  tabBtns.forEach(function (btn) {
    btn.classList.toggle("lm-flow-sq-btn-active", btn.dataset.dash === key);
  });
  DASH_RENDERERS[key](contentEl, { showFooter: false });
  window.scrollTo(0, 0);
}

tabBtns.forEach(function (btn) {
  btn.addEventListener("click", function () { showDash(btn.dataset.dash); });
});

showDash("presupuesto");
