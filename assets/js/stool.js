/* Logic Money — Manual Digital — Silla de retiro (SVG)
   Mismo concepto visual que la "silla de retiro" del software de asesor
   (ScenarioStoolCard en LogicMoney.html, calibrada en
   stool_images/widget.html): una silla cuyas patas son las fuentes de
   ingreso del retiro — una pata por fuente, cada una con su color fijo y
   su monto debajo — con la necesidad mensual en el centro del asiento.
   Misma matemática de geometría, adaptada a JS plano (sin React) y a los
   campos más simples que usa el manual (Seguro Social, patronal,
   personal, fuentes extra) en vez de las cuentas individuales (401k,
   IRA, Plan 106...) que trackea el software completo. */

var LM_STOOL_MATERIALS = {
  wood: {
    seat: "../../assets/images/stool/wood_seat.webp", seatAspect: 324 / 1233,
    straight: "../../assets/images/stool/wood_leg_straight.webp", straightAspect: 649 / 405,
    angled: "../../assets/images/stool/wood_leg_angled.webp", angledAspect: 630 / 389,
    tuck: 0.88,
  },
  plastic: {
    seat: "../../assets/images/stool/plastic_seat.webp", seatAspect: 320 / 1175,
    straight: "../../assets/images/stool/plastic_leg_straight.webp", straightAspect: 519 / 527,
    angled: "../../assets/images/stool/plastic_leg_angled.webp", angledAspect: 364 / 297,
    tuck: 0.88,
  },
};

/* Paleta fija por tipo de fuente — igual que STOOL_PALETTE en el
   software (ss, pensión...), simplificada a los 3 campos fijos de
   retiro-silla. Las fuentes extra (nombradas libremente) rotan el pool,
   igual que las cuentas personalizadas allá. */
var LM_STOOL_PALETTE = { seguroSocial: "#E6453C", patronal: "#8B5CF6", personal: "#3B7DDB" };
var LM_STOOL_EXTRA_POOL = ["#3FAE5C", "#E8821E", "#C94F8A", "#6AC5E0"];

function lmStoolShade(hex, percent) {
  var h = hex.replace("#", "");
  var n = parseInt(h, 16) || 0;
  var r = (n >> 16) + Math.round(255 * percent);
  var g = ((n >> 8) & 0xFF) + Math.round(255 * percent);
  var b = (n & 0xFF) + Math.round(255 * percent);
  r = Math.max(0, Math.min(255, r)); g = Math.max(0, Math.min(255, g)); b = Math.max(0, Math.min(255, b));
  return "#" + (0x1000000 + r * 0x10000 + g * 0x100 + b).toString(16).slice(1);
}
function lmStoolRgb01(hex) {
  var h = hex.replace("#", "");
  var n = parseInt(h, 16) || 0;
  return [((n >> 16) & 0xFF) / 255, ((n >> 8) & 0xFF) / 255, (n & 0xFF) / 255];
}

/**
 * legs: [{ label, value, color }] — una pata por fuente de ingreso, ya
 * filtradas a value > 0 por quien llama.
 * needMonthly: necesidad mensual a mostrar en el centro del asiento.
 * material: "wood" (silla envejecida, para cuando falta cubrir la meta)
 * o "plastic" (silla nueva/dorada, para cuando ya está cubierta).
 * Devuelve { svg, viewH } — el contenido interno del <svg> y el alto de
 * su viewBox (el ancho siempre es 720).
 */
