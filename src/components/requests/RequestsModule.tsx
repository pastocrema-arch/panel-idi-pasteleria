import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Solicitud, RequestStatus } from '../../types';
import { RequestModal } from './RequestModal';
import { Search, Plus, Filter, ArrowUpRight, CheckCircle2, Clock } from 'lucide-react';

export const RequestsModule: React.FC<{
  onConvertToProject: (solicitud: Solicitud) => void;
}> = ({ onConvertToProject }) => {
  const { solicitudes, openProjectDetail } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSolicitud, setSelectedSolicitud] = useState<Solicitud | null>(null);

  const filtered = solicitudes.filter((s) => {
    const matchesSearch =
      s.nombreSolicitud.toLowerCase().includes(search.toLowerCase()) ||
      s.codigo.toLowerCase().includes(search.toLowerCase()) ||
      s.solicitante.toLowerCase().includes(search.toLowerCase()) ||
      (s.cliente && s.cliente.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || s.estado === statusFilter;
    const matchesDept = deptFilter === 'all' || s.departamentoSolicitante === deptFilter;

    return matchesSearch && matchesStatus && matchesDept;
  });

  const handleEdit = (sol: Solicitud) => {
    setSelectedSolicitud(sol);
    setIsModalOpen(true);
  };

  const handleNew = () => {
    setSelectedSolicitud(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Solicitudes de Trabajo para I+D+i
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Módulo 1: Puerta de entrada y evaluación de viabilidad antes de originar proyectos técnicos
          </p>
        </div>
        <button
          onClick={handleNew}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-amber-800 hover:bg-amber-900 rounded-lg shadow-2xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Petición</span>
        </button>
      </div>

      {/* Filters bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por código, título, solicitante o cliente..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700 focus:border-amber-700"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Segmented status filter */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                statusFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todas ({solicitudes.length})
            </button>
            <button
              onClick={() => setStatusFilter('Nueva solicitud')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                statusFilter === 'Nueva solicitud'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Nuevas
            </button>
            <button
              onClick={() => setStatusFilter('Pendiente de evaluación')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                statusFilter === 'Pendiente de evaluación'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              En evaluación
            </button>
            <button
              onClick={() => setStatusFilter('Convertida en proyecto')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                statusFilter === 'Convertida en proyecto'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Convertidas
            </button>
          </div>

          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-700"
          >
            <option value="all">Todos los Departamentos</option>
            <option value="Comercial">Comercial</option>
            <option value="Producción">Producción</option>
            <option value="Dirección">Dirección</option>
            <option value="Marketing">Marketing</option>
            <option value="Calidad">Calidad</option>
            <option value="Clientes">Clientes</option>
          </select>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="py-3 px-4">Código / Solicitante</th>
                <th className="py-3 px-4">Nombre del Trabajo</th>
                <th className="py-3 px-4">Familia / Tipo</th>
                <th className="py-3 px-4">Entrega Solicitada</th>
                <th className="py-3 px-4">Prioridad</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((sol) => (
                <tr
                  key={sol.id}
                  className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                  onClick={() => handleEdit(sol)}
                >
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="font-mono font-semibold text-slate-900">
                      {sol.codigo}
                    </span>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <span>{sol.solicitante}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-slate-600 font-medium">
                        {sol.departamentoSolicitante}
                      </span>
                    </div>
                  </td>

                  <td className="py-3 px-4 max-w-xs">
                    <p className="font-semibold text-slate-900 group-hover:text-amber-800 transition-colors line-clamp-1">
                      {sol.nombreSolicitud}
                    </p>
                    {sol.cliente && (
                      <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                        Cliente: {sol.cliente}
                      </p>
                    )}
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="font-medium text-slate-800">{sol.familia}</div>
                    <div className="text-[11px] text-slate-500">{sol.tipoTrabajo}</div>
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap tabular-nums text-slate-600">
                    {sol.fechaEntregaDeseada}
                    <div className="text-[11px] text-slate-400">
                      Recibida: {sol.fechaSolicitud}
                    </div>
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap">
                    <span
                      className={`font-semibold ${
                        sol.prioridad === 'Urgente'
                          ? 'text-rose-600'
                          : sol.prioridad === 'Alta'
                          ? 'text-amber-700'
                          : sol.prioridad === 'Media'
                          ? 'text-sky-700'
                          : 'text-slate-500'
                      }`}
                    >
                      {sol.prioridad}
                    </span>
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap">
                    <span
                      className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded-sm ${
                        sol.estado === 'Convertida en proyecto'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : sol.estado === 'Aceptada'
                          ? 'bg-sky-50 text-sky-700 border border-sky-200'
                          : sol.estado === 'Rechazada'
                          ? 'bg-slate-100 text-slate-600 border border-slate-200'
                          : sol.estado === 'Pendiente de evaluación'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-slate-50 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {sol.estado}
                    </span>
                  </td>

                  <td
                    className="py-3 px-4 text-right whitespace-nowrap"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end gap-2">
                      {sol.estado !== 'Convertida en proyecto' ? (
                        <button
                          onClick={() => onConvertToProject(sol)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded transition-colors"
                          title="Convertir esta solicitud directamente en proyecto"
                        >
                          Convertir a Proyecto
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            if (sol.proyectoAsociadoId) {
                              openProjectDetail(sol.proyectoAsociadoId);
                            }
                          }}
                          className="px-2.5 py-1 text-[11px] font-medium text-amber-800 hover:text-amber-900 hover:underline flex items-center gap-1"
                        >
                          <span>Ver Proyecto</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      )}
                      <button
                        onClick={() => handleEdit(sol)}
                        className="px-2 py-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded"
                      >
                        Evaluar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No se encontraron solicitudes con los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <RequestModal
          solicitud={selectedSolicitud}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConvertToProject={onConvertToProject}
        />
      )}
    </div>
  );
};
