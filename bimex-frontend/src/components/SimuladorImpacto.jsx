import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { calcProyeccion, TASAS } from "../utils/rendimiento.js";

const MONTO_MIN = 500;
const MONTO_MAX = 50000;
const MONTO_PASO = 500;
const MESES_MIN = 3;
const MESES_MAX = 36;
const MESES_PASO = 3;

function fmt(n) {
  return n.toLocaleString("es-MX", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function pct(tasa) {
  return `${(tasa * 100).toFixed(0)}%`;
}

export default function SimuladorImpacto() {
  const { t } = useTranslation();
  const [monto, setMonto] = useState(5000);
  const [meses, setMeses] = useState(12);

  const proy = useMemo(() => calcProyeccion(monto, meses, "inversor"), [monto, meses]);

  const resultados = [
    {
      key: "aporta",
      label: t("simulador.youContribute"),
      valor: `$${fmt(monto)}`,
      sub: t("simulador.youContributeSub"),
      color: "var(--navy)",
    },
    {
      key: "proyecto",
      label: t("simulador.projectGets"),
      valor: `$${fmt(proy.proyectoRecibe)}`,
      sub: t("simulador.projectGetsSub", { pct: pct(TASAS.inversor.proyecto) }),
      color: "var(--green)",
    },
    {
      key: "recupera",
      label: t("simulador.youRecover"),
      valor: `$${fmt(proy.totalRetiras)}`,
      sub: t("simulador.youRecoverSub", { amount: fmt(proy.tuYield), pct: pct(TASAS.inversor.contribuidor) }),
      color: "var(--navy)",
    },
  ];

  return (
    <div className="card" style={{ padding: "28px 28px 22px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 28, marginBottom: 26 }}>
        <div>
          <div style={sx.sliderHead}>
            <label htmlFor="sim-monto" style={sx.sliderLabel}>{t("simulador.amountLabel")}</label>
            <span style={{ ...sx.sliderValor, color: "var(--navy)" }}>${fmt(monto)} MXNe</span>
          </div>
          <input
            id="sim-monto"
            type="range"
            min={MONTO_MIN}
            max={MONTO_MAX}
            step={MONTO_PASO}
            value={monto}
            onChange={(e) => setMonto(Number(e.target.value))}
            style={sx.slider}
            aria-valuetext={`$${fmt(monto)} MXNe`}
          />
        </div>
        <div>
          <div style={sx.sliderHead}>
            <label htmlFor="sim-meses" style={sx.sliderLabel}>{t("simulador.monthsLabel")}</label>
            <span style={{ ...sx.sliderValor, color: "var(--green)" }}>{t("simulador.months", { count: meses })}</span>
          </div>
          <input
            id="sim-meses"
            type="range"
            min={MESES_MIN}
            max={MESES_MAX}
            step={MESES_PASO}
            value={meses}
            onChange={(e) => setMeses(Number(e.target.value))}
            style={sx.slider}
            aria-valuetext={t("simulador.months", { count: meses })}
          />
        </div>
      </div>

      <div role="status" aria-live="polite" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
        {resultados.map(r => (
          <div key={r.key} style={sx.resultBox}>
            <div style={sx.resultLabel}>{r.label}</div>
            <div style={{ ...sx.resultValor, color: r.color }}>{r.valor}</div>
            <div style={sx.resultSub}>{r.sub}</div>
          </div>
        ))}
      </div>

      <p style={{ fontSize: "0.74rem", color: "var(--muted)", lineHeight: 1.6, margin: "18px 0 0", textAlign: "center" }}>
        {t("simulador.disclaimer")}
      </p>
    </div>
  );
}

const sx = {
  sliderHead: {
    display: "flex", justifyContent: "space-between", alignItems: "baseline",
    gap: 12, marginBottom: 10,
  },
  sliderLabel: {
    fontSize: "0.78rem", fontWeight: 600, color: "var(--muted)",
    textTransform: "uppercase", letterSpacing: "0.05em",
  },
  sliderValor: {
    fontFamily: "'SFMono-Regular','Consolas',monospace",
    fontWeight: 700, fontSize: "1.05rem", whiteSpace: "nowrap",
  },
  slider: {
    width: "100%", accentColor: "var(--navy)", cursor: "pointer",
  },
  resultBox: {
    background: "var(--bg)", border: "1px solid var(--border)",
    borderRadius: "var(--radius-sm)", padding: "16px 18px", textAlign: "center",
  },
  resultLabel: {
    fontSize: "0.72rem", fontWeight: 600, color: "var(--muted)",
    textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6,
  },
  resultValor: {
    fontFamily: "'SFMono-Regular','Consolas',monospace",
    fontWeight: 700, fontSize: "1.35rem", lineHeight: 1.2,
  },
  resultSub: {
    fontSize: "0.74rem", color: "var(--muted)", marginTop: 5,
  },
};
