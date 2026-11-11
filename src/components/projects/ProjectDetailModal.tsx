import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Proyecto,
  Prueba,
  RegistroHoras,
  Documento,
  ProjectStatus,
  ActivityType,
} from '../../types';
import {
  X,
  Calendar,
  Clock,
  Users,
  FlaskConical,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Plus,
  ArrowRight,
  TrendingUp,
  FileCheck,
  Star,
  ExternalLink,
  SlidersHorizontal,
} from 'lucide-react';

interface ProjectDetailModalProps {
  projectId: string;
  initialTab?: string;
  onClose: () => void;
  onOpenNewTrial: (projectId: string) => void;
  onOpenCompareTrials: (projectId: string) => void;
  onOpenNewTimeEntry: (projectId: string) => void;
  onOpenNewDocument: (projectId: string) => void;
  onEditProject: (proyecto: Proyecto) => void;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  projectId,
  initialTab = 'general',
  onClose,
  onOpenNewTrial,
  onOpenCompareTrials,
  onOpenNewTimeEntry,
  onOpenNewDocument,
  onEditProject,
}) => {
  const {
    proyectos,
    pruebas,
    registrosHoras,
    documentos,
    empleados,
    solicitudes,
    auditoria,
    updateProyecto,
    updatePrueba,
    getEmpleado,
    getProjectActualHours,
  } = useApp();

  const [activeTab, setActiveTab] = useState(initialTab);
  const proyecto = proyectos.find((p) => p.id === projectId);

  if (!proyecto) return null;

  const projectTrials = pruebas.filter((p) => p.proyectoId === proyecto.id);
  const projectHours = registrosHoras.filter((h) => h.proyectoId === proyecto.id);
  const projectDocs = documentos.filter((d) => d.proyectoId === proyecto.id);
  const projectAudit = auditoria.filter((a) => a.entidadId === proyecto.id || a.entidadCodigo === proyecto.codigo);

  const responsable = getEmpleado(proyecto.responsableId);
  const colaboradores = proyecto.colaboradoresIds
    .map((id) => getEmpleado(id))
    .filter(Boolean);

  const totalHorasReales = getProjectActualHours(proyecto.id);
  const horasRestantes = Math.max(0, proyecto.horasEstimadas - totalHorasReales);

  const today = new Date();
  const fechaFin = new Date(proyecto.fechaFinalPrevista);
  const isOverdue =
    proyecto.estado !== 'Finalizado' &&
    proyecto.estado !== 'Cancelado' &&
    fechaFin < today;

  const diffDays = Math.ceil((fechaFin.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  const originRequest = proyecto.solicitudOrigenId
    ? solicitudes.find((s) => s.id === proyecto.solicitudOrigenId)
    : null;

  const [avanceInput, setAvanceInput] = useState(proyecto.porcentajeAvance);
  const [closureNotes, setClosureNotes] = useState(proyecto.resultadoFinal || '');

  const handleUpdateStatus = (newStatus: ProjectStatus) => {
    updateProyecto(proyecto.id, { estado: newStatus });
  };

  const handleSaveProgress = () => {
    updateProyecto(proyecto.id, { porcentajeAvance: Number(avanceInput) });
  };

  const handleSaveClosure = () => {
    updateProyecto(proyecto.id, {
      resultadoFinal: closureNotes,
      fechaCierre: new Date().toISOString().substring(0, 10),
      estado: 'Finalizado',
      porcentajeAvance: 100,
    });
  };

  const tabs = [
    { id: 'general', label: 'Datos generales' },
    { id: 'planificacion', label: 'Planificación' },
    { id: 'equipo', label: 'Equipo' },
    { id: 'pruebas', label: `Pruebas (${projectTrials.length})` },
    { id: 'horas', label: `Horas (${totalHorasReales}h)` },
    { id: 'documentos', label: `Documentación (${projectDocs.length})` },
    { id: 'cierre', label: 'Validación y cierre' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl border border-slate-200 overflow-hidden my-6 max-h-[92vh] flex flex-col">
        {/* Modal Top Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/80 flex items-start justify-between gap-4 shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-mono font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                {proyecto.codigo}
              </span>
              <span className="text-slate-400">/</span>
              <span className="font-medium text-slate-700">{proyecto.familia}</span>
              <span className="text-slate-400">/</span>
              <span className="text-slate-600">{proyecto.subfamilia}</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              {proyecto.nombre}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Status Selector */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500 font-medium">Estado:</span>
              <select
                value={proyecto.estado}
                onChange={(e) => handleUpdateStatus(e.target.value as ProjectStatus)}
                className={`text-xs font-semibold px-2.5 py-1 rounded-lg border focus:outline-none ${
                  proyecto.estado === 'Finalizado'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : proyecto.estado === 'En validación'
                    ? 'bg-purple-50 text-purple-800 border-purple-300'
                    : proyecto.estado === 'En curso'
                    ? 'bg-amber-50 text-amber-900 border-amber-300'
                    : 'bg-slate-100 text-slate-700 border-slate-300'
                }`}
              >
                <option value="Pendiente">Pendiente</option>
                <option value="En curso">En curso</option>
                <option value="En validación">En validación</option>
                <option value="Finalizado">Finalizado</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </div>

            <button
              onClick={() => onEditProject(proyecto)}
              className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-2xs"
            >
              Editar Ficha
            </button>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation Strip */}
        <div className="flex items-center gap-1 px-6 border-b border-slate-200 bg-white overflow-x-auto shrink-0 scrollbar-none">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-3.5 text-xs font-medium border-b-2 whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-amber-800 text-amber-900 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: DATOS GENERALES */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              {/* Photo hero if available */}
              {proyecto.imagenUrl && (
                <div className="h-48 rounded-xl overflow-hidden relative border border-slate-200">
                  <img
                    src={proyecto.imagenUrl}
                    alt={proyecto.nombre}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent flex items-end p-4">
                    <p className="text-white text-xs font-medium drop-shadow-xs">
                      Registro fotográfico de laboratorio vinculado al proyecto
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-4">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Descripción y Objetivos Técnicos
                    </h3>
                    <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-line">
                      {proyecto.descripcion || 'Sin descripción detallada registrada.'}
                    </p>
                  </div>

                  {originRequest && (
                    <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-4">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-amber-900">
                          Solicitud de Origen: {originRequest.codigo}
                        </span>
                        <span className="text-amber-800 text-[11px]">
                          Solicitante: {originRequest.solicitante} ({originRequest.departamentoSolicitante})
                        </span>
                      </div>
                      <p className="text-xs text-amber-950 mt-1">
                        {originRequest.descripcion}
                      </p>
                    </div>
                  )}

                  {proyecto.resultadoFinal && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                      <h3 className="text-xs font-bold text-emerald-900 mb-1">
                        Resultado Final del Desarrollo
                      </h3>
                      <p className="text-xs text-emerald-950">
                        {proyecto.resultadoFinal}
                      </p>
                    </div>
                  )}
                </div>

                {/* Right Summary Column */}
                <div className="space-y-4">
                  <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-3 text-xs">
                    <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2">
                      Ficha Resumen
                    </h3>

                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-500">Tipo de Proyecto:</span>
                      <span className="font-semibold text-slate-800">{proyecto.tipoProyecto}</span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-500">Cliente / Destino:</span>
                      <span className="font-semibold text-slate-800">
                        {proyecto.cliente || 'Desarrollo Interno'}
                      </span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-500">Prioridad:</span>
                      <span
                        className={`font-bold ${
                          proyecto.prioridad === 'Urgente'
                            ? 'text-rose-600'
                            : proyecto.prioridad === 'Alta'
                            ? 'text-amber-700'
                            : 'text-slate-700'
                        }`}
                      >
                        {proyecto.prioridad}
                      </span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-500">Responsable I+D:</span>
                      <span className="font-semibold text-slate-800">
                        {responsable ? `${responsable.nombre} ${responsable.apellidos}` : 'No asignado'}
                      </span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-500">Dedicación:</span>
                      <span className="font-mono font-semibold text-slate-800 tabular-nums">
                        {totalHorasReales}h / {proyecto.horasEstimadas}h
                      </span>
                    </div>

                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Ensayos Realizados:</span>
                      <span className="font-semibold text-slate-800 tabular-nums">
                        {projectTrials.length} pruebas
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PLANIFICACIÓN */}
          {activeTab === 'planificacion' && (
            <div className="space-y-6">
              {/* Overdue / On-Time Warning */}
              <div
                className={`p-4 rounded-xl border flex items-center justify-between text-xs ${
                  isOverdue
                    ? 'bg-rose-50 border-rose-200 text-rose-900'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  {isOverdue ? (
                    <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                  ) : (
                    <Calendar className="w-5 h-5 text-emerald-600 shrink-0" />
                  )}
                  <div>
                    <span className="font-bold">
                      {isOverdue
                        ? `Aviso de Retraso: Proyecto fuera de plazo por ${Math.abs(diffDays)} días`
                        : `Planificación en plazo: Faltan ${diffDays} días para la fecha objetivo`}
                    </span>
                    <p className="text-[11px] opacity-80 mt-0.5">
                      Fecha límite: {proyecto.fechaFinalPrevista} · Inicio real: {proyecto.fechaInicioReal || proyecto.fechaInicioPrevista}
                    </p>
                  </div>
                </div>
              </div>

              {/* Progress Slider Control */}
              <div className="border border-slate-200 rounded-xl p-5 bg-white space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Control de Avance del Proyecto
                    </h3>
                    <p className="text-xs text-slate-500">
                      Ajuste del porcentaje completado según ensayos y fases superadas
                    </p>
                  </div>
                  <span className="text-2xl font-bold font-mono text-amber-900 tabular-nums">
                    {avanceInput}%
                  </span>
                </div>

                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={avanceInput}
                    onChange={(e) => setAvanceInput(Number(e.target.value))}
                    className="w-full accent-amber-800 cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>0% (Inicio)</span>
                    <span>25% (Primeros ensayos)</span>
                    <span>50% (Formulación en ajuste)</span>
                    <span>75% (Cata & Escandallo)</span>
                    <span>100% (Listo para obrador)</span>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleSaveProgress}
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-amber-800 hover:bg-amber-900 rounded-lg transition-colors"
                  >
                    Actualizar Porcentaje de Avance
                  </button>
                </div>
              </div>

              {/* Milestones Checklist */}
              <div className="border border-slate-200 rounded-xl p-5 bg-white space-y-3">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Hitos de Desarrollo Técnico
                </h3>
                <div className="space-y-2 text-xs">
                  {[
                    { label: 'Revisión y aprobación del briefing inicial', done: true },
                    {
                      label: 'Primeros ensayos de amasado y balance de ingredientes',
                      done: projectTrials.length > 0,
                    },
                    {
                      label: 'Validación de textura, lamination y horneado en obrador',
                      done: projectTrials.some((p) => p.resultado === 'Satisfactorio'),
                    },
                    {
                      label: 'Ficha técnica y cálculo de escandallos completado',
                      done: projectDocs.some((d) => d.tipoDocumento === 'Escandallo'),
                    },
                    {
                      label: 'Cata y aprobación final con el cliente / dirección',
                      done: proyecto.estado === 'En validación' || proyecto.estado === 'Finalizado',
                    },
                  ].map((milestone, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-2.5 rounded-lg border border-slate-100 bg-slate-50/50"
                    >
                      <CheckCircle2
                        className={`w-4 h-4 shrink-0 ${
                          milestone.done ? 'text-emerald-600' : 'text-slate-300'
                        }`}
                      />
                      <span
                        className={
                          milestone.done
                            ? 'text-slate-800 font-medium'
                            : 'text-slate-400'
                        }
                      >
                        {milestone.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: EQUIPO */}
          {activeTab === 'equipo' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Equipo Asignado al Proyecto
                  </h3>
                  <p className="text-xs text-slate-500">
                    Especialistas de pastelería, formulación y escandallo participantes
                  </p>
                </div>
                <button
                  onClick={() => onEditProject(proyecto)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Gestionar Asignaciones
                </button>
              </div>

              {/* Responsable Principal Card */}
              {responsable && (
                <div className="border border-amber-200 bg-amber-50/40 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-amber-800 text-white flex items-center justify-center font-bold text-sm">
                      {responsable.nombre[0]}
                      {responsable.apellidos[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">
                          {responsable.nombre} {responsable.apellidos}
                        </span>
                        <span className="text-[10px] bg-amber-800 text-white px-1.5 py-0.5 rounded font-semibold">
                          Responsable Principal
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{responsable.cargo}</p>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {responsable.especialidades.map((esp) => (
                          <span
                            key={esp}
                            className="text-[10px] text-slate-600 bg-white border border-slate-200 px-1.5 py-0.5 rounded"
                          >
                            {esp}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="text-right text-xs">
                    <span className="text-slate-500">Horas en este proyecto:</span>
                    <p className="text-base font-bold text-slate-900 font-mono tabular-nums">
                      {projectHours
                        .filter((h) => h.empleadoId === responsable.id)
                        .reduce((a, b) => a + (b.tiempoHoras || 0), 0)}{' '}
                      h
                    </p>
                  </div>
                </div>
              )}

              {/* Colaboradores List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Colaboradores del Obrador y Laboratorio ({colaboradores.length})
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {colaboradores.map((colab) => {
                    if (!colab) return null;
                    const hours = projectHours
                      .filter((h) => h.empleadoId === colab.id)
                      .reduce((a, b) => a + (b.tiempoHoras || 0), 0);

                    return (
                      <div
                        key={colab.id}
                        className="border border-slate-200 rounded-xl p-3.5 bg-white flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
                            {colab.nombre[0]}
                            {colab.apellidos[0]}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-900">
                              {colab.nombre} {colab.apellidos}
                            </p>
                            <p className="text-[11px] text-slate-500">{colab.cargo}</p>
                          </div>
                        </div>

                        <div className="text-right text-xs">
                          <span className="font-mono font-semibold text-slate-800 tabular-nums">
                            {hours} h
                          </span>
                          <span className="block text-[10px] text-slate-400">imputadas</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PRUEBAS */}
          {activeTab === 'pruebas' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Histórico de Pruebas y Ensayos ({projectTrials.length})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Formulaciones, variaciones de procesos y evaluaciones sensoriales
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {projectTrials.length >= 2 && (
                    <button
                      onClick={() => onOpenCompareTrials(proyecto.id)}
                      className="px-3 py-1.5 text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg flex items-center gap-1.5 transition-colors"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                      <span>Comparar Ensayos</span>
                    </button>
                  )}
                  <button
                    onClick={() => onOpenNewTrial(proyecto.id)}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-amber-800 hover:bg-amber-900 rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Nuevo Ensayo</span>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {projectTrials.map((prueba) => {
                  const tester = getEmpleado(prueba.responsableId);
                  const sensorialAvg = (
                    (prueba.evaluacionSensorial.textura +
                      prueba.evaluacionSensorial.sabor +
                      prueba.evaluacionSensorial.aspectoVisual +
                      prueba.evaluacionSensorial.aroma +
                      prueba.evaluacionSensorial.estabilidad) /
                    5
                  ).toFixed(1);

                  return (
                    <div
                      key={prueba.id}
                      className="border border-slate-200 rounded-xl p-5 bg-white space-y-4 hover:border-slate-300 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            Ensayo #{prueba.numeroPrueba}
                          </span>
                          <span className="text-xs font-bold text-slate-900">
                            {prueba.nombrePrueba}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs">
                          <span className="text-slate-500 tabular-nums">
                            {prueba.fechaRealizacion}
                          </span>
                          <span
                            className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                              prueba.pruebaAprobada
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : 'bg-amber-50 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {prueba.pruebaAprobada ? '✓ Aprobada' : prueba.resultado}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                        <div className="md:col-span-2 space-y-3">
                          <div>
                            <span className="font-semibold text-slate-700">Objetivo:</span>
                            <p className="text-slate-600 mt-0.5">{prueba.objetivo}</p>
                          </div>

                          {/* Formulation breakdown preview */}
                          {prueba.formulacion && prueba.formulacion.length > 0 && (
                            <div>
                              <span className="font-semibold text-slate-700">
                                Formulación ({prueba.formulacion.length} ingredientes):
                              </span>
                              <div className="mt-1 bg-slate-50 rounded-lg p-2.5 border border-slate-200">
                                <div className="grid grid-cols-3 font-semibold text-[11px] text-slate-500 pb-1 border-b border-slate-200">
                                  <span>Ingrediente</span>
                                  <span className="text-right">Gramos</span>
                                  <span className="text-right">% Panadero</span>
                                </div>
                                <div className="divide-y divide-slate-100 max-h-32 overflow-y-auto">
                                  {prueba.formulacion.map((item) => (
                                    <div
                                      key={item.id}
                                      className="grid grid-cols-3 py-1 text-[11px] text-slate-800"
                                    >
                                      <span className="truncate">{item.ingrediente}</span>
                                      <span className="text-right font-mono tabular-nums">
                                        {item.cantidadGramos}g
                                      </span>
                                      <span className="text-right font-mono text-slate-500 tabular-nums">
                                        {item.porcentajeBakers ? `${item.porcentajeBakers}%` : '-'}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}

                          <div>
                            <span className="font-semibold text-slate-700">
                              Modificaciones / Parámetros:
                            </span>
                            <p className="text-slate-600 mt-0.5">{prueba.modificacionesRealizadas}</p>
                          </div>
                        </div>

                        {/* Sensorial Radar Box */}
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800 text-xs">
                              Evaluación Sensorial
                            </span>
                            <span className="font-mono font-bold text-amber-900 bg-amber-100/70 px-1.5 py-0.5 rounded text-xs tabular-nums">
                              {sensorialAvg} / 10
                            </span>
                          </div>

                          <div className="space-y-1.5 pt-1 text-[11px]">
                            {[
                              { label: 'Sabor', score: prueba.evaluacionSensorial.sabor },
                              { label: 'Textura / Crujiente', score: prueba.evaluacionSensorial.textura },
                              { label: 'Aspecto Visual', score: prueba.evaluacionSensorial.aspectoVisual },
                              { label: 'Aroma', score: prueba.evaluacionSensorial.aroma },
                              { label: 'Estabilidad', score: prueba.evaluacionSensorial.estabilidad },
                            ].map((item) => (
                              <div key={item.label}>
                                <div className="flex justify-between text-slate-600">
                                  <span>{item.label}</span>
                                  <span className="font-mono font-semibold text-slate-900">
                                    {item.score}/10
                                  </span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-1 mt-0.5">
                                  <div
                                    className="bg-amber-700 h-1 rounded-full"
                                    style={{ width: `${item.score * 10}%` }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>

                          {prueba.evaluacionSensorial.comentarios && (
                            <p className="text-[11px] text-slate-600 italic border-t border-slate-200/80 pt-2 mt-2">
                              "{prueba.evaluacionSensorial.comentarios}"
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Photo Thumbnail if any */}
                      {prueba.fotografias && prueba.fotografias.length > 0 && (
                        <div className="pt-2 flex items-center gap-3">
                          <span className="text-[11px] font-semibold text-slate-500">
                            Evidencia fotográfica:
                          </span>
                          <div className="flex gap-2">
                            {prueba.fotografias.map((photo, i) => (
                              <img
                                key={i}
                                src={photo}
                                alt="Fotografía del ensayo"
                                className="w-16 h-12 rounded object-cover border border-slate-200"
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {projectTrials.length === 0 && (
                  <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                    <FlaskConical className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-700">
                      No hay pruebas registradas todavía
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
                      Registra el primer ensayo de laboratorio con su formulación, porcentaje panadero y evaluación sensorial.
                    </p>
                    <button
                      onClick={() => onOpenNewTrial(proyecto.id)}
                      className="mt-3 px-3 py-1.5 text-xs font-semibold text-white bg-amber-800 rounded-lg hover:bg-amber-900 shadow-2xs"
                    >
                      + Registrar Primer Ensayo
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: HORAS */}
          {activeTab === 'horas' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Control Horario del Proyecto
                  </h3>
                  <p className="text-xs text-slate-500">
                    Dedicación efectiva del equipo por tipo de actividad técnica
                  </p>
                </div>
                <button
                  onClick={() => onOpenNewTimeEntry(proyecto.id)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-amber-800 hover:bg-amber-900 rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>+ Imputar Horas</span>
                </button>
              </div>

              {/* Hours budget breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="border border-slate-200 rounded-xl p-4 bg-white">
                  <span className="text-xs text-slate-500">Horas Reales Invertidas</span>
                  <p className="text-2xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
                    {totalHorasReales} h
                  </p>
                  <span className="text-[11px] text-slate-400">
                    {projectHours.length} partes de trabajo
                  </span>
                </div>

                <div className="border border-slate-200 rounded-xl p-4 bg-white">
                  <span className="text-xs text-slate-500">Horas Estimadas</span>
                  <p className="text-2xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
                    {proyecto.horasEstimadas} h
                  </p>
                  <span className="text-[11px] text-slate-400">Presupuesto inicial</span>
                </div>

                <div className="border border-slate-200 rounded-xl p-4 bg-white">
                  <span className="text-xs text-slate-500">Desviación / Saldo</span>
                  <p
                    className={`text-2xl font-bold font-mono mt-1 tabular-nums ${
                      totalHorasReales > proyecto.horasEstimadas
                        ? 'text-rose-600'
                        : 'text-emerald-700'
                    }`}
                  >
                    {totalHorasReales > proyecto.horasEstimadas
                      ? `+${(totalHorasReales - proyecto.horasEstimadas).toFixed(1)} h exceso`
                      : `${horasRestantes.toFixed(1)} h restantes`}
                  </p>
                  <span className="text-[11px] text-slate-400">
                    {Math.round((totalHorasReales / proyecto.horasEstimadas) * 100)}% consumido
                  </span>
                </div>
              </div>

              {/* Time logs table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-4">Fecha</th>
                      <th className="py-2.5 px-4">Empleado</th>
                      <th className="py-2.5 px-4">Actividad</th>
                      <th className="py-2.5 px-4">Horario</th>
                      <th className="py-2.5 px-4 text-right">Tiempo</th>
                      <th className="py-2.5 px-4">Tarea / Observaciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {projectHours.map((entry) => {
                      const emp = getEmpleado(entry.empleadoId);
                      return (
                        <tr key={entry.id} className="hover:bg-slate-50/70">
                          <td className="py-2.5 px-4 font-mono tabular-nums text-slate-600">
                            {entry.fecha}
                          </td>
                          <td className="py-2.5 px-4 font-medium text-slate-900">
                            {emp ? `${emp.nombre} ${emp.apellidos}` : 'Empleado'}
                          </td>
                          <td className="py-2.5 px-4 text-slate-700">
                            <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[11px]">
                              {entry.tipoActividad}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 font-mono text-slate-500 text-[11px]">
                            {entry.horaInicio} - {entry.horaFin}
                          </td>
                          <td className="py-2.5 px-4 font-mono font-bold text-slate-900 text-right tabular-nums">
                            {entry.tiempoHoras} h
                          </td>
                          <td className="py-2.5 px-4 text-slate-600 max-w-xs truncate">
                            {entry.tarea || entry.observaciones || '-'}
                          </td>
                        </tr>
                      );
                    })}

                    {projectHours.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-slate-400">
                          No hay horas registradas para este proyecto aún.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: DOCUMENTACIÓN */}
          {activeTab === 'documentos' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Repositorio Documental del Proyecto ({projectDocs.length})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Fichas técnicas, escandallos, recetas maestras y versiones controladas
                  </p>
                </div>
                <button
                  onClick={() => onOpenNewDocument(proyecto.id)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-amber-800 hover:bg-amber-900 rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Subir Documento</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {projectDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="border border-slate-200 rounded-xl p-4 bg-white hover:border-slate-300 transition-colors flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                        <span className="font-mono font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                          {doc.version}
                        </span>
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                            doc.estadoDocumental === 'Validado'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : doc.estadoDocumental === 'Obsoleto'
                              ? 'bg-slate-100 text-slate-500'
                              : 'bg-amber-50 text-amber-800'
                          }`}
                        >
                          {doc.estadoDocumental}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-2">
                        {doc.nombre}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Tipo: <span className="font-medium text-slate-700">{doc.tipoDocumento}</span>
                      </p>
                      {doc.observaciones && (
                        <p className="text-[11px] text-slate-600 mt-2 bg-slate-50 p-2 rounded border border-slate-100">
                          {doc.observaciones}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-3 text-[11px] text-slate-500">
                      <span>
                        {doc.formato} · {doc.tamano || '1 MB'}
                      </span>
                      <button
                        onClick={() =>
                          alert(`Simulando apertura/descarga de documento técnico: ${doc.nombre}`)
                        }
                        className="text-amber-800 font-semibold hover:underline flex items-center gap-1"
                      >
                        <span>Descargar</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}

                {projectDocs.length === 0 && (
                  <div className="sm:col-span-2 text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                    <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-700">
                      No hay documentos adjuntos
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Sube la ficha técnica, escandallo, tabla de alérgenos o protocolo de obrador.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 7: VALIDACIÓN Y CIERRE */}
          {activeTab === 'cierre' && (
            <div className="space-y-6">
              <div className="border border-slate-200 rounded-xl p-5 bg-white space-y-4">
                <h3 className="text-sm font-bold text-slate-900">
                  Dictamen Final de Validación y Cierre de Proyecto
                </h3>
                <p className="text-xs text-slate-500">
                  Una vez validadas las pruebas organolépticas, escandallo y viabilidad industrial, formaliza el cierre.
                </p>

                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700">
                    Resultado Final / Informe de Transferencia a Obrador:
                  </label>
                  <textarea
                    rows={4}
                    value={closureNotes}
                    onChange={(e) => setClosureNotes(e.target.value)}
                    placeholder="Detalla si la formulación fue aprobada por el cliente, especificaciones de conservación, fecha de paso a línea de producción continua..."
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div className="text-xs text-slate-500">
                    {proyecto.fechaCierre && (
                      <span>Cerrado oficialmente el: {proyecto.fechaCierre}</span>
                    )}
                  </div>
                  <button
                    onClick={handleSaveClosure}
                    className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Aprobar y Cerrar Proyecto (100%)</span>
                  </button>
                </div>
              </div>

              {/* Audit trail for this project */}
              <div className="border border-slate-200 rounded-xl p-5 bg-white space-y-3">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Historial de Cambios y Trazabilidad del Proyecto
                </h3>
                <div className="space-y-2 text-xs">
                  {projectAudit.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-start justify-between py-2 border-b border-slate-100 last:border-b-0"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-800">{log.accion}</span>
                          <span className="text-[11px] text-slate-400">por {log.usuario}</span>
                        </div>
                        <p className="text-slate-600 mt-0.5">{log.detalle}</p>
                      </div>
                      <span className="text-[11px] font-mono text-slate-400 whitespace-nowrap">
                        {log.fecha}
                      </span>
                    </div>
                  ))}

                  {projectAudit.length === 0 && (
                    <p className="text-slate-400 text-center py-2">
                      Sin eventos de trazabilidad adicionales.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
