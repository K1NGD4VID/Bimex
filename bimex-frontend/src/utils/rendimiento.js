// Distribución anual del yield según el modo de contribución.
// Debe coincidir con la tarjeta de rendimiento de la landing:
// inversor → 5% para el contribuidor + 6% al proyecto; mecenas → 11% íntegro al proyecto.
export const TASAS = {
  inversor: { contribuidor: 0.05, proyecto: 0.06 },
  mecenas:  { contribuidor: 0,    proyecto: 0.11 },
};

export function calcProyeccion(cantidadMXNe, meses, modo = "inversor") {
  const capital = Number(cantidadMXNe) || 0;
  const tasas = TASAS[modo] ?? TASAS.inversor;
  const fraccion = (Number(meses) || 0) / 12;
  const tuYield = capital * tasas.contribuidor * fraccion;
  return {
    tuYield,
    proyectoRecibe: capital * tasas.proyecto * fraccion,
    totalRetiras:   capital + tuYield,
  };
}
