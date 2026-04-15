// Piura, Peru — centro: -5.1945, -80.6328
export const mockVehicle = {
  id: 1,
  name: 'Kawasaki Z900',
  plate: 'ABC-123',
  status: 'armed',
  battery: 87,
  location: { lat: -5.1945, lng: -80.6328, address: 'Av. Grau 342, Piura' },
  speed: 0,
  signal: 'strong',
  connected: true,
  lastSeen: new Date(),
};

export const mockAlerts = [
  { id: 1, type: 'Robo reportado', status: 'pendiente', time: '14:26', distance: '450m', severity: 'high' },
  { id: 2, type: 'Batería Baja', status: 'activo', time: '13:15', distance: null, severity: 'medium' },
  { id: 3, type: 'Zona de Riesgo', status: 'resuelto', time: '12:05', distance: '1.2km', severity: 'low' },
  { id: 4, type: 'Movimiento Detectado', status: 'pendiente', time: '11:48', distance: null, severity: 'high' },
];

export const mockRoutes = [
  { id: 1, date: '12 Oct, 2023', origin: 'Av. Grau', destination: 'Mercado Central', distance: '4.2 km', duration: '18m', alerts: 0, status: 'COMPLETADO' },
  { id: 2, date: '10 Oct, 2023', origin: 'Los Cocos', destination: 'Castilla',        distance: '7.8 km', duration: '32m', alerts: 1, status: 'ALERTA' },
  { id: 3, date: '08 Oct, 2023', origin: 'Urb. Miraflores', destination: 'El Chipe',  distance: '9.1 km', duration: '41m', alerts: 0, status: 'COMPLETADO' },
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
  ],
};

// Piura risk zones — lat/lng around city center
export const mockRiskZones = [
  { id: 1, name: 'Mercado Central', distance: 'A 450m de tu posición', time: '14:26', color: '#e03030', severity: 'high',   lat: -5.1980, lng: -80.6350 },
  { id: 2, name: 'Av. Sánchez Cerro', distance: 'A 700m de tu posición', time: '13:10', color: '#f0a500', severity: 'medium', lat: -5.1900, lng: -80.6280 },
  { id: 3, name: 'Parque Infantil',  distance: 'A 1.1km de tu posición', time: '11:00', color: '#20c45a', severity: 'low',    lat: -5.1860, lng: -80.6400 },
  { id: 4, name: 'Jr. Loreto',       distance: 'A 300m de tu posición',  time: '09:45', color: '#e03030', severity: 'high',   lat: -5.1965, lng: -80.6300 },
  { id: 5, name: 'Urb. Los Cocos',   distance: 'A 900m de tu posición',  time: '08:20', color: '#f0a500', severity: 'medium', lat: -5.1920, lng: -80.6450 },
];

// Heatmap points — dense cluster = danger
export const mockHeatPoints = [
  // High risk cluster — Mercado
  { lat: -5.198, lng: -80.635, weight: 1.0 },
  { lat: -5.199, lng: -80.634, weight: 0.9 },
  { lat: -5.197, lng: -80.636, weight: 0.85 },
  { lat: -5.200, lng: -80.633, weight: 0.8 },
  { lat: -5.196, lng: -80.637, weight: 0.75 },
  // Medium risk — Sánchez Cerro
  { lat: -5.190, lng: -80.628, weight: 0.6 },
  { lat: -5.191, lng: -80.627, weight: 0.55 },
  { lat: -5.189, lng: -80.629, weight: 0.5 },
  // Jr Loreto
  { lat: -5.197, lng: -80.630, weight: 0.9 },
  { lat: -5.196, lng: -80.631, weight: 0.85 },
  // Safe zone — park
  { lat: -5.186, lng: -80.640, weight: 0.15 },
  { lat: -5.185, lng: -80.641, weight: 0.10 },
  // Scattered medium
  { lat: -5.193, lng: -80.640, weight: 0.45 },
  { lat: -5.195, lng: -80.625, weight: 0.5 },
  { lat: -5.202, lng: -80.630, weight: 0.7 },
];

// Mock ficticias routes polylines en Piura
export const mockRoutePaths = [
  {
    id: 'r1', label: 'Ruta Av. Grau → Mercado', severity: 'high', color: '#e03030',
    points: [[-5.1945,-80.6328],[-5.1960,-80.6340],[-5.1975,-80.6345],[-5.1980,-80.6350]],
  },
  {
    id: 'r2', label: 'Ruta Los Cocos → Castilla', severity: 'medium', color: '#f0a500',
    points: [[-5.1920,-80.6450],[-5.1910,-80.6380],[-5.1905,-80.6320],[-5.1900,-80.6280]],
  },
  {
    id: 'r3', label: 'Ruta Miraflores → El Chipe', severity: 'low', color: '#20c45a',
    points: [[-5.1945,-80.6328],[-5.1890,-80.6360],[-5.1870,-80.6390],[-5.1860,-80.6400]],
  },
];

// Shared incidents (simulates backend shared data)
export const mockIncidents = [
  { id: 'i1', user: 'Carlos M.', reason: 'Robo de moto en la zona', lat: -5.1980, lng: -80.6350, time: '14:26', verified: 3 },
  { id: 'i2', user: 'Elena R.',  reason: 'Presencia sospechosa',    lat: -5.1965, lng: -80.6300, time: '11:48', verified: 1 },
];

export const mockUsers = [
  { id: 1, name: 'Carlos Mendoza', device: 'Kawasaki-98881', status: 'VINCULADO', battery: '#MG-99812' },
  { id: 2, name: 'Elena Ríos',     device: 'Renault-771126', status: 'VINCULADO', battery: '#MG-77126' },
  { id: 3, name: 'Javier Soler',   device: 'NUEVO DISPOSITIVO', status: 'PENDIENTE', battery: '#MG-11490' },
];