# Logic Money — Manual Digital

Versión digital del manual de planificación financiera de Logic Money.
Sitio estático puro (HTML/CSS/JS, sin backend) para que cualquier lector
pueda hacer su propio análisis financiero desde el teléfono, sección por
sección, escaneando el QR correspondiente del libro o navegando el manual
completo desde `index.html`.

## Cómo está organizado

- `index.html` — landing con el listado de todas las secciones del manual.
- `secciones/<nombre>/index.html` + `<nombre>.js` — una carpeta por sección,
  cada una con su propia URL estable (para el QR del libro).
- `assets/css/base.css` — tokens de diseño (misma paleta que el software de
  asesor, `LogicMoney.html`, pero implementación 100% independiente).
- `assets/js/storage.js` — guardado local (localStorage del navegador del
  lector, sin cuenta ni servidor).
- `assets/js/section-ui.js` — pieza compartida al final de cada sección:
  banner de guardado, "enviarme copia" (mailto), "guardar como PDF"
  (`window.print()`), y el fork "continuar digital" vs "continuar en el
  libro".

## Deploy

GitHub Pages, rama `main`, carpeta raíz. Al migrar a Hostinger más adelante:
copiar los archivos tal cual, no requiere build ni servidor.

## Separado del software de asesor

Este repo es independiente de `Logic-Money` (el software completo para
asesores). Solo comparte la paleta de marca — ningún lector que use este
manual llega nunca a la herramienta de asesoría.
