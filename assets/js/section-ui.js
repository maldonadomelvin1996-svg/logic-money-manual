/* Logic Money — Manual Digital
   Pieza de UI compartida por TODAS las secciones: banner de guardado,
   botones de "enviarme copia" (mailto) / imprimir-PDF, y el fork
   "continuar aquí (digital)" vs "continuar en el libro (físico)".
   Cada sección solo tiene que llamar lmRenderSectionFooter(...). */

function lmRenderSaveBanner(containerEl) {
  var el = document.createElement("div");
  el.className = "lm-save-banner lm-no-print";
  el.innerHTML = "&#10003; Guardado en este teléfono — nadie más lo ve, ni siquiera Logic Money.";
  containerEl.appendChild(el);
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

/* Calcula la ruta hacia la raíz del sitio desde una sección en /secciones/x/. */
function lmRootPath() {
  var depth = (window.location.pathname.match(/\/secciones\/[^/]+\//) || [null])[0] ? "../../" : "./";
  return depth;
}
