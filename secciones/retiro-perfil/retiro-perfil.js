/* Logic Money — Manual Digital — Perfil de inversor (págs. 371-372)
   Antes era un simple "elige tu perfil" de 3 tarjetas. Ahora es un
   cuestionario corto que SE USA PARA DETERMINAR el perfil, con las
   mismas 7 dimensiones que suelen usar los cuestionarios de tolerancia
   al riesgo en la industria financiera: horizonte de tiempo, objetivo
   principal, reacción ante una caída fuerte, experiencia invirtiendo,
   qué tan pronto dependerías de ese dinero, qué proporción de tus
   ahorros totales representa, y la disyuntiva clásica de
   riesgo-vs-rendimiento. Cada opción vale de 1 a 5 puntos; la suma
   (7 a 35) se mapea a los mismos 3 perfiles que ya usa Aportación
   requerida (3% / 6% / 10%), para cerrar el ciclo de Retiro. */

lmRenderSectionDemoButton(document.getElementById("demo-btn-slot"), "retiro-perfil");

var QUESTIONS = [
  {
    id: "horizonte",
    q: "¿Dentro de cuánto tiempo piensas usar este dinero?",
    options: [
      { label: "Menos de 3 años", pts: 1 },
      { label: "Entre 3 y 5 años", pts: 2 },
      { label: "Entre 6 y 10 años", pts: 3 },
      { label: "Entre 11 y 20 años", pts: 4 },
      { label: "Más de 20 años", pts: 5 },
    ],
  },
  {
    id: "objetivo",
    q: "¿Cuál describe mejor tu objetivo principal con esta inversión?",
    options: [
      { label: "Proteger mi dinero, aunque crezca poco", pts: 1 },
      { label: "Generar ingresos estables con algo de crecimiento", pts: 2 },
      { label: "Un balance entre crecer y proteger", pts: 3 },
      { label: "Crecer mi dinero, acepto que el valor suba y baje", pts: 4 },
      { label: "Maximizar el crecimiento a largo plazo, acepto bastante variación", pts: 5 },
    ],
  },
  {
    id: "reaccion",
    q: "Si el valor de tu inversión bajara 20% en pocos meses, ¿qué harías?",
    options: [
      { label: "Vendo todo de inmediato, para no perder más", pts: 1 },
      { label: "Vendo una parte, para reducir el riesgo", pts: 2 },
      { label: "No hago nada, espero a que se recupere", pts: 3 },
      { label: "Lo veo como oportunidad y considero invertir un poco más", pts: 4 },
      { label: "Invierto más de inmediato — es una oportunidad", pts: 5 },
    ],
  },
  {
    id: "experiencia",
    q: "¿Cuánta experiencia tienes invirtiendo?",
    options: [
      { label: "Ninguna — solo cuentas de ahorro", pts: 1 },
      { label: "Poca — CDs, el plan de retiro del trabajo", pts: 2 },
      { label: "Algo — fondos mutuos", pts: 3 },
      { label: "Moderada — acciones y bonos individuales", pts: 4 },
      { label: "Amplia — bienes raíces, opciones, negocio propio", pts: 5 },
    ],
  },
  {
    id: "dependencia",
    q: "¿Qué tan pronto podrías necesitar usar este dinero en una emergencia?",
    options: [
      { label: "Muy pronto — es parte de mi colchón de emergencia", pts: 1 },
      { label: "Podría necesitarlo si algo sale mal", pts: 2 },
      { label: "Tengo un fondo de emergencia aparte, pero es ajustado", pts: 3 },
      { label: "Tengo un buen fondo de emergencia — esto es adicional", pts: 4 },
      { label: "Tengo ingresos y ahorros de sobra — esto no lo tocaría", pts: 5 },
    ],
  },
  {
    id: "proporcion",
    q: "¿Qué parte de tus ahorros totales representa este dinero?",
    options: [
      { label: "Es casi todo lo que tengo", pts: 1 },
      { label: "Es una parte grande — más de la mitad", pts: 2 },
      { label: "Es una parte moderada", pts: 3 },
      { label: "Es una parte menor", pts: 4 },
      { label: "Es una fracción pequeña — tengo mucho más en otro lado", pts: 5 },
    ],
  },
  {
    id: "tradeoff",
    q: "Si pudieras elegir, ¿cuál de estas combinaciones preferirías para tu dinero?",
    options: [
      { label: "Rendimiento esperado ~3% al año, con caídas históricas de hasta -2%", pts: 1 },
      { label: "Rendimiento esperado ~5% al año, con caídas históricas de hasta -10%", pts: 2 },
      { label: "Rendimiento esperado ~7% al año, con caídas históricas de hasta -20%", pts: 3 },
      { label: "Rendimiento esperado ~9% al año, con caídas históricas de hasta -30%", pts: 4 },
      { label: "Rendimiento esperado ~11%+ al año, con caídas históricas de -40% o más", pts: 5 },
    ],
  },
];

