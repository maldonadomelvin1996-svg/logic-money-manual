/* Logic Money — Manual Digital
   Pieza de UI compartida por TODAS las secciones: banner de guardado,
   botones de "enviarme copia" (mailto) / imprimir-PDF, y el fork
   "continuar aquí (digital)" vs "continuar en el libro (físico)".
   Cada sección solo tiene que llamar lmRenderSectionFooter(...). */

/* Cada página es un cuestionario corto que se lee de arriba a abajo —
   nunca debe abrir a media página. Algunos navegadores (sobre todo en
   iOS) intentan "restaurar" el scroll de la página anterior al navegar
   con un link normal, dejando al lector en la parte de abajo justo donde
   dio "Siguiente". Forzamos manual + top en cada carga. */
if ("scrollRestoration" in history) {
  try { history.scrollRestoration = "manual"; } catch (e) {}
}
window.scrollTo(0, 0);
window.addEventListener("load", function () { window.scrollTo(0, 0); });

/**
 * Pie chart simple en SVG (sin librerías) para los dashboards. slices:
 * [{ value, color }]. Valores en 0 se ignoran. Devuelve el string <svg>.
 */
function lmBuildPieSVG(slices, size) {
  size = size || 180;
  var r = size / 2;
  var total = slices.reduce(function (s, x) { return s + Math.max(0, x.value); }, 0);
  if (total <= 0) {
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '"><circle cx="' + r + '" cy="' + r + '" r="' + (r - 2) + '" fill="none" stroke="var(--card3)" stroke-width="3"></circle></svg>';
  }
  function polar(cx, cy, radius, angleDeg) {
    var rad = (angleDeg - 90) * Math.PI / 180;
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
  }
  var cumulative = 0;
  var paths = "";
  slices.forEach(function (s) {
    if (s.value <= 0) return;
    var startAngle = (cumulative / total) * 360;
    cumulative += s.value;
    var endAngle = (cumulative / total) * 360;
    var isFullCircle = endAngle - startAngle >= 359.99;
    if (isFullCircle) {
      paths += '<circle cx="' + r + '" cy="' + r + '" r="' + r + '" fill="' + s.color + '"></circle>';
      return;
    }
    var start = polar(r, r, r, endAngle);
    var end = polar(r, r, r, startAngle);
    var largeArc = endAngle - startAngle <= 180 ? "0" : "1";
    paths += '<path d="M ' + r + ' ' + r + ' L ' + start.x.toFixed(2) + ' ' + start.y.toFixed(2) +
      ' A ' + r + ' ' + r + ' 0 ' + largeArc + ' 0 ' + end.x.toFixed(2) + ' ' + end.y.toFixed(2) + ' Z" fill="' + s.color + '"></path>';
  });
  return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '">' + paths + '</svg>';
}

function lmRenderSaveBanner(containerEl) {
  var ok = !(typeof LM_LAST_SAVE_OK !== "undefined" && LM_LAST_SAVE_OK === false);
  var el = document.createElement("div");
  if (!ok) {
    el.className = "lm-save-banner lm-save-banner-error lm-no-print";
    el.innerHTML = "&#9888; No se pudo guardar en este navegador (¿modo privado, o almacenamiento lleno?). Si cierras la página, esto podría perderse.";
  } else {
    el.className = "lm-save-banner lm-no-print";
    el.innerHTML = "&#10003; Guardado en este teléfono — nadie más lo ve, ni siquiera Logic Money.";
  }
  containerEl.appendChild(el);
  lmShowToast(ok ? "Guardado ✓" : "No se pudo guardar", !ok);
}

/* Aviso flotante breve (toast) — más visible que el banner inline, que
   puede quedar fuera de vista en páginas largas. Se desvanece solo.
   Varias secciones guardan en cada tecla (auto-guardado en vivo), así que
   esto reutiliza el MISMO toast en vez de apilar uno por cada tecla. */
