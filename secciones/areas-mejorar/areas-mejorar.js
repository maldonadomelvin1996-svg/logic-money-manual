/* Logic Money — Manual Digital — Áreas a mejorar
   Junta las banderas de los 3 dashboards en una sola lista. No duplica
   los criterios: llama a las mismas lmGetPresupuestoMejoraItems() /
   lmGetEstabilidadMejoraItems() / lmGetCrecimientoMejoraItems() que cada
   dashboard ya usa para su propia sección "Áreas a mejorar de ___" (ver
   dashboard-presupuesto.js, dashboard-estabilidad.js,
   dashboard-crecimiento.js, cargados antes que este archivo). Lee
   únicamente datos ya guardados, no pide nada nuevo. */

var contentEl = document.getElementById("content");

var HAS_ANY = ["ingresos", "presupuesto", "patrimonio", "fondo-emergencia", "credito", "nivel-deuda", "seguros", "proteccion", "retiro-aportacion"]
  .some(function (k) { return lmHasSection(k); });

if (!HAS_ANY) {
  lmRenderDataGuard(contentEl, "Esta lista se arma sola con lo que ya llenaste en el manual. Completa al menos una categoría (Presupuesto, Estabilidad o Crecimiento) para verla aquí.");
} else {
  var items = []
    .concat(lmGetPresupuestoMejoraItems())
    .concat(lmGetEstabilidadMejoraItems())
    .concat(lmGetCrecimientoMejoraItems());

  var html = "";
  if (items.length === 0) {
    html += '<div class="lm-callout lm-callout-good">&#10003; No encontramos áreas urgentes qué mejorar en lo que has llenado hasta ahora. ¡Sigue así!</div>';
  } else {
    html += '<div class="lm-hint" style="margin-bottom:16px">' + items.length + (items.length === 1 ? " área encontrada — toca para ir directo a arreglarla." : " áreas encontradas — toca cualquiera para ir directo a arreglarla.") + '</div>';
    html += lmRenderMejoraList(items, "");
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
