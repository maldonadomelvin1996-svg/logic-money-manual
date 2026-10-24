/* Logic Money — Manual Digital — Perfil de inversor (págs. 371-372)
   Versión simplificada: 3 perfiles mapeados a las tasas ya usadas en
   Aportación requerida (3% / 6% / 10%), para cerrar el ciclo de Retiro. */

var PROFILES = [
  { key: "conservador", label: "Conservador", rate: 3, desc: "Priorizas proteger tu dinero sobre crecerlo rápido. Prefieres menos sorpresas, aunque crezca más lento." },
  { key: "moderado", label: "Moderado", rate: 6, desc: "Aceptas algo de variación a cambio de mejor crecimiento a largo plazo." },
  { key: "agresivo", label: "Agresivo", rate: 10, desc: "Tienes tiempo por delante y toleras que el valor suba y baje con tal de maximizar el crecimiento." },
];

var profilesEl = document.getElementById("profiles");
var selected = null;

function renderProfiles() {
  profilesEl.innerHTML = "";
  var aportacion = lmGetSection("retiro-aportacion");

  PROFILES.forEach(function (p) {
    var card = document.createElement("button");
    card.type = "button";
    card.className = "lm-section-card lm-no-print";
    card.style.width = "100%";
    card.style.textAlign = "left";
    card.style.cursor = "pointer";
    card.style.border = selected === p.key ? "1px solid var(--gold)" : "1px solid var(--border)";

    var sugerida = "";
    if (aportacion && aportacion.rates) {
      var match = aportacion.rates.filter(function (r) { return r.rate === p.rate; })[0];
      if (match) sugerida = " · " + lmMoney(match.mensual) + "/mes sugerido";
    }

    card.innerHTML =
      '<div class="lm-section-card-left" style="flex-direction:column;align-items:flex-start;gap:4px">' +
        '<div class="lm-section-card-title">' + p.label + (selected === p.key ? ' <span class="lm-badge lm-badge-gold">Seleccionado</span>' : '') + '</div>' +
        '<div class="lm-section-card-sub">' + p.desc + sugerida + '</div>' +
      '</div>';
    card.addEventListener("click", function () { selected = p.key; renderProfiles(); renderFooter(); });
    profilesEl.appendChild(card);
  });
}

function renderFooter() {
  var footerEl = document.getElementById("footer-slot");
  footerEl.innerHTML = "";
  if (!selected) return;

  var profile = PROFILES.filter(function (p) { return p.key === selected; })[0];
  lmRenderSaveBanner(footerEl);

  lmRenderSectionFooter({
    containerEl: footerEl,
    mailtoSubject: "Mi perfil de inversor — Logic Money",
    mailtoBody: "Mi perfil de inversor — Logic Money\n\nPerfil: " + profile.label + " (" + profile.rate + "% estimado de crecimiento)",
    nextSectionHref: null,
  });

  lmSaveSection("retiro-perfil", { perfil: profile.key, label: profile.label, rate: profile.rate });
}

(function init() {
  var saved = lmGetSection("retiro-perfil");
  if (saved) selected = saved.perfil;
  renderProfiles();
  renderFooter();
})();
