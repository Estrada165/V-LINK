const TZ = Intl.DateTimeFormat().resolvedOptions().timeZone;

export const fmtDateTime = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleString('es-PE', {
    timeZone: TZ,
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

export const fmtDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('es-PE', {
    timeZone: TZ,
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
};

export const fmtTime = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleTimeString('es-PE', {
    timeZone: TZ,
    hour: '2-digit', minute: '2-digit',
  });
};