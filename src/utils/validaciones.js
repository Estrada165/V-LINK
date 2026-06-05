/* ── MOTOGUARD — Validaciones de formularios ─────────────────
   Usar: import { validarTelefono, validarCorreo } from '../../utils/validaciones';
   Cada función devuelve string con el error o null si es válido
──────────────────────────────────────────────────────────── */

export const validarTelefono = (tel) => {
  if (!tel || tel.trim() === '') return 'El teléfono es obligatorio';
  if (!/^\d+$/.test(tel.trim()))   return 'El teléfono solo debe contener números';
  if (!/^9\d{8}$/.test(tel.trim())) return 'El teléfono debe empezar con 9 y tener 9 dígitos';
  return null;
};

export const validarCorreo = (correo) => {
  if (!correo || correo.trim() === '') return 'El correo es obligatorio';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(correo.trim())) return 'Ingresa un correo válido (ej: nombre@dominio.com)';
  return null;
};

export const validarPassword = (pass) => {
  if (!pass || pass === '') return 'La contraseña es obligatoria';
  if (pass.length < 8)       return 'La contraseña debe tener mínimo 8 caracteres';
  if (!/[A-Z]/.test(pass))   return 'Debe contener al menos una letra mayúscula';
  if (!/\d/.test(pass))      return 'Debe contener al menos un número';
  return null;
};

export const validarPasswordConfirm = (pass, confirm) => {
  if (!confirm || confirm === '') return 'Confirma tu contraseña';
  if (pass !== confirm)            return 'Las contraseñas no coinciden';
  return null;
};

export const validarNombre = (nombre) => {
  if (!nombre || nombre.trim() === '')   return 'El nombre es obligatorio';
  if (nombre.trim().length < 3)          return 'El nombre debe tener al menos 3 caracteres';
  if (nombre.trim().length > 100)        return 'El nombre no puede superar 100 caracteres';
  if (/\d/.test(nombre))                 return 'El nombre no puede contener números';
  if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(nombre.trim())) return 'El nombre solo puede contener letras';
  return null;
};

export const validarPlaca = (placa) => {
  if (!placa || placa.trim() === '') return 'La placa es obligatoria';
  const limpia = placa.trim().toUpperCase();
  if (!/^[A-Z]{3}-\d{3}$/.test(limpia)) return 'Formato de placa inválido. Ejemplo: ABC-123';
  return null;
};

export const validarAnio = (anio) => {
  const anioActual = new Date().getFullYear();
  if (!anio || anio === '')           return 'El año es obligatorio';
  if (!/^\d{4}$/.test(String(anio))) return 'El año debe tener 4 dígitos';
  const num = parseInt(anio);
  if (num < 1990)                     return 'El año no puede ser menor a 1990';
  if (num > anioActual + 1)           return `El año no puede ser mayor a ${anioActual + 1}`;
  return null;
};

export const validarCilindraje = (cc) => {
  if (!cc || cc === '')        return 'El cilindraje es obligatorio';
  if (!/^\d+$/.test(String(cc))) return 'El cilindraje solo debe contener números';
  const num = parseInt(cc);
  if (num < 50)   return 'El cilindraje mínimo es 50cc';
  if (num > 3000) return 'El cilindraje máximo es 3000cc';
  return null;
};

export const validarMarca = (marca) => {
  if (!marca || marca.trim() === '') return 'La marca es obligatoria';
  if (marca.trim().length < 2)       return 'La marca debe tener al menos 2 caracteres';
  if (/^\d+$/.test(marca.trim()))    return 'La marca no puede ser solo números';
  return null;
};

export const validarModelo = (modelo) => {
  if (!modelo || modelo.trim() === '') return 'El modelo es obligatorio';
  if (modelo.trim().length < 2)        return 'El modelo debe tener al menos 2 caracteres';
  return null;
};

export const validarColor = (color) => {
  if (!color || color.trim() === '') return 'El color es obligatorio';
  if (/\d/.test(color))              return 'El color no puede contener números';
  return null;
};

export const validarTitulo = (titulo, min = 5, max = 100) => {
  if (!titulo || titulo.trim() === '') return 'El título es obligatorio';
  if (titulo.trim().length < min)      return `El título debe tener al menos ${min} caracteres`;
  if (titulo.trim().length > max)      return `El título no puede superar ${max} caracteres`;
  return null;
};

export const validarDescripcion = (desc, min = 10, max = 1000) => {
  if (!desc || desc.trim() === '') return 'La descripción es obligatoria';
  if (desc.trim().length < min)    return `La descripción debe tener al menos ${min} caracteres`;
  if (desc.trim().length > max)    return `La descripción no puede superar ${max} caracteres`;
  return null;
};

export const validarFecha = (fecha) => {
  if (!fecha || fecha === '') return 'La fecha es obligatoria';
  const d = new Date(fecha);
  if (isNaN(d.getTime()))     return 'Fecha inválida';
  return null;
};

export const validarRangoDeFechas = (desde, hasta) => {
  if (!desde || !hasta) return 'Ambas fechas son obligatorias';
  if (new Date(desde) > new Date(hasta)) return 'La fecha de inicio no puede ser mayor a la fecha fin';
  return null;
};

export const validarNumeroPositivo = (val, campo) => {
  if (val === '' || val === null || val === undefined) return `${campo} es obligatorio`;
  if (!/^\d+$/.test(String(val)))                     return `${campo} solo acepta números enteros`;
  if (parseInt(val) < 0)                               return `${campo} no puede ser negativo`;
  return null;
};

export const validarArea = (area) => {
  if (!area || area.trim() === '') return null;
  if (area.trim().length < 3)      return 'El área debe tener al menos 3 caracteres';
  if (/^\d+$/.test(area.trim()))   return 'El área no puede ser solo números';
  return null;
};

export const validarContactoEmergencia = (nombre, telefono) => {
  return {
    nombre:   validarNombre(nombre),
    telefono: validarTelefono(telefono),
  };
};

export const hayErrores = (errores) =>
  Object.values(errores).some(v => v !== null && v !== undefined && v !== '');