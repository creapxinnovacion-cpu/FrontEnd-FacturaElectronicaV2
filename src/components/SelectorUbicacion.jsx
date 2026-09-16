import { useMemo } from "react";
import { CAT_DEPTO } from "../utils/catalogos/CatDepto";
import { CAT_MUNICIPIO } from "../utils/catalogos/catMunicipio";
import { CAT_DISTRITO, getDistritosPorMuni } from "../utils/catalogos/catDistrito";

export default function SelectorUbicacion({
  departamento = "",
  municipio = "",
  distrito = "",
  onChange,
  disabled = false,
  gridCols = "grid-cols-1 md:grid-cols-3",
  labelPrefix = "",
}) {
  // Lista de municipios dependientes del departamento seleccionado
  const municipiosDisponibles = useMemo(() => {
    if (!departamento) return [];
    return CAT_MUNICIPIO[departamento] || [];
  }, [departamento]);

  // Lista de distritos dependientes del municipio seleccionado
  const distritosDisponibles = useMemo(() => {
    if (!departamento || !municipio) return [];
    return getDistritosPorMuni(departamento, municipio);
  }, [departamento, municipio]);

  const handleDeptoChange = (e) => {
    const nuevoDepto = e.target.value;
    const primerMuni = CAT_MUNICIPIO[nuevoDepto]?.[0]?.codigo || "";
    const primerDistrito = primerMuni ? (CAT_DISTRITO[nuevoDepto]?.[primerMuni]?.[0]?.codigo || "") : "";

    onChange({
      departamento: nuevoDepto,
      municipio: primerMuni,
      distrito: primerDistrito,
    });
  };

  const handleMuniChange = (e) => {
    const nuevoMuni = e.target.value;
    const primerDistrito = CAT_DISTRITO[departamento]?.[nuevoMuni]?.[0]?.codigo || "";

    onChange({
      departamento,
      municipio: nuevoMuni,
      distrito: primerDistrito,
    });
  };

  const handleDistritoChange = (e) => {
    const nuevoDistrito = e.target.value;
    onChange({
      departamento,
      municipio,
      distrito: nuevoDistrito,
    });
  };

  return (
    <div className={`grid ${gridCols} gap-4`}>
      {/* DEPARTAMENTO */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-gray-500 ml-1">
          {labelPrefix}Departamento (CAT-012)
        </label>
        <select
          value={departamento}
          onChange={handleDeptoChange}
          disabled={disabled}
          className="w-full bg-[#777778] border border-gray-200 rounded-2xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all disabled:opacity-60"
        >
          <option value="">-- Seleccione Departamento --</option>
          {CAT_DEPTO.map((d) => (
            <option key={d.codigo} value={d.codigo}>
              {d.descripcion}
            </option>
          ))}
        </select>
      </div>

      {/* MUNICIPIO (44 Oficiales) */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-gray-500 ml-1">
          {labelPrefix}Municipio (CAT-013)
        </label>
        <select
          value={municipio}
          onChange={handleMuniChange}
          disabled={disabled || !departamento}
          className="w-full  bg-[#777778] border border-gray-200 rounded-2xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all disabled:opacity-60"
        >
          <option value="">-- Seleccione Municipio --</option>
          {municipiosDisponibles.map((m) => (
            <option key={m.codigo} value={m.codigo}>
              {m.descripcion}
            </option>
          ))}
        </select>
      </div>

      {/* DISTRITO (262 Oficiales CAT-008) */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-gray-500 ml-1">
          {labelPrefix}Distrito (CAT-008)
        </label>
        <select
          value={distrito}
          onChange={handleDistritoChange}
          disabled={disabled || !municipio}
          className="w-full  bg-[#777778] border border-gray-200 rounded-2xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all disabled:opacity-60"
        >
          <option value="">-- Seleccione Distrito --</option>
          {distritosDisponibles.map((dis) => (
            <option key={dis.codigo} value={dis.codigo}>
              {dis.descripcion}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
