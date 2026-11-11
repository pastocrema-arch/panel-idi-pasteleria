export type ProductFamily =
  | 'Bollería'
  | 'Panadería'
  | 'Bombonería y chocolate'
  | 'Tartas'
  | 'Pastelería individual'
  | 'Postres'
  | 'Catering'
  | 'Heladería'
  | 'Otros';

export type ProjectType =
  | 'Nuevo desarrollo'
  | 'Mejora de producto'
  | 'Reformulación'
  | 'Adaptación de formato'
  | 'Desarrollo para cliente'
  | 'Innovación tecnológica'
  | 'Industrialización'
  | 'Investigación de materias primas';

export type Priority = 'Baja' | 'Media' | 'Alta' | 'Urgente';

export type RequestStatus =
  | 'Nueva solicitud'
  | 'Pendiente de evaluación'
  | 'Aceptada'
  | 'Rechazada'
  | 'Convertida en proyecto';

export type ProjectStatus =
  | 'Pendiente'
  | 'En curso'
  | 'En validación'
  | 'Finalizado'
  | 'Cancelado';

export type ActivityType =
  | 'Investigación'
  | 'Desarrollo de recetas'
  | 'Elaboración de pruebas'
  | 'Catas y evaluaciones'
  | 'Reuniones'
  | 'Documentación'
  | 'Escandallos'
  | 'Coordinación'
  | 'Industrialización';

export type DocumentType =
  | 'Briefing de solicitud'
  | 'Receta inicial'
  | 'Receta modificada'
  | 'Formulación definitiva'
  | 'Ficha técnica'
  | 'Escandallo'
  | 'Ficha de alérgenos'
  | 'Fotografías'
  | 'Informe de pruebas'
  | 'Evaluación sensorial'
  | 'Propuesta comercial'
  | 'Documento de industrialización'
  | 'Validación final';

export type DocumentStatus = 'Borrador' | 'Validado' | 'Obsoleto';

export interface Solicitud {
  id: string;
  codigo: string;
  fechaSolicitud: string;
  solicitante: string;
  departamentoSolicitante: 'Comercial' | 'Producción' | 'Dirección' | 'Marketing' | 'Calidad' | 'Clientes';
  nombreSolicitud: string;
  descripcion: string;
  familia: ProductFamily;
  tipoTrabajo: ProjectType;
  cliente?: string;
  fechaEntregaDeseada: string;
  prioridad: Priority;
  documentacionAdjunta?: string[];
  estado: RequestStatus;
  responsableEvaluacion?: string;
  fechaAceptacion?: string;
  observaciones?: string;
  proyectoAsociadoId?: string;
}

export interface Proyecto {
  id: string;
  codigo: string;
  nombre: string;
  solicitudOrigenId?: string;
  descripcion: string;
  familia: ProductFamily;
  subfamilia: string;
  tipoProyecto: ProjectType;
  responsableId: string;
  colaboradoresIds: string[];
  prioridad: Priority;
  fechaInicioPrevista: string;
  fechaInicioReal?: string;
  fechaFinalPrevista: string;
  fechaFinalReal?: string;
  estado: ProjectStatus;
  porcentajeAvance: number;
  horasEstimadas: number;
  resultadoFinal?: string;
  fechaCierre?: string;
  motivoCancelacion?: string;
  imagenUrl?: string;
  cliente?: string;
}

export interface FormulationItem {
  id: string;
  ingrediente: string;
  cantidadGramos: number;
  porcentajeBakers?: number; // % panadero sobre base de harina
  costeKg?: number;
  alérgeno?: string;
}

export interface SensoryEvaluation {
  textura: number; // 1 to 10
  sabor: number;
  aspectoVisual: number;
  aroma: number;
  estabilidad: number;
  comentarios: string;
}

export interface Prueba {
  id: string;
  proyectoId: string;
  codigo: string;
  numeroPrueba: number;
  nombrePrueba: string;
  fechaRealizacion: string;
  responsableId: string;
  objetivo: string;
  formulacion: FormulationItem[];
  formulacionNotas?: string;
  modificacionesRealizadas: string;
  resultado: 'Satisfactorio' | 'Ajustar parámetros' | 'Rechazado' | 'Pendiente cata';
  evaluacionSensorial: SensoryEvaluation;
  incidencias?: string;
  fotografias: string[];
  proximosAjustes?: string;
  fechaValidacion?: string;
  pruebaAprobada: boolean;
}

export interface RegistroHoras {
  id: string;
  fecha: string;
  empleadoId: string;
  proyectoId: string;
  tarea?: string;
  pruebaId?: string;
  tipoActividad: ActivityType;
  horaInicio: string;
  horaFin: string;
  tiempoHoras: number;
  observaciones?: string;
}

export interface Documento {
  id: string;
  nombre: string;
  proyectoId: string;
  pruebaId?: string;
  tipoDocumento: DocumentType;
  fechaCreacion: string;
  responsableId: string;
  version: string;
  formato: 'PDF' | 'Excel' | 'Word' | 'Imagen' | 'JSON';
  url?: string;
  tamano?: string;
  observaciones?: string;
  estadoDocumental: DocumentStatus;
}

export interface Empleado {
  id: string;
  nombre: string;
  apellidos: string;
  departamento: string;
  cargo: string;
  email: string;
  horasSemanales: number;
  especialidades: string[];
  activo: boolean;
  avatarUrl?: string;
}

export interface AuditoriaRegistro {
  id: string;
  fecha: string;
  usuario: string;
  entidad: 'Proyecto' | 'Solicitud' | 'Prueba' | 'Documento' | 'Horas' | 'Equipo';
  entidadId: string;
  entidadCodigo?: string;
  accion: 'Creación' | 'Cambio de estado' | 'Modificación' | 'Aprobación' | 'Validación' | 'Cierre' | 'Registro de horas';
  detalle: string;
}
