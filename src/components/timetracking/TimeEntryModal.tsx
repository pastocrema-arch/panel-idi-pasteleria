import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RegistroHoras, ActivityType } from '../../types';
import { X, Clock } from 'lucide-react';

interface TimeEntryModalProps {
  projectId?: string;
  isOpen: boolean;
  onClose: () => void;
}

const ACTIVIDADES: ActivityType[] = [
  'Investigación',
  'Desarrollo de recetas',
  'Elaboración de pruebas',
  'Catas y evaluaciones',
  'Reuniones',
  'Documentación',
  'Escandallos',
  'Coordinación',
  'Industrialización',
];

export const TimeEntryModal: React.FC<TimeEntryModalProps> = ({
  projectId: propProjectId,
  isOpen,
  onClose,
}) => {
  const { proyectos, empleados, pruebas, addRegistroHoras } = useApp();

  const [projectId, setProjectId] = useState(propProjectId || (proyectos[0]?.id || ''));
  const [empleadoId, setEmpleadoId] = useState(empleados[0]?.id || 'emp-1');
  const [fecha, setFecha] = useState(new Date().toISOString().substring(0, 10));
  const [tipoActividad, setTipoActividad] = useState<ActivityType>('Elaboración de pruebas');
  const [horaInicio, setHoraInicio] = useState('08:30');
  const [horaFin, setHoraFin] = useState('13:30');
  const [pruebaId, setPruebaId] = useState('');
  const [tarea, setTarea] = useState('');
  const [observaciones, setObservaciones] = useState('');

  if (!isOpen) return null;

  // Filter trials for selected project
  const availableTrials = pruebas.filter((p) => p.proyectoId === projectId);

  // Compute duration
  const computeDuration = (start: string, end: string) => {
    if (!start || !end) return 0;
    const [h1, m1] = start.split(':').map(Number);
    const [h2, m2] = end.split(':').map(Number);
    const diff = h2 * 60 + m2 - (h1 * 60 + m1);
    if (diff <= 0) return 0;
    return Math.round((diff / 60) * 10) / 10;
  };

  const calculatedHours = computeDuration(horaInicio, horaFin);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !empleadoId) return;

    addRegistroHoras({
      proyectoId: projectId,
      empleadoId,
      fecha,
      tipoActividad,
      horaInicio,
      horaFin,
      tiempoHoras: calculatedHours,
      pruebaId: pruebaId || undefined,
      tarea: tarea || undefined,
      observaciones: observaciones || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg border border-slate-200 overflow-hidden my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Imputar Horas de Dedicación I+D+i
            </h2>
            <p className="text-xs text-slate-500">
              Módulo 4: Registro horario por proyecto y actividad técnica
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Proyecto de Destino *
            </label>
            <select
              required
              value={projectId}
              onChange={(e) => {
                setProjectId(e.target.value);
                setPruebaId('');
              }}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700 font-medium"
            >
              {proyectos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.codigo} - {p.nombre.substring(0, 40)}...
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Empleado / Especialista *
              </label>
              <select
                required
                value={empleadoId}
                onChange={(e) => setEmpleadoId(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700"
              >
                {empleados.length === 0 ? (
                  <option value="">Sin especialistas (añade uno en Equipo)</option>
                ) : (
                  empleados.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.nombre} {emp.apellidos}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Fecha
              </label>
              <input
                type="date"
                required
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tipo de Actividad *
              </label>
              <select
                value={tipoActividad}
                onChange={(e) => setTipoActividad(e.target.value as ActivityType)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700 font-medium"
              >
                {ACTIVIDADES.map((act) => (
                  <option key={act} value={act}>
                    {act}
                  </option>
                ))}
              </select>
            </div>

            {availableTrials.length > 0 && (
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ensayo Asociado (Opcional)
                </label>
                <select
                  value={pruebaId}
                  onChange={(e) => setPruebaId(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700"
                >
                  <option value="">Sin asociar a un ensayo concreto</option>
                  {availableTrials.map((t) => (
                    <option key={t.id} value={t.id}>
                      Ensayo #{t.numeroPrueba} - {t.nombrePrueba.substring(0, 35)}...
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Hora de Inicio
              </label>
              <input
                type="time"
                required
                value={horaInicio}
                onChange={(e) => setHoraInicio(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Hora de Finalización
              </label>
              <input
                type="time"
                required
                value={horaFin}
                onChange={(e) => setHoraFin(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700 font-mono"
              />
            </div>
          </div>

          {/* Automatic calculation display */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-amber-950">
              <Clock className="w-4 h-4 text-amber-800" />
              <span>Tiempo de dedicación calculado automáticamente:</span>
            </div>
            <span className="text-base font-bold font-mono text-amber-900 tabular-nums">
              {calculatedHours} h
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Descripción de la Tarea / Observaciones
            </label>
            <input
              type="text"
              value={tarea}
              onChange={(e) => setTarea(e.target.value)}
              placeholder="Ej. Horneado escalonado, control de tiro y medición de mermas..."
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-amber-800 hover:bg-amber-900 rounded-lg shadow-xs"
            >
              Registrar {calculatedHours} h
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
