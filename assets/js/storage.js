/* Logic Money — Manual Digital
   Guardado 100% local (localStorage del navegador del lector). Sin cuenta,
   sin login, sin base de datos central. Un solo objeto JSON con una llave
   por sección, para que secciones futuras puedan leer datos de secciones
   anteriores (ej. Deudas lee el ingreso mensual que el lector ya puso en
   Ingresos, si lo hizo). */

var LM_STORAGE_KEY = "logicMoneyManualData_v1";

function lmLoadData() {
  try {
    var raw = localStorage.getItem(LM_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function lmSaveSection(sectionKey, data) {
  var all = lmLoadData();
  all[sectionKey] = Object.assign({}, data, { savedAt: new Date().toISOString() });
  try {
    localStorage.setItem(LM_STORAGE_KEY, JSON.stringify(all));
    return true;
  } catch (e) {
    return false;
  }
}

function lmGetSection(sectionKey) {
  var all = lmLoadData();
  return all[sectionKey] || null;
}

function lmHasSection(sectionKey) {
  return !!lmGetSection(sectionKey);
}

function lmClearSection(sectionKey) {
  var all = lmLoadData();
  delete all[sectionKey];
  try {
    localStorage.setItem(LM_STORAGE_KEY, JSON.stringify(all));
  } catch (e) {}
}

/* Formatea números como USD, sin decimales si es entero. */
function lmMoney(n) {
  n = Number(n) || 0;
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function lmMoneyDecimals(n) {
  n = Number(n) || 0;
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
