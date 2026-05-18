const ZONA_HORARIA = Intl.DateTimeFormat().resolvedOptions().timeZone;

export const fmtDateTime = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleString('es-PE', {
    timeZone:  ZONA_HORARIA,
    day:       '2-digit',
    month:     '2-digit',
    year:      'numeric',
    hour:      '2-digit',
    minute:    '2-digit',
  });
};

export const fmtDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('es-PE', {
    timeZone: ZONA_HORARIA,
    day:      '2-digit',
    month:    '2-digit',
    year:     'numeric',
  });
};

export const fmtTime = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleTimeString('es-PE', {
    timeZone: ZONA_HORARIA,
    hour:     '2-digit',
    minute:   '2-digit',
  });
};