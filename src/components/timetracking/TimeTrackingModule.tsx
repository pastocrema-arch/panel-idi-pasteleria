import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TimeEntryModal } from './TimeEntryModal';
import {
  Clock,
  Plus,
  Filter,
  Search,
  Calendar,
  Trash2,
  PieChart,
  BarChart3,
  ExternalLink,
} from 'lucide-react';

export const TimeTrackingModule: React.FC<{ onOpenNewTimeEntry: () => void }> = ({
  onOpenNewTimeEntry,
}) => {
  const {
    registrosHoras,
    proyectos,
    empleados,
    pruebas,
    deleteRegistroHoras,
    openProjectDetail,
  } = useApp();

  const [employeeFilter, setEmployeeFilter] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [activityFilter, setActivityFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  const filtered = registrosHoras.filter((h) => {
    const emp = empleados.find((e) => e.id === h.empleadoId);
    const proy = proyectos.find((p) => p.id === h.proyectoId);

    const matchesEmployee = employeeFilter === 'all' || h.empleadoId === employeeFilter;
    const matchesProject = projectFilter === 'all' || h.proyectoId === projectFilter;
    const matchesActivity = activityFilter === 'all' || h.tipoActividad === activityFilter;

    const matchesSearch =
      (h.tarea && h.tarea.toLowerCase().includes(search.toLowerCase())) ||
      (h.observaciones && h.observaciones.toLowerCase().includes(search.toLowerCase())) ||
      (emp && emp.nombre.toLowerCase().includes(search.toLowerCase())) ||
      (proy && proy.nombre.toLowerCase().includes(search.toLowerCase()));

    return matchesEmployee && matchesProject && matchesActivity && matchesSearch;
  });

  const totalFilteredHours = filtered.reduce((acc, curr) => acc + (curr.tiempoHoras || 0), 0);

  // Aggregation by activity type
  const hoursByActivity: Record<string, number> = {};
  registrosHoras.forEach((h) => {
    hoursByActivity[h.tipoActividad] = (hoursByActivity[h.tipoActividad] || 0) + (h.tiempoHoras || 0);
  });

  // Total global hours
  const totalGlobalHours = Object.values(hoursByActivity).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Control Horario y Dedicación I+D+i
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Módulo 4: Imputación de tiempo por proyecto y análisis de distribución de actividades del departamento
          </p>
        </div>

        <button
          onClick={onOpenNewTimeEntry}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-amber-800 hover:bg-amber-900 rounded-lg shadow-2xs transition-colors self-start sm:self-auto"
        >
          <Clock className="w-4 h-4" />
          <span>+ Imputar Horas</span>
        </button>
      </div>

      {/* Activity Type Distribution Cards */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              ¿En qué invierte su tiempo el equipo de I+D+i?
            </h2>
            <p className="text-xs text-slate-500">
              Distribución acumulada sobre {totalGlobalHours} horas totales computadas
            </p>
          </div>
          <span className="text-xs font-bold font-mono text-amber-900 bg-amber-50 px-2 py-1 rounded border border-amber-200 tabular-nums">
            Total: {totalGlobalHours} h
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {Object.entries(hoursByActivity).map(([activity, hours]) => {
            const pct = totalGlobalHours ? Math.round((hours / totalGlobalHours) * 100) : 0;
            return (
              <div
                key={activity}
                className="bg-slate-50/70 border border-slate-200 rounded-lg p-3 space-y-1.5"
              >
                <span className="text-[11px] font-semibold text-slate-700 block truncate">
                  {activity}
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="text-base font-bold font-mono text-slate-900 tabular-nums">
                    {hours} h
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{pct}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1">
                  <div
                    className="bg-amber-700 h-1 rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por tarea, empleado o proyecto..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={employeeFilter}
            onChange={(e) => setEmployeeFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-700"
          >
            <option value="all">Todos los Empleados</option>
            {empleados.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.nombre} {emp.apellidos}
              </option>
            ))}
          </select>

          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-700 max-w-[200px] truncate"
          >
            <option value="all">Todos los Proyectos</option>
            {proyectos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.codigo} - {p.nombre.substring(0, 30)}...
              </option>
            ))}
          </select>

          <select
            value={activityFilter}
            onChange={(e) => setActivityFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-700"
          >
            <option value="all">Todas las Actividades</option>
            {Object.keys(hoursByActivity).map((act) => (
              <option key={act} value={act}>
                {act}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Time Entries Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-700">
            Registros Encontrados: {filtered.length}
          </span>
          <span className="font-mono font-bold text-slate-900 tabular-nums">
            Suma filtrada: {totalFilteredHours.toFixed(1)} horas
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">Fecha</th>
                <th className="py-2.5 px-4">Empleado</th>
                <th className="py-2.5 px-4">Proyecto</th>
                <th className="py-2.5 px-4">Actividad</th>
                <th className="py-2.5 px-4">Horario</th>
                <th className="py-2.5 px-4 text-right">Tiempo</th>
                <th className="py-2.5 px-4">Tarea / Observaciones</th>
                <th className="py-2.5 px-4 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((entry) => {
                const emp = empleados.find((e) => e.id === entry.empleadoId);
                const proy = proyectos.find((p) => p.id === entry.proyectoId);
                const prueba = entry.pruebaId ? pruebas.find((pr) => pr.id === entry.pruebaId) : null;

                return (
                  <tr key={entry.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap tabular-nums">
                      {entry.fecha}
                    </td>

                    <td className="py-3 px-4 font-medium text-slate-900 whitespace-nowrap">
                      {emp ? `${emp.nombre} ${emp.apellidos}` : 'Empleado'}
                    </td>

                    <td className="py-3 px-4 max-w-xs truncate">
                      {proy ? (
                        <button
                          onClick={() => openProjectDetail(proy.id, 'horas')}
                          className="text-amber-800 font-medium hover:underline flex items-center gap-1 truncate"
                        >
                          <span className="font-mono font-semibold">{proy.codigo}</span>
                          <span className="truncate">{proy.nombre}</span>
                        </button>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                      {prueba && (
                        <span className="text-[10px] text-slate-500 block truncate">
                          Ensayo #{prueba.numeroPrueba} ({prueba.nombrePrueba.substring(0, 25)}...)
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[11px] font-medium">
                        {entry.tipoActividad}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap tabular-nums text-[11px]">
                      {entry.horaInicio} - {entry.horaFin}
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-slate-900 text-right whitespace-nowrap tabular-nums">
                      {entry.tiempoHoras} h
                    </td>

                    <td className="py-3 px-4 text-slate-600 max-w-sm truncate">
                      {entry.tarea || entry.observaciones || '-'}
                    </td>

                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => deleteRegistroHoras(entry.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded"
                        title="Eliminar este registro horario"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No hay registros horarios que coincidan con los filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
