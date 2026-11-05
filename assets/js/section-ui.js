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
 * opts: {
 *   containerEl: elemento donde insertar el footer,
 *   mailtoSubject: string,
 *   mailtoBody: string (texto plano, ya formateado),
 *   nextSectionHref: url de la próxima sección o null si no existe aún,
 *   nextSectionLabel: nombre de la próxima sección (para el botón),
 * }
 */
function lmRenderSectionFooter(opts) {
  var wrap = document.createElement("div");
  wrap.className = "lm-footer-actions lm-no-print";

  var mailtoHref = "mailto:?subject=" + encodeURIComponent(opts.mailtoSubject) +
    "&body=" + encodeURIComponent(opts.mailtoBody);

  var sendBtn = document.createElement("a");
  sendBtn.className = "lm-btn lm-btn-secondary";
  sendBtn.href = mailtoHref;
  sendBtn.textContent = "Enviarme una copia por correo";
  wrap.appendChild(sendBtn);

  var waHref = "https://wa.me/?text=" + encodeURIComponent(opts.mailtoSubject + "\n\n" + opts.mailtoBody);
  var waBtn = document.createElement("a");
  waBtn.className = "lm-btn lm-btn-secondary";
  waBtn.href = waHref;
  waBtn.target = "_blank";
  waBtn.rel = "noopener";
  waBtn.textContent = "Enviar por WhatsApp";
  wrap.appendChild(waBtn);

  var printBtn = document.createElement("button");
  printBtn.className = "lm-btn lm-btn-secondary";
  printBtn.type = "button";
  printBtn.textContent = "Guardar como PDF";
  printBtn.onclick = function () { window.print(); };
  wrap.appendChild(printBtn);

  var fork = document.createElement("div");
  fork.className = "lm-fork";
  var forkTitle = document.createElement("div");
  forkTitle.className = "lm-fork-title";
  forkTitle.textContent = "¿Cómo quieres continuar tu plan?";
  fork.appendChild(forkTitle);

  var grid = document.createElement("div");
  grid.className = "lm-fork-grid";

  var digitalBtn = document.createElement("a");
  digitalBtn.className = "lm-btn lm-btn-primary";
  if (opts.nextSectionHref) {
    digitalBtn.href = opts.nextSectionHref;
    digitalBtn.textContent = "Seguir aquí";
  } else {
    digitalBtn.href = lmRootPath() + "index.html";
    digitalBtn.textContent = "Ver otras secciones";
  }
  grid.appendChild(digitalBtn);

  var bookBtn = document.createElement("button");
  bookBtn.className = "lm-btn lm-btn-secondary";
  bookBtn.type = "button";
  bookBtn.textContent = "Continuar en el libro";
  bookBtn.onclick = function () {
    bookMsg.style.display = "block";
    bookBtn.style.display = "none";
  };
  grid.appendChild(bookBtn);

  fork.appendChild(grid);

  var bookMsg = document.createElement("div");
  bookMsg.className = "lm-callout lm-callout-gold";
  bookMsg.style.display = "none";
  bookMsg.style.marginTop = "12px";
  bookMsg.textContent = "Perfecto. Ya quedó guardado en tu teléfono — continúa en la próxima página de tu manual impreso cuando quieras.";
  fork.appendChild(bookMsg);

  wrap.appendChild(fork);
  opts.containerEl.appendChild(wrap);
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
