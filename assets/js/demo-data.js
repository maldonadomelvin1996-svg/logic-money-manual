/* Logic Money — Manual Digital
   Botón de desarrollo: llena localStorage con los datos de un lector
   ficticio, completos y coherentes entre sí, para poder probar y mejorar
   cada sección sin tener que escribir todo a mano cada vez. Pensado para
   Melvin mientras construye el sitio — no para los lectores finales. */

function lmBuildDemoData() {
  var ingresos = {
    byCategory: { principal: 3200, pareja: 0, segurosocial: 0, pensiones: 0, inversiones: 150, otros: 0 },
    total: 3350,
  };

  var deudas = {
    debts: [
      { name: "Tarjeta Visa", balance: 4200, payment: 150, apr: 24, isHome: false },
      { name: "Préstamo de auto", balance: 12800, payment: 310, apr: 7.5, isHome: false },
      { name: "Casa", balance: 138000, payment: 1050, apr: 5.2, isHome: true },
    ],
  };
  var debtsTotalBalance = 4200 + 12800 + 138000;
  var debtsTotalPayment = 150 + 310 + 1050;

  var ahorros = {
    savings: [
      { purpose: "Fondo de emergencia", amount: 1800, monthly: 100 },
      { purpose: "Retiro", amount: 4200, monthly: 150 },
      { purpose: "Sin propósito", amount: 300, monthly: 0 },
    ],
  };
  var savingsTotal = 1800 + 4200 + 300;

  var seguros = {
    insurance: [
      { type: "Médico", has: true, payment: 0, coverage: 0 },
      { type: "Vehículo", has: true, payment: 85, coverage: 0 },
      { type: "Vida", has: true, payment: 28, coverage: 75000 },
    ],
  };

  var PRESUPUESTO_CATS = {
    vivienda: [["Alquiler", 950, true], ["Luz", 120, true], ["Celular", 45, true], ["Internet", 60, true], ["Agua", 25, true], ["Mantenimiento, basura, otros", 0, true], ["Mascotas", 0, false], ["Otros", 0, true]],
    transportacion: [["Gasolina", 140, true], ["Seguro(s) y marbete de auto", 85, true], ["Mantenimiento, lavado, mecánica", 40, true], ["Peajes", 20, true], ["Taxi, Uber, tren, otros", 0, false], ["Otros", 0, true]],
    ahorros: [["Fondo de Emergencia", 100, true], ["Plan de Retiro, inversión", 150, true], ["Otros", 0, true]],
    proteccion: [["Seguro de vida", 28, true], ["Seguro de incapacidad", 0, true], ["Seguro de cáncer", 0, true], ["Otros", 0, true]],
    salud: [["Seguro médico", 0, true], ["Citas médicas, farmacia, deducibles", 35, true], ["Terapias o tratamiento", 0, true], ["Otros", 0, true]],
    alimentos: [["Compra del supermercado", 380, true], ["Comida en el trabajo", 60, false], ["Restaurante", 120, false], ["Otros", 0, true]],
    familia: [["Pensión", 0, true], ["Matrícula colegio", 0, true], ["Cuido o tutorías", 0, true], ["Meriendas", 0, false], ["Vestimenta", 40, false], ["Barbería, beauty, uñas, estética", 35, false], ["Otros", 0, true]],
    entretenimiento: [["Suscripciones o cable TV", 25, false], ["Membresías", 0, false], ["Vacaciones", 0, false], ["Diezmo u ofrendas", 100, true], ["Pasatiempos (hobbies)", 30, false], ["Otros", 0, false]],
  };
  var categories = {}, totalGastos = 0, totalNecesario = 0;
  Object.keys(PRESUPUESTO_CATS).forEach(function (key) {
    categories[key] = PRESUPUESTO_CATS[key].map(function (row) {
      totalGastos += row[1];
      if (row[2]) totalNecesario += row[1];
      return { label: row[0], amount: row[1], necesario: row[2] };
    });
  });
  var presupuesto = { categories: categories, totalGastos: totalGastos, totalNecesario: totalNecesario, totalOpcional: totalGastos - totalNecesario, income: ingresos.total };

  var patrimonio = { activos: savingsTotal, pasivos: debtsTotalBalance, patrimonio: savingsTotal - debtsTotalBalance };

  var fondoEmergencia = { months: 3, gastosNecesarios: totalNecesario, ingreso: ingresos.total, tienes: 1800, objetivoGastos: totalNecesario * 3, objetivoIngreso: ingresos.total * 3 };

  var credito = { score: 680, notes: "Tarjeta casi al límite — bajar el uso ayudaría a subir el puntaje." };

  var nivelDeudaPct = Math.round((debtsTotalPayment / ingresos.total) * 100);
  var nivelDeuda = { payments: debtsTotalPayment, income: ingresos.total, pct: nivelDeudaPct, band: nivelDeudaPct <= 15 ? "Ideal" : nivelDeudaPct <= 35 ? "Estable" : nivelDeudaPct <= 43 ? "Riesgoso" : nivelDeudaPct <= 55 ? "Crítico" : "Embrollao" };

  var proteccionIngresoAnual = ingresos.total * 12;
  var proteccionAnios = 10;
  var proteccionReemplazo = proteccionIngresoAnual * proteccionAnios;
  var proteccion = {
    needsLife: true, deudas: debtsTotalBalance, funeral: 10000, ingresoAnual: proteccionIngresoAnual, anios: proteccionAnios,
    reemplazo: proteccionReemplazo, ahorros: savingsTotal, coberturaActual: 75000,
    resultado: (savingsTotal + 75000) - (debtsTotalBalance + 10000 + proteccionReemplazo),
  };

  var retiroCuando = { edadActual: 32, edadRetiro: 62, anios: 30 };
  var retiroCuantoMult = Math.pow(1.03, retiroCuando.anios);
  var retiroCuanto = { ingreso: ingresos.total, anios: retiroCuando.anios, multiplicador: retiroCuantoMult, resultado: ingresos.total * retiroCuantoMult };

  var retiroSillaFuentes = 150; // Seguro Social queda "No sé" a propósito, para probar ese caso
  var retiroSillaFalta = Math.max(0, retiroCuanto.resultado - retiroSillaFuentes);
  var retiroSilla = { seguroSocial: 0, patronal: 0, personal: 150, objetivo: retiroCuanto.resultado, falta: retiroSillaFalta };

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

  var retiroPerfil = { perfil: "moderado", label: "Moderado", rate: 6 };

  var objetivos = {
    goals: [
      { goal: "Fondo de emergencia", amount: lmMoney(fondoEmergencia.objetivoGastos), when: "en 1 año", whenMode: "years", whenValue: "1" },
      { goal: "Retiro", amount: "No sé todavía", when: "a los 62 años", whenMode: "age", whenValue: "62" },
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

function lmFillDemoData() {
  var demo = lmBuildDemoData();
  Object.keys(demo).forEach(function (key) { lmSaveSection(key, demo[key]); });
}
