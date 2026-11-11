import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Prueba } from '../../types';
import { TrialFormModal } from './TrialFormModal';
import { TrialComparisonModal } from './TrialComparisonModal';
import {
  Search,
  Plus,
  SlidersHorizontal,
  CheckCircle2,
  AlertCircle,
  FlaskConical,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

export const TrialsModule: React.FC = () => {
  const { pruebas, proyectos, empleados, openProjectDetail, updatePrueba } = useApp();

  const [search, setSearch] = useState('');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [resultFilter, setResultFilter] = useState<string>('all');
  const [approvedFilter, setApprovedFilter] = useState<string>('all');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPrueba, setSelectedPrueba] = useState<Prueba | null>(null);
  const [compareProjectId, setCompareProjectId] = useState<string | null>(null);

  const filtered = pruebas.filter((p) => {
    const parentProy = proyectos.find((pr) => pr.id === p.proyectoId);
    const matchesSearch =
      p.nombrePrueba.toLowerCase().includes(search.toLowerCase()) ||
      p.codigo.toLowerCase().includes(search.toLowerCase()) ||
      p.objetivo.toLowerCase().includes(search.toLowerCase()) ||
      (parentProy && parentProy.nombre.toLowerCase().includes(search.toLowerCase()));

    const matchesProject = projectFilter === 'all' || p.proyectoId === projectFilter;
    const matchesResult = resultFilter === 'all' || p.resultado === resultFilter;
    const matchesApproved =
      approvedFilter === 'all' ||
      (approvedFilter === 'approved' && p.pruebaAprobada) ||
      (approvedFilter === 'pending' && !p.pruebaAprobada);

    return matchesSearch && matchesProject && matchesResult && matchesApproved;
  });

  const handleEdit = (prueba: Prueba) => {
    setSelectedPrueba(prueba);
    setIsFormOpen(true);
  };

  const handleNew = () => {
    setSelectedPrueba(null);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Pruebas y Ensayos de Formulación
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Módulo 3: Registro de variaciones de receta, parámetros de amasado, catas sensoriales e histórico comparativo
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {proyectos.length > 0 && (
            <button
              onClick={() => setCompareProjectId(proyectos[0].id)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg shadow-2xs transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Comparar Ensayos</span>
            </button>
          )}

          <button
            onClick={handleNew}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-amber-800 hover:bg-amber-900 rounded-lg shadow-2xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>+ Nuevo Ensayo</span>
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
            placeholder="Buscar por prueba, objetivo, ingrediente o proyecto..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-700 max-w-[200px] truncate"
          >
            <option value="all">Todos los Proyectos ({proyectos.length})</option>
            {proyectos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.codigo} - {p.nombre.substring(0, 30)}...
              </option>
            ))}
          </select>

          <select
            value={resultFilter}
            onChange={(e) => setResultFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-700"
          >
            <option value="all">Todos los Resultados</option>
            <option value="Satisfactorio">Satisfactorio</option>
            <option value="Ajustar parámetros">Ajustar parámetros</option>
            <option value="Rechazado">Rechazado</option>
            <option value="Pendiente cata">Pendiente cata</option>
          </select>

          <select
            value={approvedFilter}
            onChange={(e) => setApprovedFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-700"
          >
            <option value="all">Cualquier Validación</option>
            <option value="approved">Solo Aprobadas</option>
            <option value="pending">En Ajuste / Pendientes</option>
          </select>
        </div>
      </div>

      {/* Trials List Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((prueba) => {
          const parentProy = proyectos.find((p) => p.id === prueba.proyectoId);
          const tester = empleados.find((e) => e.id === prueba.responsableId);
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
              className="border border-slate-200 rounded-xl p-5 bg-white shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <span className="font-mono font-bold text-amber-900 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                        {prueba.codigo}
                      </span>
                      <span>·</span>
                      <span className="tabular-nums">{prueba.fechaRealizacion}</span>
                      <span>·</span>
                      <span className="text-slate-600 font-medium">Ensayo #{prueba.numeroPrueba}</span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 mt-1">
                      {prueba.nombrePrueba}
                    </h3>

                    {parentProy && (
                      <button
                        onClick={() => openProjectDetail(parentProy.id, 'pruebas')}
                        className="text-[11px] text-amber-800 hover:underline font-semibold flex items-center gap-1 mt-0.5"
                      >
                        <span>Proyecto: {parentProy.codigo} - {parentProy.nombre.substring(0, 35)}...</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold shrink-0 ${
                      prueba.pruebaAprobada
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {prueba.pruebaAprobada ? '✓ Aprobada' : prueba.resultado}
                  </span>
                </div>

                {/* Formulation and Photo teaser */}
                <div className="flex gap-3 text-xs">
                  {prueba.fotografias && prueba.fotografias.length > 0 && (
                    <img
                      src={prueba.fotografias[0]}
                      alt="Prueba de pastelería"
                      className="w-20 h-20 rounded-lg object-cover border border-slate-200 shrink-0"
                    />
                  )}

                  <div className="space-y-1.5 flex-1 min-w-0">
                    <p className="text-slate-700 line-clamp-2">
                      <span className="font-semibold text-slate-900">Objetivo: </span>
                      {prueba.objetivo}
                    </p>

                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <span>{prueba.formulacion.length} ingredientes</span>
                      <span>·</span>
                      <span className="font-mono font-semibold text-amber-900">
                        Cata: {sensorialAvg}/10
                      </span>
                    </div>

                    {prueba.evaluacionSensorial.comentarios && (
                      <p className="text-[11px] text-slate-500 italic truncate">
                        "{prueba.evaluacionSensorial.comentarios}"
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-4 text-xs">
                <span className="text-slate-400 text-[11px]">
                  Resp: {tester ? `${tester.nombre} ${tester.apellidos.split(' ')[0]}` : 'Técnico'}
                </span>

                <div className="flex items-center gap-2">
                  {parentProy && (
                    <button
                      onClick={() => setCompareProjectId(parentProy.id)}
                      className="text-slate-600 hover:text-slate-900 font-medium px-2 py-1 rounded hover:bg-slate-100"
                    >
                      Comparar
                    </button>
                  )}
                  <button
                    onClick={() => handleEdit(prueba)}
                    className="px-2.5 py-1 text-xs font-semibold text-amber-800 hover:bg-amber-50 rounded transition-colors"
                  >
                    Ver / Editar Ensayo
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="md:col-span-2 text-center py-12 bg-white rounded-xl border border-dashed border-slate-200">
            <FlaskConical className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-700">No se encontraron ensayos</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Ajusta los filtros de proyecto o registra una nueva prueba.
            </p>
          </div>
        )}
      </div>

      {isFormOpen && (
        <TrialFormModal
          prueba={selectedPrueba}
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
        />
      )}

      {compareProjectId && (
        <TrialComparisonModal
          projectId={compareProjectId}
          isOpen={!!compareProjectId}
          onClose={() => setCompareProjectId(null)}
        />
      )}
    </div>
  );
};
