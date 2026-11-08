/* Logic Money — Manual Digital
   Botón de desarrollo: llena localStorage con los datos de un lector
   ficticio, completos y coherentes entre sí, para poder probar y mejorar
   cada sección sin tener que escribir todo a mano cada vez. Pensado para
   Melvin mientras construye el sitio — no para los lectores finales.

   Dos perfiles disponibles (ver DEMO_SEEDS abajo): "deficit" (el
   original — un lector con déficit mensual, para probar los estados de
   alerta/rojo) y "estable" (un lector modesto pero sin déficit, con sus
   finanzas más o menos en orden, para probar los estados buenos/verdes). */

var DEMO_SEEDS = {
  deficit: {
    ingresosCat: { principal: 3200, pareja: 0, segurosocial: 0, pensiones: 0, inversiones: 150, otros: 0 },
    debts: [
      { name: "Tarjeta Visa", balance: 4200, payment: 150, apr: 24, isHome: false },
      { name: "Préstamo de auto", balance: 12800, payment: 310, apr: 7.5, isHome: false },
      { name: "Casa", balance: 138000, payment: 1050, apr: 5.2, isHome: true },
    ],
    savings: [
      { purpose: "Fondo de emergencia", amount: 1800, monthly: 100 },
      { purpose: "Retiro", amount: 4200, monthly: 150 },
      { purpose: "Sin propósito", amount: 300, monthly: 0 },
    ],
    insurance: [
      { type: "Médico", has: true, payment: 0, coverage: 0 },
      { type: "Vehículo", has: true, payment: 85, coverage: 0 },
      { type: "Vida", has: true, payment: 28, coverage: 75000 },
    ],
    presupuestoCats: {
      vivienda: [["Alquiler", 950, true], ["Luz", 120, true], ["Celular", 45, true], ["Internet", 60, true], ["Agua", 25, true], ["Mantenimiento, basura, otros", 0, true], ["Mascotas", 0, false], ["Otros", 0, true]],
      transportacion: [["Gasolina", 140, true], ["Seguro(s) y marbete de auto", 85, true], ["Mantenimiento, lavado, mecánica", 40, true], ["Peajes", 20, true], ["Taxi, Uber, tren, otros", 0, false], ["Otros", 0, true]],
      ahorros: [["Fondo de Emergencia", 100, true], ["Plan de Retiro, inversión", 150, true], ["Otros", 0, true]],
      proteccion: [["Seguro de vida", 28, true], ["Seguro de incapacidad", 0, true], ["Seguro de cáncer", 0, true], ["Otros", 0, true]],
      salud: [["Seguro médico", 0, true], ["Citas médicas, farmacia, deducibles", 35, true], ["Terapias o tratamiento", 0, true], ["Otros", 0, true]],
      alimentos: [["Compra del supermercado", 380, true], ["Comida en el trabajo", 60, false], ["Restaurante", 120, false], ["Otros", 0, true]],
      familia: [["Pensión", 0, true], ["Matrícula colegio", 0, true], ["Cuido o tutorías", 0, true], ["Meriendas", 0, false], ["Vestimenta", 40, false], ["Barbería, beauty, uñas, estética", 35, false], ["Otros", 0, true]],
      entretenimiento: [["Suscripciones o cable TV", 25, false], ["Membresías", 0, false], ["Vacaciones", 0, false], ["Diezmo u ofrendas", 100, true], ["Pasatiempos (hobbies)", 30, false], ["Otros", 0, false]],
    },
    fondoMonths: 3,
    fondoTienes: 1800,
    creditoScore: 680,
    creditoNotes: "Tarjeta casi al límite — bajar el uso ayudaría a subir el puntaje.",
    proteccionNeedsLife: true,
    proteccionCoberturaActual: 75000,
    retiroCuando: { edadActual: 32, edadRetiro: 62 },
    retiroSilla: { seguroSocial: null, patronal: null, personal: 150 }, // Seguro Social y patronal quedan "No sé" a propósito, para probar ese caso
    retiroPerfil: { perfil: "moderado", label: "Moderado", rate: 6, score: 21, answers: { horizonte: 3, objetivo: 3, reaccion: 3, experiencia: 3, dependencia: 3, proporcion: 3, tradeoff: 3 } },
  },

  estable: {
    ingresosCat: { principal: 3400, pareja: 1100, segurosocial: 0, pensiones: 0, inversiones: 50, otros: 0 },
    debts: [
      { name: "Tarjeta Visa", balance: 600, payment: 50, apr: 18, isHome: false },
      { name: "Préstamo de auto", balance: 8000, payment: 220, apr: 6.5, isHome: false },
    ],
    savings: [
      { purpose: "Fondo de emergencia", amount: 8500, monthly: 200 },
      { purpose: "Retiro", amount: 22000, monthly: 300 },
      { purpose: "Sin propósito", amount: 1000, monthly: 50 },
    ],
    insurance: [
      { type: "Médico", has: true, payment: 0, coverage: 0 },
      { type: "Vehículo", has: true, payment: 70, coverage: 0 },
      { type: "Vida", has: true, payment: 35, coverage: 150000 },
    ],
    presupuestoCats: {
      vivienda: [["Alquiler", 1100, true], ["Luz", 130, true], ["Celular", 50, true], ["Internet", 65, true], ["Agua", 30, true], ["Mantenimiento, basura, otros", 40, true], ["Mascotas", 0, false], ["Otros", 0, true]],
      transportacion: [["Gasolina", 160, true], ["Seguro(s) y marbete de auto", 70, true], ["Mantenimiento, lavado, mecánica", 45, true], ["Peajes", 20, true], ["Taxi, Uber, tren, otros", 0, false], ["Otros", 0, true]],
      ahorros: [["Fondo de Emergencia", 200, true], ["Plan de Retiro, inversión", 300, true], ["Otros", 50, true]],
      proteccion: [["Seguro de vida", 35, true], ["Seguro de incapacidad", 0, true], ["Seguro de cáncer", 0, true], ["Otros", 0, true]],
      salud: [["Seguro médico", 0, true], ["Citas médicas, farmacia, deducibles", 40, true], ["Terapias o tratamiento", 0, true], ["Otros", 0, true]],
      alimentos: [["Compra del supermercado", 420, true], ["Comida en el trabajo", 50, false], ["Restaurante", 100, false], ["Otros", 0, true]],
      familia: [["Pensión", 0, true], ["Matrícula colegio", 0, true], ["Cuido o tutorías", 0, true], ["Meriendas", 0, false], ["Vestimenta", 50, false], ["Barbería, beauty, uñas, estética", 40, false], ["Otros", 0, true]],
      entretenimiento: [["Suscripciones o cable TV", 30, false], ["Membresías", 0, false], ["Vacaciones", 100, false], ["Diezmo u ofrendas", 50, true], ["Pasatiempos (hobbies)", 40, false], ["Otros", 0, false]],
    },
    fondoMonths: 3,
    fondoTienes: 8500,
    creditoScore: 720,
    creditoNotes: "Buen historial — sigue pagando a tiempo para seguir subiendo.",
    proteccionNeedsLife: true,
    proteccionCoberturaActual: 150000,
    retiroCuando: { edadActual: 32, edadRetiro: 62 },
    retiroSilla: { seguroSocial: 950, patronal: 500, personal: 300 },
    retiroPerfil: { perfil: "moderado", label: "Moderado", rate: 6, score: 21, answers: { horizonte: 3, objetivo: 3, reaccion: 3, experiencia: 3, dependencia: 3, proporcion: 3, tradeoff: 3 } },
  },
};

