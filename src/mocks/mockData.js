export const mockVehicle = {
  id: 1,
  name: 'Kawasaki Z900',
  plate: 'ABC-123',
  status: 'armed', // armed | disarmed | valet | emergency
  battery: 87,
  location: { lat: -12.0464, lng: -77.0428, address: 'Av. Javier Prado Este, 42' },
  speed: 0,
  signal: 'strong', // strong | medium | weak
  connected: true,
  lastSeen: new Date(),
};

export const mockAlerts = [
  { id: 1, type: 'Robo', status: 'pendiente', time: '14:26', distance: '450m', severity: 'high' },
  { id: 2, type: 'Batería Baja', status: 'activo', time: '13:15', distance: null, severity: 'medium' },
  { id: 3, type: 'Zona de Riesgo', status: 'resuelto', time: '12:05', distance: '1.2km', severity: 'low' },
  { id: 4, type: 'Movimiento Detectado', status: 'pendiente', time: '11:48', distance: null, severity: 'high' },
];

export const mockRoutes = [
  { id: 1, date: '12 Oct, 2023', origin: 'PRX-9AAS', destination: 'MX-77126', distance: '43.5 km', duration: '1h 12m', alerts: 0, status: 'COMPLETADO' },
  { id: 2, date: '10 Oct, 2023', origin: 'PRX-7712', destination: 'LA-0928', distance: '12.4 km', duration: '28m', alerts: 1, status: 'ALERTA' },
  { id: 3, date: '08 Oct, 2023', origin: 'PRX-1122', destination: 'MX-77126', distance: '104.0 km', duration: '2h 45m', alerts: 0, status: 'COMPLETADO' },
];

export const mockUsers = [
  { id: 1, name: 'Carlos Mendoza', device: 'Kawasaki-98881', status: 'VINCULADO', battery: '#MG-99812' },
  { id: 2, name: 'Elena Ríos', device: 'Renault-771126', status: 'VINCULADO', battery: '#MG-77126' },
  { id: 3, name: 'Javier Soler', device: 'NUEVO DISPOSITIVO', status: 'PENDIENTE', battery: '#MG-11490' },
];

export const mockTelemetry = {
  latency: '1.24s',
  activeDevices: 1429,
  slaPerformance: '99.98%',
  dataTransfer: '2.4GB/h',
  activeSessions: 841,
  systemHealth: 'HEALTHY',
  uptime: '0.8m',
  chartData: [
    { time: '00:00', value: 20 }, { time: '04:00', value: 35 },
    { time: '08:00', value: 80 }, { time: '12:00', value: 60 },
    { time: '16:00', value: 90 }, { time: '20:00', value: 45 },
    { time: '24:00', value: 30 },
  ]
};

export const mockRiskZones = [
  { id: 1, name: 'Zona de Alta Incidencia', distance: 'A 450m de tu posición', time: '14:26', color: '#e03030', lat: -12.048, lng: -77.041 },
  { id: 2, name: 'Punto de Control Seguro', distance: 'A 1.2km de tu posición', time: '12:05', color: '#00c8c8', lat: -12.052, lng: -77.048 },
];