import {
  Empleado,
  Proyecto,
  Solicitud,
  Prueba,
  RegistroHoras,
  Documento,
  AuditoriaRegistro,
} from '../types';

export const INITIAL_EMPLEADOS: Empleado[] = [];

export const INITIAL_SOLICITUDES: Solicitud[] = [
  {
    id: 'sol-1',
    codigo: 'SOL-2026-001',
    fechaSolicitud: '2026-11-02',
    solicitante: 'Javier Pons',
    departamentoSolicitante: 'Comercial',
    nombreSolicitud: 'Brioche Hojaldrado Relleno de Crema de Pistacho Bronte',
    descripcion: 'Petición de cliente de hostelería premium para desarrollar una pieza de bollería hojaldrada individual congelada en crudo, con relleno inyectable resistente al horneado sin fugas de crema.',
    familia: 'Bollería',
    tipoTrabajo: 'Nuevo desarrollo',
    cliente: 'Restauración & Hoteles Boutique',
    fechaEntregaDeseada: '2026-12-15',
    prioridad: 'Alta',
    estado: 'Pendiente de evaluación',
    responsableEvaluacion: '',
    observaciones: 'Evaluando formulación de crema termorresistente con almidón modificado limpio.',
  },
];

export const INITIAL_PROYECTOS: Proyecto[] = [
  {
    id: 'pro-1',
    codigo: 'PRO-2026-001',
    nombre: 'Croissant Mantequilla DOP Charentes 36 Capas (Alveolado Abierto)',
    descripcion: 'Optimización de formulación, fermentación en bloque a 4°C y técnica de plegado (simple + doble) para lograr un laminado abierto nido de abeja, ligero y con crocancia persistente.',
    familia: 'Bollería',
    subfamilia: 'Hojaldre fermentado',
    tipoProyecto: 'Mejora de producto',
    responsableId: '',
    colaboradoresIds: [],
    prioridad: 'Alta',
    fechaInicioPrevista: '2026-10-20',
    fechaInicioReal: '2026-10-20',
    fechaFinalPrevista: '2026-11-28',
    estado: 'En curso',
    porcentajeAvance: 75,
    horasEstimadas: 40,
    cliente: 'Grandes Hoteles Boutique S.L.',
    imagenUrl: '/src/assets/images/croissant_lamination_test_1793345111616.jpg',
  },
];

export const INITIAL_PRUEBAS: Prueba[] = [
  {
    id: 'pru-1',
    proyectoId: 'pro-1',
    codigo: 'PRU-2026-001',
    numeroPrueba: 1,
    nombrePrueba: 'Ensayo #1: Hidratación 58%, reposo en bloque 16h y laminado (24 capas)',
    fechaRealizacion: '2026-10-28',
    responsableId: '',
    objetivo: 'Evaluar desarrollo de volumen, alveolado nido de abeja y conservación de textura crujiente tras 6 horas en vitrina.',
    formulacion: [
      { id: 'f-1', ingrediente: 'Harina T45 Fuerza W340', cantidadGramos: 1000, porcentajeBakers: 100, costeKg: 1.45 },
      { id: 'f-2', ingrediente: 'Agua fría + Leche entera (50/50)', cantidadGramos: 580, porcentajeBakers: 58, costeKg: 0.65 },
      { id: 'f-3', ingrediente: 'Mantequilla Charentes DOP 84%', cantidadGramos: 520, porcentajeBakers: 52, costeKg: 8.9 },
      { id: 'f-4', ingrediente: 'Miel de azahar (humectante natural)', cantidadGramos: 20, porcentajeBakers: 2, costeKg: 7.5 },
      { id: 'f-5', ingrediente: 'Azúcar blanquilla', cantidadGramos: 100, porcentajeBakers: 10, costeKg: 0.95 },
      { id: 'f-6', ingrediente: 'Sal marina fina', cantidadGramos: 20, porcentajeBakers: 2, costeKg: 0.4 },
      { id: 'f-7', ingrediente: 'Levadura fresca prensada', cantidadGramos: 38, porcentajeBakers: 3.8, costeKg: 2.2 },
    ],
    modificacionesRealizadas: 'Incorporación de leche entera para mejorar dorado y elasticidad. Laminado a 3.5mm de espesor en cámara fría.',
    resultado: 'Satisfactorio',
    evaluacionSensorial: {
      textura: 9.2,
      sabor: 9.4,
      aspectoVisual: 9.5,
      aroma: 9.5,
      estabilidad: 9.0,
      comentarios: 'Alveolado extraordinario, corte limpio en nido de abeja, hojaldrado exterior crujiente y aroma láctico puro.',
    },
    incidencias: 'Ninguna incidencia en máquina ni desgarro de masa.',
    fotografias: ['/src/assets/images/croissant_lamination_test_1793345111616.jpg'],
    proximosAjustes: 'Elaborar ficha técnica industrial y transferir parámetros de horneado a obrador central.',
    fechaValidacion: '2026-10-30',
    pruebaAprobada: true,
  },
];

export const INITIAL_REGISTRO_HORAS: RegistroHoras[] = [
  {
    id: 'h-1',
    fecha: '2026-10-28',
    empleadoId: '',
    proyectoId: 'pro-1',
    pruebaId: 'pru-1',
    tarea: 'Laminado en frío, fermentación controlada y horneado de ensayo',
    tipoActividad: 'Elaboración de pruebas',
    horaInicio: '08:30',
    horaFin: '13:30',
    tiempoHoras: 5.0,
    observaciones: 'Prueba de horneado escalonado con tiro cerrado 10m y tiro abierto 8m.',
  },
];

export const INITIAL_DOCUMENTOS: Documento[] = [
  {
    id: 'doc-1',
    nombre: 'FT-CRO-001 Ficha Técnica Croissant Charentes DOP',
    proyectoId: 'pro-1',
    pruebaId: 'pru-1',
    tipoDocumento: 'Ficha técnica',
    fechaCreacion: '2026-10-30',
    responsableId: '',
    version: 'v1.0',
    formato: 'PDF',
    tamano: '2.4 MB',
    estadoDocumental: 'Validado',
    observaciones: 'Ficha técnica definitiva aprobada tras ensayo #1 con parámetros de amasado, curvas de horneado y tabla de alérgenos.',
  },
];

export const INITIAL_AUDITORIA: AuditoriaRegistro[] = [
  {
    id: 'aud-1',
    fecha: '2026-10-30 11:30',
    usuario: 'Responsable I+D+i',
    entidad: 'Prueba',
    entidadId: 'pru-1',
    entidadCodigo: 'PRU-2026-001',
    accion: 'Aprobación',
    detalle: 'Ensayo #1 marcado como Aprobado con dictamen sensorial satisfactorio (9.3/10).',
  },
];
