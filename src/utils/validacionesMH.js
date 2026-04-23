// src/utils/validacionesMH.js

export function validarNIT(nit) {
  // Formato: 0000-000000-000-0
  const regex = /^\d{4}-\d{6}-\d{3}-\d{1}$/;
  return regex.test(nit);
}

export function validarNRC(nrc) {
  // NRC: solo números, 1 a 8 dígitos
  const regex = /^\d{1,8}$/;
  return regex.test(nrc);
}

export function validarEmail(email) {
  const regex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

export function validarLongitud(valor, min, max) {
  if (!valor) return false;
  return valor.length >= min && valor.length <= max;
}
