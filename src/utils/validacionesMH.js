// src/utils/validacionesMH.js

/**
 * Sanitiza cualquier valor dejando ÚNICAMENTE dígitos numéricos (0-9).
 * Elimina abecedario (letras a-z, A-Z), caracteres especiales y cualquier
 * símbolo usado para inyección SQL (', ", ;, --, /*, =, etc.).
 */
export function sanitizarSoloNumeros(valor, maxLength = null) {
  if (valor === null || valor === undefined) return "";
  const soloDigitos = String(valor).replace(/\D/g, "");
  return maxLength ? soloDigitos.slice(0, maxLength) : soloDigitos;
}

/**
 * Validador para eventos onKeyDown que bloquea inmediatamente el ingreso de
 * letras del abecedario, caracteres especiales y símbolos de inyección SQL.
 * Solo permite dígitos 0-9 y teclas de control de navegación/edición.
 */
export function prevenirNoNumerico(e) {
  // Permitir teclas especiales y de navegación
  if (
    e.key === "Backspace" ||
    e.key === "Tab" ||
    e.key === "Delete" ||
    e.key === "ArrowLeft" ||
    e.key === "ArrowRight" ||
    e.key === "ArrowUp" ||
    e.key === "ArrowDown" ||
    e.key === "Home" ||
    e.key === "End" ||
    e.key === "Enter" ||
    // Permitir atajos con Ctrl o Meta (Cmd en Mac): Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+Z
    (e.ctrlKey || e.metaKey)
  ) {
    return;
  }

  // Si no es un dígito del 0 al 9, bloquear el evento
  if (!/^[0-9]$/.test(e.key)) {
    e.preventDefault();
  }
}

/**
 * Valida DUI salvadoreño: debe contener exactamente 9 dígitos numéricos.
 * Puede ser en formato continuo (000000000) o con guion (00000000-0).
 */
export function validarDUI(dui) {
  if (!dui) return false;
  const limpio = String(dui).trim();
  // Formato continuo 9 dígitos o con guion antes del dígito verificador
  return /^\d{9}$/.test(limpio) || /^\d{8}-\d{1}$/.test(limpio);
}

/**
 * Valida NRC salvadoreño: 1 a 8 dígitos numéricos exclusivamente.
 */
export function validarNRC(nrc) {
  if (!nrc) return false;
  const limpio = String(nrc).trim();
  const regex = /^\d{1,8}$/;
  return regex.test(limpio);
}

/**
 * Valida NIT salvadoreño:
 * - 14 dígitos con guiones: 0000-000000-000-0
 * - 14 dígitos continuos: 00000000000000
 * - 9 dígitos continuos (DUI homologado)
 */
export function validarNIT(nit) {
  if (!nit) return false;
  const limpio = String(nit).trim();
  const regexConGuiones = /^\d{4}-\d{6}-\d{3}-\d{1}$/;
  const regexContinuo14 = /^\d{14}$/;
  const regexContinuo9 = /^\d{9}$/;
  return regexConGuiones.test(limpio) || regexContinuo14.test(limpio) || regexContinuo9.test(limpio);
}

/**
 * Detecta si una cadena contiene caracteres o patrones típicos de inyección SQL
 */
export function contieneInyeccionSQL(texto) {
  if (!texto) return false;
  const patronesPeligrosos = /('|--|;|\/\*|\*\/|xp_|sp_|exec|execute|select|insert|update|delete|drop|union|truncate|declare|<|>)/i;
  return patronesPeligrosos.test(texto);
}

export function validarEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

export function validarLongitud(valor, min, max) {
  if (!valor) return false;
  return valor.length >= min && valor.length <= max;
}

