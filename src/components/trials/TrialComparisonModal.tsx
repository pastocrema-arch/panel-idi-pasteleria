import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Prueba } from '../../types';
import { X, CheckCircle2, SlidersHorizontal, ArrowRight } from 'lucide-react';

interface TrialComparisonModalProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const TrialComparisonModal: React.FC<TrialComparisonModalProps> = ({
  projectId,
  isOpen,
  onClose,
}) => {
  const { proyectos, pruebas, getEmpleado } = useApp();

  const proyecto = proyectos.find((p) => p.id === projectId);
  const projectTrials = pruebas.filter((p) => p.proyectoId === projectId);

  // Default selection: up to first 2 or 3 trials
  const [selectedTrialIds, setSelectedTrialIds] = useState<string[]>(
    projectTrials.slice(0, 3).map((p) => p.id)
  );

  if (!isOpen || !proyecto) return null;

  const toggleTrialSelection = (id: string) => {
    if (selectedTrialIds.includes(id)) {
      if (selectedTrialIds.length <= 1) return; // Keep at least 1
      setSelectedTrialIds(selectedTrialIds.filter((t) => t !== id));
    } else {
      if (selectedTrialIds.length >= 3) {
        // Swap last
        setSelectedTrialIds([selectedTrialIds[0], selectedTrialIds[1], id]);
      } else {
        setSelectedTrialIds([...selectedTrialIds, id]);
      }
    }
  };

  const comparedTrials = projectTrials.filter((p) => selectedTrialIds.includes(p.id));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl border border-slate-200 overflow-hidden my-6 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2 text-xs">
              <span className="font-mono font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                {proyecto.codigo}
              </span>
              <span className="text-slate-400">/</span>
              <span className="text-slate-700 font-semibold">{proyecto.nombre}</span>
            </div>
            <h2 className="text-base font-bold text-slate-900 mt-0.5">
              Comparativa Técnica y Evolución Histórica de Ensayos
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Trial Selector Strip */}
        <div className="px-6 py-3 border-b border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-slate-700">Seleccionar ensayos (máx. 3):</span>
            <div className="flex flex-wrap gap-1.5">
              {projectTrials.map((p) => {
                const isSelected = selectedTrialIds.includes(p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => toggleTrialSelection(p.id)}
                    className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors border ${
                      isSelected
                        ? 'bg-amber-800 text-white border-amber-800 shadow-2xs font-semibold'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Ensayo #{p.numeroPrueba} ({p.fechaRealizacion.substring(5)})
                  </button>
                );
              })}
            </div>
          </div>
          <span className="text-xs text-slate-400">
            Comparando {comparedTrials.length} de {projectTrials.length} pruebas
          </span>
        </div>

        {/* Side by side comparison body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          <div className={`grid grid-cols-1 md:grid-cols-${comparedTrials.length} gap-4`}>
            {comparedTrials.map((trial) => {
              const tester = getEmpleado(trial.responsableId);
              const sensorialAvg = (
                (trial.evaluacionSensorial.textura +
                  trial.evaluacionSensorial.sabor +
                  trial.evaluacionSensorial.aspectoVisual +
                  trial.evaluacionSensorial.aroma +
                  trial.evaluacionSensorial.estabilidad) /
                5
              ).toFixed(1);

              return (
                <div
                  key={trial.id}
                  className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs flex flex-col justify-between"
                >
                  {/* Photo if present */}
                  {trial.fotografias && trial.fotografias.length > 0 && (
                    <div className="h-40 relative border-b border-slate-200 bg-slate-100">
                      <img
                        src={trial.fotografias[0]}
                        alt={trial.nombrePrueba}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            trial.pruebaAprobada
                              ? 'bg-emerald-600 text-white'
                              : 'bg-amber-600 text-white'
                          }`}
                        >
                          {trial.pruebaAprobada ? '✓ Aprobada' : trial.resultado}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="p-4 space-y-4 flex-1">
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span className="font-mono font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          Ensayo #{trial.numeroPrueba}
                        </span>
                        <span className="tabular-nums">{trial.fechaRealizacion}</span>
                      </div>
                      <h3 className="text-xs font-bold text-slate-900 mt-1 line-clamp-2">
                        {trial.nombrePrueba}
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Resp: {tester?.nombre} {tester?.apellidos.split(' ')[0]}
                      </p>
                    </div>

                    {/* Sensorial Summary */}
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">Puntuación Sensorial:</span>
                        <span className="font-mono font-bold text-amber-900 tabular-nums">
                          {sensorialAvg} / 10
                        </span>
                      </div>

                      <div className="space-y-1 text-[11px]">
                        {[
                          { label: 'Sabor', score: trial.evaluacionSensorial.sabor },
                          { label: 'Textura', score: trial.evaluacionSensorial.textura },
                          { label: 'Visual', score: trial.evaluacionSensorial.aspectoVisual },
                          { label: 'Aroma', score: trial.evaluacionSensorial.aroma },
                          { label: 'Estabilidad', score: trial.evaluacionSensorial.estabilidad },
                        ].map((m) => (
                          <div key={m.label} className="flex justify-between text-slate-600">
                            <span>{m.label}</span>
                            <span className="font-mono font-medium">{m.score}/10</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Formulation */}
                    <div className="space-y-1.5 text-xs">
                      <span className="font-bold text-slate-800">Formulación y % Panadero:</span>
                      <div className="border border-slate-200 rounded-lg overflow-hidden">
                        <table className="w-full text-[11px]">
                          <thead className="bg-slate-100/70 text-slate-500 font-semibold border-b border-slate-200">
                            <tr>
                              <th className="py-1 px-2 text-left">Ingrediente</th>
                              <th className="py-1 px-2 text-right">g</th>
                              <th className="py-1 px-2 text-right">%</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {trial.formulacion.map((item) => (
                              <tr key={item.id}>
                                <td className="py-1 px-2 truncate max-w-[120px]">{item.ingrediente}</td>
                                <td className="py-1 px-2 text-right font-mono tabular-nums">
                                  {item.cantidadGramos}
                                </td>
                                <td className="py-1 px-2 text-right font-mono text-slate-500 tabular-nums">
                                  {item.porcentajeBakers ? `${item.porcentajeBakers}%` : '-'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Modifications & Notes */}
                    <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
                      <div>
                        <span className="font-semibold text-slate-700">Ajustes respecto al anterior:</span>
                        <p className="text-[11px] text-slate-600 mt-0.5">
                          {trial.modificacionesRealizadas || '-'}
                        </p>
                      </div>

                      {trial.evaluacionSensorial.comentarios && (
                        <div>
                          <span className="font-semibold text-slate-700">Dictamen de cata:</span>
                          <p className="text-[11px] text-slate-600 italic mt-0.5">
                            "{trial.evaluacionSensorial.comentarios}"
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50/70 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cerrar Comparativa
          </button>
        </div>
      </div>
    </div>
  );
};
