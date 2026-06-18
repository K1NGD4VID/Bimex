import { describe, it, expect } from "vitest";
import { calcProyeccion, TASAS } from "../utils/rendimiento.js";

describe("calcProyeccion", () => {
  it("modo inversor a 12 meses: 5% para el contribuidor y 6% para el proyecto", () => {
    const r = calcProyeccion(5000, 12, "inversor");
    expect(r.tuYield).toBeCloseTo(250);
    expect(r.proyectoRecibe).toBeCloseTo(300);
    expect(r.totalRetiras).toBeCloseTo(5250);
  });

  it("modo mecenas: todo el rendimiento (11%) va al proyecto", () => {
    const r = calcProyeccion(10000, 12, "mecenas");
    expect(r.tuYield).toBe(0);
    expect(r.proyectoRecibe).toBeCloseTo(1100);
    expect(r.totalRetiras).toBeCloseTo(10000);
  });

  it("el plazo prorratea el rendimiento anual", () => {
    const r = calcProyeccion(5000, 6, "inversor");
    expect(r.tuYield).toBeCloseTo(125);
    expect(r.proyectoRecibe).toBeCloseTo(150);
  });

  it("siempre devuelve al menos el capital aportado", () => {
    for (const modo of Object.keys(TASAS)) {
      const r = calcProyeccion(7500, 24, modo);
      expect(r.totalRetiras).toBeGreaterThanOrEqual(7500);
    }
  });

  it("entradas inválidas no rompen el cálculo", () => {
    const r = calcProyeccion("abc", undefined, "otro-modo");
    expect(r.tuYield).toBe(0);
    expect(r.proyectoRecibe).toBe(0);
    expect(r.totalRetiras).toBe(0);
  });
});
