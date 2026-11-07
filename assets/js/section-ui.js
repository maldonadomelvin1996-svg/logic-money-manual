/* Logic Money — Manual Digital
   Pieza de UI compartida por TODAS las secciones: banner de guardado,
   botones de "enviarme copia" (mailto) / imprimir-PDF, y el fork
   "continuar aquí (digital)" vs "continuar en el libro (físico)".
   Cada sección solo tiene que llamar lmRenderSectionFooter(...). */

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
 * Planes de análisis enfocado: el lector puede elegir no hacer el manual
 * completo y en vez de eso seguir un recorrido corto centrado solo en lo
 * que le interesa (deudas, retiro). El "Siguiente"/"Anterior" de cada
 * sección salta directo entre las claves del plan activo, ignorando las
 * secciones que no aplican (ej. Seguros no aparece en el plan de deudas).
 * El plan activo se guarda en localStorage y se limpia cuando el lector
 * elige explícitamente el análisis completo.
 */
var LM_FLOWS = {
  deudas: { label: "Análisis de deudas", keys: ["ingresos", "deudas", "nivel-deuda", "reduccion-deudas"] },
  retiro: { label: "Plan de retiro", keys: ["ingresos", "deudas", "ahorros", "retiro-cuando", "retiro-cuanto", "retiro-silla", "retiro-nif", "retiro-aportacion", "retiro-perfil"] },
};
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
  if (!flow || idx === -1) return { next: defaultNextHref, prev: defaultPrevHref };
  var nextKey = flow.keys[idx + 1];
  var prevKey = idx > 0 ? flow.keys[idx - 1] : null;
  return {
    next: nextKey ? "../" + nextKey + "/index.html" : null,
    prev: prevKey ? "../" + prevKey + "/index.html" : defaultPrevHref,
  };
}

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
    nextBtn.textContent = "Siguiente";
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