var lmActiveToast = null;
var lmActiveToastTimer = null;
function lmShowToast(message, isError) {
  if (lmActiveToast) {
    clearTimeout(lmActiveToastTimer);
    lmActiveToast.textContent = message;
    lmActiveToast.className = "lm-toast lm-toast-visible lm-no-print" + (isError ? " lm-toast-error" : "");
  } else {
    lmActiveToast = document.createElement("div");
    lmActiveToast.className = "lm-toast lm-no-print" + (isError ? " lm-toast-error" : "");
    lmActiveToast.textContent = message;
    document.body.appendChild(lmActiveToast);
    requestAnimationFrame(function () { lmActiveToast.classList.add("lm-toast-visible"); });
  }
  lmActiveToastTimer = setTimeout(function () {
    var t = lmActiveToast;
    if (!t) return;
    t.classList.remove("lm-toast-visible");
    lmActiveToast = null;
    setTimeout(function () { t.remove(); }, 300);
  }, 1500);
}

/* Aviso temprano, antes de que el lector llene nada, si este navegador no
   puede guardar en absoluto (ej. navegación privada en algunos navegadores
   de iOS). Se inserta al inicio de la página si hace falta. */
function lmRenderStorageWarningIfNeeded(containerEl) {
  if (typeof LM_STORAGE_AVAILABLE !== "undefined" && LM_STORAGE_AVAILABLE === false) {
    var el = document.createElement("div");
    el.className = "lm-callout lm-callout-warn lm-no-print";
    el.innerHTML = "&#9888; Este navegador no permite guardar datos (común en modo privado/incógnito). Puedes seguir usando el manual, pero nada se guardará al cerrar la página — considera abrirlo en una pestaña normal.";
    containerEl.insertBefore(el, containerEl.firstChild);
  }
}

/**
 * Planes de análisis enfocado: el lector puede elegir no hacer la versión
 * completa y en vez de eso seguir un recorrido corto centrado en una de
 * las 3 categorías del libro (Presupuesto, Estabilidad, Crecimiento). El
 * "Siguiente"/"Anterior" de cada sección salta directo entre las claves
 * del plan activo, ignorando las secciones que no aplican. El plan activo
 * se guarda en localStorage y se limpia cuando el lector elige
 * explícitamente la versión completa.
 */
var LM_FLOWS = {
  presupuesto: { label: "Presupuesto", keys: ["ingresos", "deudas", "ahorros", "presupuesto", "patrimonio"], dashboard: "../dashboard-presupuesto/index.html" },
  estabilidad: { label: "Estabilidad", keys: ["ingresos", "deudas", "reduccion-deudas", "ahorros", "fondo-emergencia", "credito", "nivel-deuda", "seguros", "proteccion"], dashboard: "../dashboard-estabilidad/index.html" },
  crecimiento: { label: "Crecimiento", keys: ["ingresos", "retiro-cuando", "retiro-cuanto", "retiro-silla", "retiro-nif", "retiro-aportacion", "retiro-perfil"], dashboard: "../dashboard-crecimiento/index.html" },
};

/* Mismo orden que sigue "Siguiente" cuando NO hay un plan enfocado activo
   (el manual completo) — usado solo para la barra de progreso, ya que ahí
   no hay un LM_FLOWS.keys que seguir. No incluye "resumen-datos" (es una
   parada aparte, no parte de la cadena principal) ni "plan-financiero"
   (todavía no tiene página propia). */
var LM_FULL_ORDER = [
  "objetivos", "ingresos", "deudas", "ahorros", "seguros", "presupuesto",
  "patrimonio", "reduccion-deudas", "fondo-emergencia", "credito", "nivel-deuda", "proteccion",
  "retiro-cuando", "retiro-cuanto", "retiro-silla", "retiro-nif", "retiro-aportacion", "retiro-perfil",
];

/* Al terminar el manual completo (sin plan enfocado activo) hay data para
   los 3 dashboards — en vez de obligar un orden fijo con "Siguiente", se
   entra a un hub (ver dashboards/) con un botón por cada uno, para que el
   lector salte libremente entre ellos. Esta lista es solo para que
   lmFlowAwareNav reconozca cuándo está parado en uno de los 3. */