var PROFILES = {
  conservador: { label: "Conservador", rate: 3, desc: "Priorizas proteger tu dinero sobre crecerlo rápido. Prefieres menos sorpresas, aunque crezca más lento." },
  moderado: { label: "Moderado", rate: 6, desc: "Aceptas algo de variación a cambio de mejor crecimiento a largo plazo." },
  agresivo: { label: "Agresivo", rate: 10, desc: "Tienes tiempo por delante y toleras que el valor suba y baje con tal de maximizar el crecimiento." },
};
function profileKeyForScore(score) {
  if (score <= 16) return "conservador";
  if (score <= 26) return "moderado";
  return "agresivo";
}

var quizEl = document.getElementById("quiz");
var resultsEl = document.getElementById("results");
var answers = {};

function renderQuiz() {
  quizEl.innerHTML = "";
  QUESTIONS.forEach(function (q, qi) {
    var card = document.createElement("div");
    card.className = "lm-card";
    var html = '<div class="lm-hint" style="margin-bottom:4px">Pregunta ' + (qi + 1) + ' de ' + QUESTIONS.length + '</div>';
    html += '<h3 class="lm-h3">' + q.q + '</h3>';
    q.options.forEach(function (opt) {
      var active = answers[q.id] === opt.pts;
      html += '<button type="button" class="lm-quiz-option' + (active ? ' lm-quiz-option-active' : '') + '" data-q="' + q.id + '" data-pts="' + opt.pts + '">' +
        '<span class="lm-quiz-option-dot"></span><span>' + opt.label + '</span></button>';
    });
    card.innerHTML = html;
    quizEl.appendChild(card);
  });
  quizEl.querySelectorAll(".lm-quiz-option").forEach(function (btn) {
    btn.addEventListener("click", function () {
      answers[btn.dataset.q] = parseInt(btn.dataset.pts, 10);
      renderQuiz();
      renderResults();
    });
  });
}

function renderResults() {
  resultsEl.innerHTML = "";
  var answeredCount = Object.keys(answers).length;

  if (answeredCount < QUESTIONS.length) {
    var guard = document.createElement("div");
    guard.className = "lm-callout lm-callout-neutral";
    guard.textContent = "Responde las " + QUESTIONS.length + " preguntas de arriba para ver tu perfil (" + answeredCount + " de " + QUESTIONS.length + " contestadas).";
    resultsEl.appendChild(guard);
    return;
  }

  var score = QUESTIONS.reduce(function (sum, q) { return sum + answers[q.id]; }, 0);
  var key = profileKeyForScore(score);
  var profile = PROFILES[key];

  var aportacion = lmGetSection("retiro-aportacion");
  var sugerida = "";
  if (aportacion && aportacion.rates) {
    var match = aportacion.rates.filter(function (r) { return r.rate === profile.rate; })[0];
    if (match) sugerida = lmMoney(match.mensual) + "/mes sugerido para llegar a tu meta de retiro";
  }

  var card = document.createElement("div");
  card.className = "lm-card lm-card-good";
  card.innerHTML =
    '<div class="lm-hero" style="padding-top:0">' +
      '<div class="lm-hero-label">Tu perfil de inversor</div>' +
      '<div class="lm-hero-value" style="color:var(--gold)">' + profile.label + '</div>' +
    '</div>' +
    '<div class="lm-dash-row-sub" style="text-align:center;margin-bottom:' + (sugerida ? "10px" : "0") + '">' + profile.desc + '</div>' +
    (sugerida ? '<div class="lm-status-pill" style="display:block;text-align:center;background:var(--gold-soft);color:var(--gold)">' + sugerida + '</div>' : "");
  resultsEl.appendChild(card);

  lmRenderSaveBanner(resultsEl);

  lmRenderSectionFooter({
    containerEl: resultsEl,
    mailtoSubject: "Mi perfil de inversor — Logic Money",
    mailtoBody: "Mi perfil de inversor — Logic Money\n\nPerfil: " + profile.label + " (" + profile.rate + "% estimado de crecimiento)",
    nextSectionHref: null,
    prevSectionHref: "../retiro-aportacion/index.html",
  });

  lmSaveSection("retiro-perfil", { perfil: key, label: profile.label, rate: profile.rate, score: score, answers: answers });
}

(function init() {
  var saved = lmGetSection("retiro-perfil");
  if (saved && saved.answers) answers = saved.answers;
  renderQuiz();
  renderResults();
})();