function lmBuildStoolSVG(legs, needMonthly, material) {
  var MAT = LM_STOOL_MATERIALS[material] || LM_STOOL_MATERIALS.wood;
  var n = Math.max(1, legs.length);
  var uid = material + n + Math.random().toString(36).slice(2, 7);
  var seatCx = 360, seatTopY = 20;
  var seatRx = Math.min(280, 125 + n * 26);
  var seatImgW = seatRx * 2;
  var seatImgH = seatImgW * MAT.seatAspect;
  var seatImgX = seatCx - seatImgW / 2;
  var topY = seatTopY + seatImgH * MAT.tuck;
  var xStart = seatCx - seatRx + 46, xEnd = seatCx + seatRx - 46;
  var legXs = legs.map(function (_, i) { return n === 1 ? seatCx : xStart + (i * (xEnd - xStart)) / (n - 1); });
  var slot = n === 1 ? (xEnd - xStart) : (xEnd - xStart) / (n - 1);
  var maxLegW = Math.max(18, slot);
  function shapeOf(i) { return (n % 2 === 1 && i === (n - 1) / 2) ? "straight" : "angled"; }
  function aspectOf(shape) { return shape === "straight" ? MAT.straightAspect : MAT.angledAspect; }
  var minAspect = Math.min.apply(null, legs.map(function (_, i) { return aspectOf(shapeOf(i)); }));
  var legH = 220;
  var worstLegW = legH / minAspect;
  if (worstLegW > maxLegW) legH *= maxLegW / worstLegW;

  var defs = [];
  var legEls = [];
  legs.forEach(function (leg, i) {
    var x = legXs[i];
    var t = n === 1 ? 0.5 : i / (n - 1);
    var shape = shapeOf(i);
    var mirrored = shape === "angled" && t > 0.5;
    var legW = legH / aspectOf(shape);
    var tint = leg.color;
    var filterId = uid + "_duo" + i;
    var dark = lmStoolRgb01(lmStoolShade(tint, -0.58));
    var light = lmStoolRgb01(lmStoolShade(tint, 0.42));
    defs.push('<filter id="' + filterId + '" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB">' +
      '<feColorMatrix type="matrix" values="0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0 0 0 1 0"/>' +
      '<feComponentTransfer><feFuncR type="table" tableValues="' + dark[0] + " " + light[0] + '"/><feFuncG type="table" tableValues="' + dark[1] + " " + light[1] + '"/><feFuncB type="table" tableValues="' + dark[2] + " " + light[2] + '"/></feComponentTransfer></filter>');
    var transform = mirrored ? ' transform="translate(' + (2 * x) + ' 0) scale(-1 1)"' : "";
    legEls.push('<ellipse cx="' + x + '" cy="' + (topY + legH + 2) + '" rx="' + (legW * 0.42) + '" ry="4" fill="#000" opacity="0.32"/>' +
      '<image href="' + MAT[shape] + '" x="' + (x - legW / 2) + '" y="' + topY + '" width="' + legW + '" height="' + legH + '" preserveAspectRatio="xMidYMin meet" filter="url(#' + filterId + ')"' + transform + "/>");
  });

  var staggerNames = n >= 5;
  var labelBudget = slot * (staggerNames ? 1.85 : 0.95);
  var amountFontSize = Math.max(15, Math.min(23, Math.round(labelBudget / 5.6))) * 1.25;
  var nameFontSize = Math.max(8.5, Math.min(11, Math.round((labelBudget / 5.4) * 10) / 10));
  var maxNameChars = Math.max(7, Math.min(18, Math.floor(labelBudget / (nameFontSize * 0.56))));
  var labelEls = legs.map(function (leg, i) {
    var x = legXs[i];
    var tint = leg.color;
    var shortLabel = leg.label.length > maxNameChars ? leg.label.slice(0, maxNameChars - 1) + "…" : leg.label;
    var blockOffset = staggerNames && i % 2 === 1 ? 24 : 0;
    var nameY = topY + legH + 20 + blockOffset;
    var amountY = topY + legH + 42 + blockOffset;
    return '<text x="' + x + '" y="' + nameY + '" text-anchor="middle" font-size="' + nameFontSize + '" font-weight="700" letter-spacing="0.2" fill="rgba(243,241,234,0.46)">' + shortLabel + "</text>" +
      '<text x="' + x + '" y="' + amountY + '" text-anchor="middle" font-size="' + amountFontSize + '" font-weight="800" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" fill="' + tint + '">' + lmMoney(leg.value) + "</text>";
  }).join("");

  var isGold = material === "plastic";
  var needCy = seatTopY + seatImgH * 0.26;
  var glowId = uid + "_glow";
  var glowFilter = '<filter id="' + glowId + '" x="-60%" y="-60%" width="220%" height="220%"><feDropShadow dx="0" dy="1.5" stdDeviation="3" flood-color="#000" flood-opacity="0.55"/></filter>';
  var needGroup = '<g filter="url(#' + glowId + ')">' +
    '<text x="' + seatCx + '" y="' + needCy + '" text-anchor="middle" font-size="10.5" font-weight="800" letter-spacing="1.4" fill="' + (isGold ? "#3A2607" : "#F3ECDF") + '" stroke="' + (isGold ? "rgba(255,255,255,.55)" : "rgba(0,0,0,.55)") + '" stroke-width="0.6" paint-order="stroke">NECESIDAD MENSUAL</text>' +
    '<text x="' + seatCx + '" y="' + (needCy + 34) + '" text-anchor="middle" font-size="36" font-weight="800" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" fill="' + (isGold ? "#241705" : "#FFFFFF") + '" stroke="' + (isGold ? "rgba(255,255,255,.6)" : "rgba(0,0,0,.6)") + '" stroke-width="1" paint-order="stroke">' + lmMoney(needMonthly) + "</text></g>";

  var svg = '<defs>' + glowFilter + defs.join("") + "</defs>" +
    '<ellipse cx="' + seatCx + '" cy="' + (topY + legH + 6) + '" rx="' + (seatRx * 0.78) + '" ry="10" fill="#000" opacity="0.35"/>' +
    legEls.join("") +
    '<image href="' + MAT.seat + '" x="' + seatImgX + '" y="' + seatTopY + '" width="' + seatImgW + '" height="' + seatImgH + '" preserveAspectRatio="xMidYMid meet"/>' +
    needGroup + labelEls;
  var viewH = Math.max(260, topY + legH + 65);
  return { svg: svg, viewH: viewH };
}