function lmBuildDemoData(profileKey) {
  var seed = DEMO_SEEDS[profileKey] || DEMO_SEEDS.deficit;

  var ingresos = { byCategory: seed.ingresosCat, total: Object.keys(seed.ingresosCat).reduce(function (sum, k) { return sum + seed.ingresosCat[k]; }, 0) };

  var deudas = { debts: seed.debts };
  var debtsTotalBalance = seed.debts.reduce(function (sum, d) { return sum + d.balance; }, 0);
  var debtsTotalPayment = seed.debts.reduce(function (sum, d) { return sum + d.payment; }, 0);

  var ahorros = { savings: seed.savings };
  var savingsTotal = seed.savings.reduce(function (sum, s) { return sum + s.amount; }, 0);

  var seguros = { insurance: seed.insurance };

  var categories = {}, totalGastos = 0, totalNecesario = 0;
  Object.keys(seed.presupuestoCats).forEach(function (key) {
    categories[key] = seed.presupuestoCats[key].map(function (row) {
      totalGastos += row[1];
      if (row[2]) totalNecesario += row[1];
      return { label: row[0], amount: row[1], necesario: row[2] };
    });
  });
  var presupuesto = { categories: categories, totalGastos: totalGastos, totalNecesario: totalNecesario, totalOpcional: totalGastos - totalNecesario, income: ingresos.total };

  var patrimonio = { activos: savingsTotal, pasivos: debtsTotalBalance, patrimonio: savingsTotal - debtsTotalBalance };

  var fondoEmergencia = { months: seed.fondoMonths, gastosNecesarios: totalNecesario, ingreso: ingresos.total, tienes: seed.fondoTienes, objetivoGastos: totalNecesario * seed.fondoMonths, objetivoIngreso: ingresos.total * seed.fondoMonths };

  var credito = { score: seed.creditoScore, notes: seed.creditoNotes };

  var nivelDeudaPct = Math.round((debtsTotalPayment / ingresos.total) * 100);
  var nivelDeuda = { payments: debtsTotalPayment, income: ingresos.total, pct: nivelDeudaPct, band: nivelDeudaPct <= 15 ? "Ideal" : nivelDeudaPct <= 35 ? "Estable" : nivelDeudaPct <= 43 ? "Riesgoso" : nivelDeudaPct <= 55 ? "Crítico" : "Embrollao" };

  var proteccionIngresoAnual = ingresos.total * 12;
  var proteccionAnios = 10;
  var proteccionReemplazo = proteccionIngresoAnual * proteccionAnios;
  var proteccion = {
    needsLife: seed.proteccionNeedsLife, deudas: debtsTotalBalance, funeral: 10000, ingresoAnual: proteccionIngresoAnual, anios: proteccionAnios,
    reemplazo: proteccionReemplazo, ahorros: savingsTotal, coberturaActual: seed.proteccionCoberturaActual,
    resultado: (savingsTotal + seed.proteccionCoberturaActual) - (debtsTotalBalance + 10000 + proteccionReemplazo),
  };

  var retiroCuando = { edadActual: seed.retiroCuando.edadActual, edadRetiro: seed.retiroCuando.edadRetiro, anios: seed.retiroCuando.edadRetiro - seed.retiroCuando.edadActual };
  var retiroCuantoMult = Math.pow(1.03, retiroCuando.anios);
  var retiroCuanto = { ingreso: ingresos.total, anios: retiroCuando.anios, multiplicador: retiroCuantoMult, resultado: ingresos.total * retiroCuantoMult };

  var retiroSillaSeguroSocial = seed.retiroSilla.seguroSocial || 0;
  var retiroSillaPatronal = seed.retiroSilla.patronal || 0;
  var retiroSillaPersonal = seed.retiroSilla.personal || 0;
  var retiroSillaFuentes = retiroSillaSeguroSocial + retiroSillaPatronal + retiroSillaPersonal;
  var retiroSillaFalta = Math.max(0, retiroCuanto.resultado - retiroSillaFuentes);
  var retiroSilla = { seguroSocial: retiroSillaSeguroSocial, patronal: retiroSillaPatronal, personal: retiroSillaPersonal, objetivo: retiroCuanto.resultado, falta: retiroSillaFalta };

  var retiroNif = { objetivo: retiroSillaFalta, anual: retiroSillaFalta * 12, nif: (retiroSillaFalta * 12) / 0.05 };

  function monthlyPMT(fv, ratePct, years) {
    var n = years * 12;
    if (n <= 0 || fv <= 0) return 0;
    if (ratePct === 0) return fv / n;
    var i = (ratePct / 100) / 12;
    return fv * i / (Math.pow(1 + i, n) - 1);
  }
  var retiroAportacion = {
    nif: retiroNif.nif, anios: retiroCuando.anios,
    rates: [0, 3, 6, 10].map(function (r) { return { rate: r, mensual: monthlyPMT(retiroNif.nif, r, retiroCuando.anios) }; }),
  };

  var retiroPerfil = seed.retiroPerfil;

  var objetivos = {
    goals: [
      { goal: "Fondo de emergencia", amount: lmMoney(fondoEmergencia.objetivoGastos), when: "en 1 año", whenMode: "years", whenValue: "1" },
      { goal: "Retiro", amount: "No sé todavía", when: "a los " + retiroCuando.edadRetiro + " años", whenMode: "age", whenValue: String(retiroCuando.edadRetiro) },
      { goal: "Comprar casa de playa", amount: "$40,000", when: "en 5 años", whenMode: "years", whenValue: "5" },
    ],
  };

  return {
    objetivos: objetivos, ingresos: ingresos, deudas: deudas, ahorros: ahorros, seguros: seguros, presupuesto: presupuesto,
    patrimonio: patrimonio, "fondo-emergencia": fondoEmergencia, credito: credito, "nivel-deuda": nivelDeuda, proteccion: proteccion,
    "retiro-cuando": retiroCuando, "retiro-cuanto": retiroCuanto, "retiro-silla": retiroSilla, "retiro-nif": retiroNif,
    "retiro-aportacion": retiroAportacion, "retiro-perfil": retiroPerfil,
  };
}

function lmFillDemoData(profileKey) {
  var demo = lmBuildDemoData(profileKey);
  Object.keys(demo).forEach(function (key) { lmSaveSection(key, demo[key]); });
}
