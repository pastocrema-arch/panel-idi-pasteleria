import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Proyecto, ProductFamily, ProjectStatus } from '../../types';
import {
  Search,
  Plus,
  LayoutGrid,
  List,
  Calendar as CalendarIcon,
  Filter,
  AlertTriangle,
  Clock,
  ChevronRight,
  FolderKanban,
} from 'lucide-react';

interface ProjectsModuleProps {
  onOpenNewProject: () => void;
  onOpenProjectDetail: (projectId: string) => void;
  onEditProject: (proyecto: Proyecto) => void;
}

const FAMILIAS: ProductFamily[] = [
  'Bollería',
  'Panadería',
  'Bombonería y chocolate',
  'Tartas',
  'Pastelería individual',
  'Postres',
  'Catering',
  'Heladería',
  'Otros',
];

export const ProjectsModule: React.FC<ProjectsModuleProps> = ({
  onOpenNewProject,
  onOpenProjectDetail,
  onEditProject,
}) => {
  const { proyectos, empleados, pruebas, getProjectActualHours, updateProyecto } = useApp();

  const [viewMode, setViewMode] = useState<'table' | 'kanban' | 'calendar'>('table');
  const [search, setSearch] = useState('');
  const [familyFilter, setFamilyFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [responsibleFilter, setResponsibleFilter] = useState<string>('all');

  const now = new Date();

  const filtered = proyectos.filter((p) => {
    const matchesSearch =
      p.nombre.toLowerCase().includes(search.toLowerCase()) ||
      p.codigo.toLowerCase().includes(search.toLowerCase()) ||
      (p.cliente && p.cliente.toLowerCase().includes(search.toLowerCase()));

    const matchesFamily = familyFilter === 'all' || p.familia === familyFilter;
    const matchesStatus = statusFilter === 'all' || p.estado === statusFilter;
    const matchesResp = responsibleFilter === 'all' || p.responsableId === responsibleFilter;

    return matchesSearch && matchesFamily && matchesStatus && matchesResp;
  });

  const getResponsibleName = (id: string) => {
    const emp = empleados.find((e) => e.id === id);
    return emp ? `${emp.nombre} ${emp.apellidos.split(' ')[0]}` : 'Sin asignar';
  };

  const kanbanColumns: ProjectStatus[] = ['Pendiente', 'En curso', 'En validación', 'Finalizado'];

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Gestión Central de Proyectos I+D+i
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Módulo 2: Ficha única por desarrollo, planificación, avance y control de entregas
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* View switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md flex items-center gap-1 transition-colors ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600'
              }`}
              title="Vista Tabla"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tabla</span>
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-md flex items-center gap-1 transition-colors ${
                viewMode === 'kanban' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600'
              }`}
              title="Vista Kanban"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`p-1.5 rounded-md flex items-center gap-1 transition-colors ${
                viewMode === 'calendar' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600'
              }`}
              title="Vista Cronograma"
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cronograma</span>
            </button>
          </div>

          <button
            onClick={onOpenNewProject}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-amber-800 hover:bg-amber-900 rounded-lg shadow-2xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Proyecto</span>
          </button>
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
            placeholder="Buscar por código (PRO-2026-...), nombre o cliente..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={familyFilter}
            onChange={(e) => setFamilyFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-700"
          >
            <option value="all">Todas las Familias</option>
            {FAMILIAS.map((fam) => (
              <option key={fam} value={fam}>
                {fam}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-700"
          >
            <option value="all">Todos los Estados</option>
            <option value="Pendiente">Pendiente</option>
            <option value="En curso">En curso</option>
            <option value="En validación">En validación</option>
            <option value="Finalizado">Finalizado</option>
            <option value="Cancelado">Cancelado</option>
          </select>

          <select
            value={responsibleFilter}
            onChange={(e) => setResponsibleFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-700"
          >
            <option value="all">Todos los Responsables</option>
            {empleados.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.nombre} {emp.apellidos.split(' ')[0]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* VIEW 1: TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="py-3 px-4">Código / Nombre</th>
                  <th className="py-3 px-4">Familia / Tipo</th>
                  <th className="py-3 px-4">Responsable</th>
                  <th className="py-3 px-4">Fecha Prevista</th>
                  <th className="py-3 px-4">Avance</th>
                  <th className="py-3 px-4">Dedicación</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Ficha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((proy) => {
                  const hours = getProjectActualHours(proy.id);
                  const trialsCount = pruebas.filter((p) => p.proyectoId === proy.id).length;
                  const isOverdue =
                    proy.estado !== 'Finalizado' &&
                    proy.estado !== 'Cancelado' &&
                    new Date(proy.fechaFinalPrevista) < now;

                  return (
                    <tr
                      key={proy.id}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                      onClick={() => onOpenProjectDetail(proy.id)}
                    >
                      <td className="py-3 px-4 max-w-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold text-slate-900">
                            {proy.codigo}
                          </span>
                          <span
                            className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                              proy.prioridad === 'Urgente'
                                ? 'bg-rose-50 text-rose-700'
                                : proy.prioridad === 'Alta'
                                ? 'bg-amber-50 text-amber-700'
                                : 'text-slate-500'
                            }`}
                          >
                            {proy.prioridad}
                          </span>
                        </div>
                        <p className="font-semibold text-slate-900 group-hover:text-amber-800 transition-colors mt-0.5 line-clamp-1">
                          {proy.nombre}
                        </p>
                        {proy.cliente && (
                          <p className="text-[11px] text-slate-400 truncate">
                            Cliente: {proy.cliente}
                          </p>
                        )}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-medium text-slate-800">{proy.familia}</div>
                        <div className="text-[11px] text-slate-500">{proy.subfamilia}</div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap text-slate-700 font-medium">
                        {getResponsibleName(proy.responsableId)}
                        <div className="text-[11px] text-slate-400">
                          {trialsCount} ensayo(s)
                        </div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap text-slate-600 tabular-nums">
                        <span className={isOverdue ? 'text-rose-600 font-bold' : ''}>
                          {proy.fechaFinalPrevista}
                        </span>
                        {isOverdue && (
                          <div className="text-[10px] text-rose-600 font-semibold flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Fuera de plazo
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-amber-800 h-1.5 rounded-full"
                              style={{ width: `${Math.min(100, proy.porcentajeAvance)}%` }}
                            />
                          </div>
                          <span className="font-mono text-slate-700 font-semibold tabular-nums">
                            {proy.porcentajeAvance}%
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap tabular-nums text-slate-700">
                        <span className="font-semibold text-slate-900">{hours}</span>
                        <span className="text-slate-400"> / {proy.horasEstimadas}h</span>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded-sm ${
                            proy.estado === 'Finalizado'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : proy.estado === 'En validación'
                              ? 'bg-purple-50 text-purple-800 border border-purple-200'
                              : proy.estado === 'En curso'
                              ? 'bg-amber-50 text-amber-900 border border-amber-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {proy.estado}
                        </span>
                      </td>

                      <td
                        className="py-3 px-4 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => onOpenProjectDetail(proy.id)}
                          className="px-2.5 py-1 text-xs font-semibold text-amber-800 hover:text-amber-900 hover:bg-amber-50 rounded transition-colors"
                        >
                          Abrir Ficha →
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      No hay proyectos que coincidan con la búsqueda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: KANBAN BOARD */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
          {kanbanColumns.map((colStatus) => {
            const colProjects = filtered.filter((p) => p.estado === colStatus);

            return (
              <div
                key={colStatus}
                className="bg-slate-100/70 border border-slate-200 rounded-xl p-3 flex flex-col gap-3 min-h-[500px]"
              >
                <div className="flex items-center justify-between px-1 py-1">
                  <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span>{colStatus}</span>
                    <span className="text-[11px] text-slate-500 font-mono tabular-nums bg-white px-1.5 py-0.2 rounded border border-slate-200">
                      {colProjects.length}
                    </span>
                  </h3>
                </div>

                <div className="space-y-3 flex-1">
                  {colProjects.map((p) => {
                    const hours = getProjectActualHours(p.id);
                    const isOverdue =
                      p.estado !== 'Finalizado' &&
                      p.estado !== 'Cancelado' &&
                      new Date(p.fechaFinalPrevista) < now;

                    return (
                      <div
                        key={p.id}
                        onClick={() => onOpenProjectDetail(p.id)}
                        className="bg-white border border-slate-200 hover:border-amber-400 rounded-lg p-3.5 shadow-2xs cursor-pointer hover:shadow-xs transition-all space-y-2.5 group"
                      >
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span className="font-mono font-bold text-slate-800">{p.codigo}</span>
                          <span className="text-slate-500">{p.familia}</span>
                        </div>

                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-amber-800 line-clamp-2">
                          {p.nombre}
                        </h4>

                        <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2">
                          <span>{getResponsibleName(p.responsableId)}</span>
                          <span className="font-mono font-medium">{hours}h / {p.horasEstimadas}h</span>
                        </div>

                        <div className="w-full bg-slate-100 rounded-full h-1 overflow-hidden">
                          <div
                            className="bg-amber-800 h-1 rounded-full"
                            style={{ width: `${Math.min(100, p.porcentajeAvance)}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[10px]">
                          <span
                            className={
                              isOverdue ? 'text-rose-600 font-bold' : 'text-slate-400'
                            }
                          >
                            Fin: {p.fechaFinalPrevista}
                          </span>
                          <span className="text-slate-600 font-medium">{p.porcentajeAvance}%</span>
                        </div>
                      </div>
                    );
                  })}

                  {colProjects.length === 0 && (
                    <div className="h-28 border border-dashed border-slate-200 rounded-lg flex items-center justify-center text-[11px] text-slate-400">
                      Sin proyectos
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 3: CALENDAR / CRONOGRAMA */}
      {viewMode === 'calendar' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Cronograma de Fechas Límite y Entregas I+D+i
            </h3>
            <p className="text-xs text-slate-500">
              Vista cronológica ordenada por fecha prevista de finalización
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {filtered
              .slice()
              .sort(
                (a, b) =>
                  new Date(a.fechaFinalPrevista).getTime() -
                  new Date(b.fechaFinalPrevista).getTime()
              )
              .map((p) => {
                const isOverdue =
                  p.estado !== 'Finalizado' &&
                  p.estado !== 'Cancelado' &&
                  new Date(p.fechaFinalPrevista) < now;

                return (
                  <div
                    key={p.id}
                    onClick={() => onOpenProjectDetail(p.id)}
                    className="py-3 px-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 rounded-lg cursor-pointer transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-16 text-center py-1 px-1.5 rounded-lg border text-xs font-mono font-bold shrink-0 ${
                          isOverdue
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-amber-50 text-amber-900 border-amber-200'
                        }`}
                      >
                        {p.fechaFinalPrevista.substring(5)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-mono font-bold text-slate-800">{p.codigo}</span>
                          <span className="text-slate-400">·</span>
                          <span className="text-slate-600 font-medium">{p.familia}</span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 mt-0.5 line-clamp-1">
                          {p.nombre}
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-slate-500">
                        Resp: {getResponsibleName(p.responsableId)}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                          p.estado === 'Finalizado'
                            ? 'bg-emerald-50 text-emerald-800'
                            : isOverdue
                            ? 'bg-rose-50 text-rose-700 font-bold'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {isOverdue ? 'Retrasado' : p.estado}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
};