var LM_DASHBOARD_TOUR = ["dashboard-presupuesto", "dashboard-estabilidad", "dashboard-crecimiento"];
function lmGetActiveFlow() {
  try { return localStorage.getItem("lmActiveFlow") || null; } catch (e) { return null; }
}
function lmSetActiveFlow(key) {
  try {
    if (key) localStorage.setItem("lmActiveFlow", key);
    else localStorage.removeItem("lmActiveFlow");
  } catch (e) { /* localStorage no disponible — el plan simplemente no se recuerda */ }
}
function lmCurrentSectionKey() {
  var m = window.location.pathname.match(/\/secciones\/([^/]+)\//);
  return m ? m[1] : null;
}
function lmFlowAwareNav(defaultNextHref, defaultPrevHref) {
  var flowKey = lmGetActiveFlow();
  var flow = flowKey && LM_FLOWS[flowKey];
  var current = lmCurrentSectionKey();
  var idx = flow && current ? flow.keys.indexOf(current) : -1;
  if (flow && idx !== -1) {
    var nextKey = flow.keys[idx + 1];
    var prevKey = idx > 0 ? flow.keys[idx - 1] : null;
    return {
      next: nextKey ? "../" + nextKey + "/index.html" : (flow.dashboard || null),
      nextLabel: !nextKey && flow.dashboard ? "Ver mi dashboard" : null,
      prev: prevKey ? "../" + prevKey + "/index.html" : defaultPrevHref,
    };
  }

  /* Sin plan enfocado activo (manual completo): al llegar al final de la
     cadena de secciones, en vez de quedarse sin "Siguiente", entra al hub
     de los 3 dashboards. Parado en cualquiera de los 3, "Anterior" vuelve
     al hub (no al dashboard anterior — el lector elige libremente cuál
     ver) y "Siguiente" pasa a "Áreas a mejorar", el resumen que junta las
     banderas rojas de los tres. */
  if (!flowKey && current) {
    var tourIdx = LM_DASHBOARD_TOUR.indexOf(current);
    if (tourIdx !== -1) {
      return {
        next: "../areas-mejorar/index.html",
        nextLabel: "Ver áreas a mejorar",
        prev: "../dashboards/index.html",
      };
    }
    var fullIdx = LM_FULL_ORDER.indexOf(current);
    if (fullIdx !== -1 && fullIdx === LM_FULL_ORDER.length - 1) {
      return {
        next: "../dashboards/index.html",
        nextLabel: "Ver mis dashboards",
        prev: defaultPrevHref,
      };
    }
  }

  return { next: defaultNextHref, prev: defaultPrevHref };
}

/* Mientras un plan enfocado está activo, el fondo de cada página de ESE
   recorrido (no la portada) se tiñe muy sutilmente con el color de esa
   categoría — azul para Presupuesto, dorado para Estabilidad, verde para
   Crecimiento — para que se sienta como un ambiente propio sin perder el
   negro de base del sitio. */
(function lmApplyFlowTheme() {
  if (!/\/secciones\//.test(window.location.pathname)) return;
  var flowKey = lmGetActiveFlow();
  if (!flowKey || !LM_FLOWS[flowKey] || !document.body) return;
  document.body.classList.add("lm-theme-" + flowKey);

  if (/\/secciones\/dashboard-/.test(window.location.pathname)) return;

  var main = document.querySelector("main.lm-wrap");
  if (!main) return;
  var badge = document.createElement("div");
  badge.className = "lm-flow-badge lm-no-print";
  badge.innerHTML = '<img src="../../assets/icons/flows/' + flowKey + '.png" alt="Análisis de ' + LM_FLOWS[flowKey].label + '">';
  main.insertBefore(badge, main.firstChild);
})();

/* Barra de progreso arriba de cada sección — cuántas preguntas faltan
   hasta el dashboard (plan enfocado) o hasta el final del manual (sin
   plan activo). Se salta sola en los dashboards y en páginas que no son
   parte de ninguna cadena (ej. resumen-datos). */
(function lmRenderFlowProgress() {
  if (!/\/secciones\//.test(window.location.pathname)) return;
  if (/\/secciones\/dashboard-/.test(window.location.pathname)) return;
  var main = document.querySelector("main.lm-wrap");
  if (!main) return;
  var current = lmCurrentSectionKey();
  if (!current) return;

  var flowKey = lmGetActiveFlow();
  var flow = flowKey && LM_FLOWS[flowKey];
  var keys, stepLabel, skipHref, skipLabel;
  if (flow && flow.keys.indexOf(current) !== -1) {
    keys = flow.keys;
    stepLabel = "Hasta tu dashboard de " + flow.label;
    skipHref = flow.dashboard;
    skipLabel = "Ir directo a mi dashboard &rarr;";
  } else if (!flow && LM_FULL_ORDER.indexOf(current) !== -1) {
    keys = LM_FULL_ORDER;
    stepLabel = "Manual completo";
    skipHref = "../dashboards/index.html";
    skipLabel = "Ir directo a mis dashboards &rarr;";
  } else {
    return;
  }

  var idx = keys.indexOf(current);
  var total = keys.length;
  var pct = Math.round(((idx + 1) / total) * 100);

  var wrap = document.createElement("div");
  wrap.className = "lm-flow-progress lm-no-print";
  wrap.innerHTML =
    '<div class="lm-flow-progress-label"><span>Paso ' + (idx + 1) + ' de ' + total + '</span><span>' + stepLabel + '</span></div>' +
    '<div class="lm-flow-progress-track"><div class="lm-flow-progress-fill" style="width:' + pct + '%"></div></div>' +
    (skipHref ? '<a class="lm-flow-progress-skip" href="' + skipHref + '">' + skipLabel + '</a>' : '');

  var badge2 = main.querySelector(".lm-flow-badge");
  if (badge2) { badge2.insertAdjacentElement("afterend", wrap); }
  else { main.insertBefore(wrap, main.firstChild); }
})();

/**
 * Footer simplificado: UNA acción principal ("Siguiente"), y todo lo demás
 * (correo, WhatsApp, PDF, continuar en el libro) escondido detrás de un
 * link chiquito "Más opciones" — para que la pantalla no se sienta
 * saturada de botones después de cada cálculo.
 *
 * opts: {
 *   containerEl: elemento donde insertar el footer,
 *   mailtoSubject: string,
 *   mailtoBody: string (texto plano, ya formateado),
 *   nextSectionHref: url de la próxima sección o null si no existe aún,
 *   prevSectionHref: url de la sección anterior o null si es la primera,
 * }
 */
function lmRenderSectionFooter(opts) {
  var wrap = document.createElement("div");
  wrap.className = "lm-footer-actions lm-no-print";

  var navRow = document.createElement("div");
  navRow.className = "lm-nav-row";

  var nav = lmFlowAwareNav(opts.nextSectionHref, opts.prevSectionHref);

  if (nav.prev) {
    var prevBtn = document.createElement("a");
    prevBtn.className = "lm-btn lm-btn-ghost lm-btn-prev";
    prevBtn.href = nav.prev;
    prevBtn.textContent = "← Anterior";
    navRow.appendChild(prevBtn);
  }

  var nextBtn = document.createElement("a");
  nextBtn.className = "lm-btn lm-btn-primary";
  if (nav.next) {
    nextBtn.href = nav.next;
    nextBtn.textContent = nav.nextLabel || "Siguiente";
  } else {
    nextBtn.href = lmRootPath() + "index.html";
    nextBtn.textContent = "Ver otras secciones";
  }
  navRow.appendChild(nextBtn);
  wrap.appendChild(navRow);

  var linksRow = document.createElement("div");
  linksRow.className = "lm-footer-links";

  var bookLink = document.createElement("button");
  bookLink.type = "button";
  bookLink.className = "lm-link-btn";
  bookLink.textContent = "o continuar en el libro físico";
  var bookMsg = document.createElement("div");
  bookMsg.className = "lm-callout lm-callout-gold";
  bookMsg.style.display = "none";
  bookMsg.style.marginTop = "10px";
  bookMsg.textContent = "Perfecto. Ya quedó guardado en tu teléfono — continúa en la próxima página de tu manual impreso cuando quieras.";
  bookLink.addEventListener("click", function () {
    bookMsg.style.display = bookMsg.style.display === "none" ? "block" : "none";
  });
  linksRow.appendChild(bookLink);

  var moreLink = document.createElement("button");
  moreLink.type = "button";
  moreLink.className = "lm-link-btn";
  moreLink.textContent = "Más opciones";
  linksRow.appendChild(moreLink);

  wrap.appendChild(linksRow);
  wrap.appendChild(bookMsg);

  var moreWrap = document.createElement("div");
  moreWrap.className = "lm-more-options";
  moreWrap.style.display = "none";

  var mailtoHref = "mailto:?subject=" + encodeURIComponent(opts.mailtoSubject) +
    "&body=" + encodeURIComponent(opts.mailtoBody);
  var sendBtn = document.createElement("a");
  sendBtn.className = "lm-btn lm-btn-secondary";
  sendBtn.href = mailtoHref;
  sendBtn.textContent = "Enviarme una copia por correo";
  moreWrap.appendChild(sendBtn);

  var waHref = "https://wa.me/?text=" + encodeURIComponent(opts.mailtoSubject + "\n\n" + opts.mailtoBody);
  var waBtn = document.createElement("a");
  waBtn.className = "lm-btn lm-btn-secondary";
  waBtn.href = waHref;
  waBtn.target = "_blank";
  waBtn.rel = "noopener";
  waBtn.textContent = "Enviar por WhatsApp";
  moreWrap.appendChild(waBtn);

  var printBtn = document.createElement("button");
  printBtn.className = "lm-btn lm-btn-secondary";
  printBtn.type = "button";
  printBtn.textContent = "Guardar como PDF";
  printBtn.onclick = function () { window.print(); };
  moreWrap.appendChild(printBtn);

  moreLink.addEventListener("click", function () {
    moreWrap.style.display = moreWrap.style.display === "none" ? "flex" : "none";
  });

  wrap.appendChild(moreWrap);
  opts.containerEl.appendChild(wrap);
}

/**
 * Reemplaza confirm() nativo, que se bloquea silenciosamente en varios
 * navegadores embebidos (el navegador interno de WhatsApp o Instagram
 * cuando alguien abre un link compartido, por ejemplo) — ahí el botón
 * "no hacía nada" porque el código nunca pasaba del diálogo bloqueado.
 * Esto muestra la confirmación dentro de la misma página, sin depender
 * de diálogos del navegador.
 */
function lmConfirmInline(triggerBtn, message, onConfirm) {
  var existing = triggerBtn.nextElementSibling;
  if (existing && existing.classList && existing.classList.contains("lm-confirm-inline")) {
    existing.remove();
    return;
  }
  var card = document.createElement("div");
  card.className = "lm-confirm-inline lm-no-print";
  card.innerHTML =
    '<div class="lm-confirm-msg">' + message + '</div>' +
    '<div class="lm-confirm-actions">' +
      '<button type="button" class="lm-btn lm-btn-primary lm-btn-sm" data-yes>Sí, continuar</button>' +
      '<button type="button" class="lm-btn lm-btn-ghost lm-btn-sm" data-no>Cancelar</button>' +
    '</div>';
  triggerBtn.insertAdjacentElement("afterend", card);
  card.querySelector("[data-yes]").addEventListener("click", function () {
    card.remove();
    onConfirm();
  });
  card.querySelector("[data-no]").addEventListener("click", function () { card.remove(); });
}

/**
 * Toggle chiquito "Ejemplo" para UNA sección específica — útil para
 * probar cada calculadora por su cuenta sin tener que llenar las demás
 * secciones primero. Solo para ti (el asesor) mientras pruebas el sitio
 * — por ahora queda visible para cualquiera, pero pensado para esconderse
 * antes de imprimir los QR reales. Requiere que demo-data.js esté
 * cargado en la página.
 */
/**
 * Para páginas de "Análisis de datos" que se arman solas con lo que el
 * lector ya puso en "Tomar datos" (Patrimonio, Fondo de emergencia, Nivel
 * de deuda): si todavía no hay NADA de esa información guardada, no tiene
 * sentido mostrar el cálculo en $0 — mejor invitarlo a hacer "Tomar datos"
 * primero, con un botón directo para empezar ese recorrido desde el inicio.
 */
function lmRenderDataGuard(containerEl, message) {
  containerEl.innerHTML =
    '<div class="lm-callout lm-callout-neutral">' + message + '</div>' +
    '<a class="lm-btn lm-btn-primary" href="../objetivos/index.html">Comenzar mi análisis</a>';
}

function lmRenderSectionDemoButton(containerEl, sectionKey) {
  if (typeof lmBuildDemoData !== "function") return;
  var wrap = document.createElement("div");
  wrap.className = "lm-demo-toggle-wrap lm-no-print";
  wrap.innerHTML = '<button type="button" class="lm-demo-toggle" title="Llenar con ejemplo" aria-label="Llenar con ejemplo">\u{1F9EA}</button>';
  var btn = wrap.querySelector(".lm-demo-toggle");
  btn.addEventListener("click", function () {
    lmConfirmInline(btn, "Esto reemplaza lo que ya pusiste aquí con un dato de ejemplo, para probar. ¿Continuar?", function () {
      btn.classList.add("lm-demo-toggle-on");
      var demo = lmBuildDemoData()[sectionKey];
      lmSaveSection(sectionKey, demo);
      location.reload();
    });
  });
  containerEl.appendChild(wrap);
}

/**
 * Convierte un <input type="text"> en un "combo": el lector puede escribir
 * lo que quiera (libre), o tocar la flechita para elegir de una lista de
 * opciones comunes, que simplemente rellena el mismo campo de texto — no
 * lo reemplaza por un <select>, las dos formas conviven.
 */
function lmAttachCombo(inputEl, options) {
  var wrap = document.createElement("div");
  wrap.className = "lm-combo";
  if (inputEl.parentNode) inputEl.parentNode.replaceChild(wrap, inputEl);
  wrap.appendChild(inputEl);

  var toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "lm-combo-toggle lm-no-print";
  toggle.innerHTML = "&#9662;";
  toggle.setAttribute("aria-label", "Ver opciones comunes");
  wrap.appendChild(toggle);

  var list = document.createElement("div");
  list.className = "lm-combo-list lm-no-print";
  list.style.display = "none";
  options.forEach(function (opt) {
    var item = document.createElement("button");
    item.type = "button";
    item.className = "lm-combo-item";
    item.textContent = opt;
    item.addEventListener("click", function () {
      inputEl.value = opt;
      inputEl.dispatchEvent(new Event("input", { bubbles: true }));
      inputEl.dispatchEvent(new Event("change", { bubbles: true }));
      list.style.display = "none";
      inputEl.focus();
    });
    list.appendChild(item);
  });
  wrap.appendChild(list);

  toggle.addEventListener("click", function () {
    list.style.display = list.style.display === "none" ? "block" : "none";
  });
  document.addEventListener("click", function (e) {
    if (!wrap.contains(e.target)) list.style.display = "none";
  });

  return wrap;
}

/**
 * Envuelve un <input> con un botón "No sé" al lado. Al tocarlo, el campo
 * queda en blanco, marcado como pendiente (data-unknown="true") — nunca
 * bloquea seguir adelante. La idea es que si el lector no sabe un dato,
 * el manual lo deje avanzar igual y vuelva a esa pregunta más tarde.
 * Debe llamarse ANTES de insertar el input en el DOM, o pásale el input
 * ya insertado y esta función lo envuelve en su lugar.
 */
function lmWrapUnknown(inputEl) {
  var row = document.createElement("div");
  row.className = "lm-input-row";
  if (inputEl.parentNode) inputEl.parentNode.replaceChild(row, inputEl);
  row.appendChild(inputEl);

  var btn = document.createElement("button");
  btn.type = "button";
  btn.className = "lm-unknown-btn lm-no-print";
  btn.textContent = "No sé";
  btn.addEventListener("click", function () {
    inputEl.value = "";
    inputEl.dataset.unknown = "true";
    inputEl.classList.add("lm-input-unknown");
    btn.classList.add("lm-unknown-active");
    inputEl.dispatchEvent(new Event("input", { bubbles: true }));
    inputEl.dispatchEvent(new Event("change", { bubbles: true }));
    inputEl.focus();
  });
  inputEl.addEventListener("input", function () {
    if (inputEl.value !== "") {
      inputEl.dataset.unknown = "false";
      inputEl.classList.remove("lm-input-unknown");
      btn.classList.remove("lm-unknown-active");
    }
  });
  row.appendChild(btn);
  return row;
}

/* Se ejecuta solo en páginas de sección (las que tienen #save-banner-slot):
   si este navegador no puede guardar nada, avisa de una vez, sin esperar a
   que el lector llene un formulario entero para enterarse. */
(function () {
  var slot = document.getElementById("save-banner-slot");
  if (slot) lmRenderStorageWarningIfNeeded(slot);
})();

/* Calcula la ruta hacia la raíz del sitio desde una sección en /secciones/x/. */
function lmRootPath() {
  var depth = (window.location.pathname.match(/\/secciones\/[^/]+\//) || [null])[0] ? "../../" : "./";
  return depth;
}
