import Select from "../utils/ui/Select";
import { CAT_ACTIVIDAD_ECONOMICA } from "../utils/catalogos/catActividadesEconomicas";
import { CAT_TIPO_PERSONA } from "../utils/catalogos/CatTipoPersona";
import { DOMICILIO_FISCAL } from "../utils/catalogos/CatDomicilioFiscal";
import { useState, useEffect } from "react";
import Input from "../utils/ui/Input";
import SelectorUbicacion from "../components/SelectorUbicacion";
import { emisorService } from "../services/api/emisor.service";

import {
  validarNIT,
  validarNRC,
  validarEmail,
  validarLongitud,
  validarTelefono,
  sanitizarSoloNumeros,
} from "../utils/validacionesMH";

export default function EmisorConfig() {
  const [form, setForm] = useState({
    id: null,
    nombre: "",
    nombre_comercial: "",
    nit: "",
    nrc: "",
    cod_actividad: "",
    desc_actividad: "",
    direccion: "",
    departamento: "06",
    municipio: "23",
    distrito: "01",
    complemento: "",
    correo: "",
    telefono: "",
    passwordCertificado: "",
    certificado: null,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [errores, setErrores] = useState({});

  useEffect(() => {
    loadEmisor();
  }, []);

  const loadEmisor = async () => {
    try {
      const response = await emisorService.getAll();
      if (response.data && response.data.length > 0) {
        const data = response.data[0];
        setForm((prev) => ({
          ...prev,
          id: data.id,
          nombre: data.nombre || "",
          nombre_comercial: data.nombre_comercial || "",
          nit: data.nit || "",
          nrc: data.nrc || "",
          cod_actividad: data.cod_actividad || "",
          desc_actividad: data.desc_actividad || "",
          direccion: data.direccion || "",
          departamento: data.departamento || "06",
          municipio: data.municipio || "23",
          distrito: data.distrito || "01",
          complemento: data.complemento || "",
          correo: data.correo || "",
          telefono: data.telefono || "",
        }));
      }
    } catch (error) {
      console.error("Error al cargar emisor", error);
    }
  };

  const validarCampo = (name, value) => {
    let error = "";
    switch (name) {
      case "nombre":
        if (!validarLongitud(value, 3, 250)) error = "Debe tener entre 3 y 250 caracteres";
        break;
      case "nit":
        if (!validarNIT(value)) error = "Formato NIT inválido (9, 10 o 14 dígitos)";
        break;
      case "nrc":
        if (!validarNRC(value)) error = "NRC inválido (solo números, hasta 10 dígitos)";
        break;
      case "correo":
        if (value && !validarEmail(value)) error = "Correo electrónico inválido";
        break;
      case "cod_actividad":
        if (!value) error = "Debe seleccionar un giro";
        break;
      case "direccion":
        if (!validarLongitud(value, 5, 300)) error = "Dirección muy corta";
        break;
      case "telefono":
        if (!value || !String(value).trim()) {
          error = "El teléfono es obligatorio";
        } else if (!validarTelefono(value)) {
          error = "Teléfono inválido. Ingrese 8 dígitos (ej. 7000-0000)";
        }
        break;
      default:
        break;
    }
    setErrores((prev) => ({ ...prev, [name]: error }));
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    let val = files ? files[0] : value;
    if (name === "nrc") {
      val = sanitizarSoloNumeros(val, 10);
    }
    if (name === "telefono" && typeof val === "string") {
      const soloNum = sanitizarSoloNumeros(val, 8);
      if (soloNum.length > 4) {
        val = `${soloNum.slice(0, 4)}-${soloNum.slice(4)}`;
      } else {
        val = soloNum;
      }
    }

    setForm((prev) => {
      const updated = { ...prev, [name]: val };
      if (name === "cod_actividad") {
        const item = CAT_ACTIVIDAD_ECONOMICA.find((a) => a.codigo === val);
        if (item) {
          updated.desc_actividad = item.descripcion;
        }
      }
      return updated;
    });

    if (!files) validarCampo(name, val);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      let emisorId = form.id;
      const emisorData = {
        nombre: form.nombre,
        nombre_comercial: form.nombre_comercial,
        nit: form.nit,
        nrc: form.nrc,
        cod_actividad: form.cod_actividad,
        desc_actividad: form.desc_actividad || form.cod_actividad,
        direccion: form.direccion,
        departamento: form.departamento || "06",
        municipio: form.municipio || "23",
        distrito: form.distrito || "01",
        complemento: form.complemento || form.direccion,
        correo: form.correo,
        telefono: form.telefono,
      };

      if (emisorId) {
        await emisorService.update(emisorId, emisorData);
      } else {
        const res = await emisorService.create(emisorData);
        emisorId = res.data.id;
        setForm(prev => ({ ...prev, id: emisorId }));
      }

      // Carga de certificado si existe
      if (form.certificado && form.passwordCertificado) {
        const formData = new FormData();
        formData.append("certificado", form.certificado);
        formData.append("password", form.passwordCertificado);
        await emisorService.uploadCertificate(emisorId, formData);
      }

      setMessage({ text: "Configuración guardada exitosamente", type: "success" });
    } catch (error) {
      setMessage({ text: "Error al guardar la configuración", type: "error" });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const camposObligatorios = ["nombre", "nit", "nrc", "cod_actividad", "direccion", "telefono"];
  const sistemaListo = camposObligatorios.every((campo) => form[campo] && form[campo] !== "") &&
    Object.values(errores).every((e) => !e);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* ===== ESTADO ===== */}
      <div className={`rounded-xl p-4 flex justify-between items-center ${sistemaListo ? "bg-emerald-50 border border-emerald-200" : "bg-rose-50 border border-rose-200"}`}>
        <div>
          <h2 className="text-gray-900 font-semibold text-lg">Estado del sistema de facturación</h2>
          <p className="text-gray-600 text-sm">{sistemaListo ? "Listo para emitir DTE" : "Faltan datos obligatorios"}</p>
        </div>
        <span className="text-2xl">{sistemaListo ? "🟢" : "🔴"}</span>
      </div>

      {message.text && (
        <div className={`p-4 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}

      {/* ===== DATOS EMISOR ===== */}
      <section className="bg-white rounded-2xl shadow-sm border p-6 space-y-4">
        <h3 className="text-black text-lg font-semibold">Datos del emisor</h3>
        <div className="grid text-black  grid-cols-1 md:grid-cols-2 gap-4">
          <Input name="nombre" value={form.nombre} placeholder="Razón social *" onChange={handleChange} error={errores.nombre} />
          <Input name="nombre_comercial" value={form.nombre_comercial} placeholder="Nombre comercial" onChange={handleChange} />
          <Input name="nit" value={form.nit} placeholder="NIT *" onChange={handleChange} error={errores.nit} />
          <Input name="nrc" value={form.nrc} placeholder="NRC *" onChange={handleChange} error={errores.nrc} />
          <Select
            name="cod_actividad"
            value={form.cod_actividad}
            placeholder="Seleccione Actividad Económica (CAT-019) *"
            options={CAT_ACTIVIDAD_ECONOMICA.map((a) => ({
              codigo: a.codigo,
              descripcion: `${a.codigo} - ${a.descripcion}`,
            }))}
            onChange={handleChange}
            error={errores.cod_actividad}
          />
          <Input name="correo" value={form.correo} placeholder="Correo electrónico" onChange={handleChange} error={errores.correo} />
          <Input
            label="Teléfono"
            name="telefono"
            value={form.telefono}
            placeholder="Teléfono (ej. 7000-0000) *"
            onChange={handleChange}
            error={errores.telefono}
          />
        </div>

        {/* Ubicación Territorial V2.0 (Departamento, Municipio, Distrito) */}
        <div className="pt-2">
          <SelectorUbicacion
            departamento={form.departamento}
            municipio={form.municipio}
            distrito={form.distrito}
            onChange={({ departamento, municipio, distrito }) => {
              setForm(prev => ({ ...prev, departamento, municipio, distrito }));
            }}
          />
        </div>
        <textarea
          name="direccion"
          value={form.direccion || ""}
          placeholder="Dirección fiscal *"
          rows={3}
          onChange={handleChange}
          className={`w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 ${errores.direccion ? "border-red-500 focus:ring-red-400" : "border-gray-300 focus:ring-blue-500"}`}
        />
        {errores.direccion && <p className="text-xs text-red-600">{errores.direccion}</p>}
      </section>

      {/* ===== CERTIFICADO ===== */}
      <section className="bg-white rounded-2xl shadow-sm border p-6 space-y-4">
        <h3 className="text-gray-900 text-lg font-semibold">Certificado de firma</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input type="file" name="certificado" accept=".p12,.pem" onChange={handleChange} />
          <Input type="password" name="passwordCertificado" value={form.passwordCertificado} placeholder="Password del certificado" onChange={handleChange} />
        </div>
        <p className="text-xs text-gray-500">El certificado se almacena de forma segura en el servidor.</p>
      </section>

      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={!sistemaListo || loading}
          className={`px-6 py-3 rounded-xl font-semibold transition ${sistemaListo ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}
        >
          {loading ? "Guardando..." : "Guardar configuración"}
        </button>
      </div>
    </div>
  );
}
