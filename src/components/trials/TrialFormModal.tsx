import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Prueba, FormulationItem, SensoryEvaluation } from '../../types';
import { X, Plus, Trash2, Camera } from 'lucide-react';

interface TrialFormModalProps {
  projectId?: string;
  prueba?: Prueba | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TrialFormModal: React.FC<TrialFormModalProps> = ({
  projectId: propProjectId,
  prueba,
  isOpen,
  onClose,
}) => {
  const { proyectos, empleados, addPrueba, updatePrueba } = useApp();

  const [projectId, setProjectId] = useState(prueba?.proyectoId || propProjectId || (proyectos[0]?.id || ''));
  const [nombrePrueba, setNombrePrueba] = useState(prueba?.nombrePrueba || '');
  const [fechaRealizacion, setFechaRealizacion] = useState(
    prueba?.fechaRealizacion || new Date().toISOString().substring(0, 10)
  );
  const [responsableId, setResponsableId] = useState(
    prueba?.responsableId || (empleados[0]?.id || 'emp-1')
  );
  const [objetivo, setObjetivo] = useState(prueba?.objetivo || '');
  const [modificacionesRealizadas, setModificacionesRealizadas] = useState(
    prueba?.modificacionesRealizadas || ''
  );
  const [resultado, setResultado] = useState<Prueba['resultado']>(
    prueba?.resultado || 'Ajustar parámetros'
  );
  const [incidencias, setIncidencias] = useState(prueba?.incidencias || '');
  const [proximosAjustes, setProximosAjustes] = useState(prueba?.proximosAjustes || '');
  const [pruebaAprobada, setPruebaAprobada] = useState(prueba?.pruebaAprobada || false);

  // Formulación rows
  const [formulacion, setFormulacion] = useState<FormulationItem[]>(
    prueba?.formulacion || [
      { id: 'f-1', ingrediente: 'Harina T45 Fuerza W340', cantidadGramos: 1000, porcentajeBakers: 100 },
      { id: 'f-2', ingrediente: 'Mantequilla Charentes DOP 84%', cantidadGramos: 500, porcentajeBakers: 50 },
      { id: 'f-3', ingrediente: 'Agua fría', cantidadGramos: 540, porcentajeBakers: 54 },
      { id: 'f-4', ingrediente: 'Azúcar blanquilla', cantidadGramos: 100, porcentajeBakers: 10 },
      { id: 'f-5', ingrediente: 'Sal marina fina', cantidadGramos: 20, porcentajeBakers: 2 },
    ]
  );

  // Sensorial scoring
  const [sensorial, setSensorial] = useState<SensoryEvaluation>(
    prueba?.evaluacionSensorial || {
      textura: 8,
      sabor: 8,
      aspectoVisual: 8,
      aroma: 8,
      estabilidad: 8,
      comentarios: '',
    }
  );

  // Photos
  const [fotoUrl, setFotoUrl] = useState(prueba?.fotografias?.[0] || '');

  if (!isOpen) return null;

  const handleAddIngredient = () => {
    setFormulacion([
      ...formulacion,
      {
        id: `f-${Date.now()}`,
        ingrediente: '',
        cantidadGramos: 100,
        porcentajeBakers: 10,
      },
    ]);
  };

  const handleRemoveIngredient = (id: string) => {
    setFormulacion(formulacion.filter((item) => item.id !== id));
  };

  const handleUpdateIngredient = (id: string, field: keyof FormulationItem, value: any) => {
    setFormulacion(
      formulacion.map((item) => {
        if (item.id === id) {
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data: Partial<Prueba> = {
      proyectoId: projectId,
      nombrePrueba: nombrePrueba || `Ensayo de formulación`,
      fechaRealizacion,
      responsableId,
      objetivo,
      formulacion,
      modificacionesRealizadas,
      resultado,
      evaluacionSensorial: sensorial,
      incidencias,
      proximosAjustes,
      pruebaAprobada,
      fotografias: fotoUrl ? [fotoUrl] : prueba?.fotografias || [],
      fechaValidacion: pruebaAprobada ? new Date().toISOString().substring(0, 10) : undefined,
    };

    if (prueba) {
      updatePrueba(prueba.id, data);
    } else {
      addPrueba(data);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl border border-slate-200 overflow-hidden my-6 max-h-[92vh] flex flex-col">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {prueba ? `Editar ${prueba.nombrePrueba}` : 'Registrar Nuevo Ensayo / Prueba de Laboratorio'}
            </h2>
            <p className="text-xs text-slate-500">
              Registro técnico de formulación, parámetros de obrador y evaluación organoléptica
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Proyecto Asociado *
              </label>
              <select
                required
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700 font-medium"
              >
                {proyectos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.codigo} - {p.nombre.substring(0, 45)}...
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Título / Identificador del Ensayo *
              </label>
              <input
                type="text"
                required
                value={nombrePrueba}
                onChange={(e) => setNombrePrueba(e.target.value)}
                placeholder="Ej. Ensayo #3: Variación de hidratación al 58% y curva de tiro"
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Fecha de Realización
              </label>
              <input
                type="date"
                required
                value={fechaRealizacion}
                onChange={(e) => setFechaRealizacion(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Responsable del Ensayo
              </label>
              <select
                value={responsableId}
                onChange={(e) => setResponsableId(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700"
              >
                <option value="">-- Sin asignar --</option>
                {empleados.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.nombre} {emp.apellidos} ({emp.cargo})
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Objetivo de la Prueba
              </label>
              <input
                type="text"
                value={objetivo}
                onChange={(e) => setObjetivo(e.target.value)}
                placeholder="Ej. Comprobar volumen, desarrollo del alveolado y resistencia a la pérdida de crujiente tras 6h..."
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700"
              />
            </div>
          </div>

          {/* Formulación e Ingredientes */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Formulación Utilizada (% Panadero & Gramos)
                </h3>
                <p className="text-[11px] text-slate-500">
                  Ingredientes base, aditivos y proporciones técnicas del ensayo
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddIngredient}
                className="px-2.5 py-1 text-xs font-semibold text-amber-900 bg-white border border-amber-300 hover:bg-amber-50 rounded-lg flex items-center gap-1 shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Ingrediente</span>
              </button>
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-12 gap-2 text-[11px] font-semibold text-slate-500 px-1">
                <span className="col-span-6">Ingrediente / Materia Prima</span>
                <span className="col-span-3 text-right">Cantidad (g)</span>
                <span className="col-span-2 text-right">% Panadero</span>
                <span className="col-span-1 text-center">Acción</span>
              </div>

              {formulacion.map((item) => (
                <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                  <input
                    type="text"
                    value={item.ingrediente}
                    onChange={(e) => handleUpdateIngredient(item.id, 'ingrediente', e.target.value)}
                    placeholder="Nombre del ingrediente"
                    className="col-span-6 text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-amber-700"
                  />
                  <input
                    type="number"
                    step="0.1"
                    value={item.cantidadGramos}
                    onChange={(e) =>
                      handleUpdateIngredient(item.id, 'cantidadGramos', Number(e.target.value))
                    }
                    className="col-span-3 text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white text-right font-mono focus:outline-none focus:ring-1 focus:ring-amber-700"
                  />
                  <input
                    type="number"
                    step="0.1"
                    value={item.porcentajeBakers || 0}
                    onChange={(e) =>
                      handleUpdateIngredient(item.id, 'porcentajeBakers', Number(e.target.value))
                    }
                    placeholder="%"
                    className="col-span-2 text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white text-right font-mono focus:outline-none focus:ring-1 focus:ring-amber-700"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveIngredient(item.id)}
                    className="col-span-1 text-slate-400 hover:text-rose-600 flex justify-center p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Sensory evaluation sliders */}
          <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Evaluación Sensorial del Panel de Cata (Escala 1 a 10)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              {[
                { key: 'sabor', label: 'Sabor y Retrogusto' },
                { key: 'textura', label: 'Textura / Estructura / Crujiente' },
                { key: 'aspectoVisual', label: 'Aspecto Visual / Brillo / Corte' },
                { key: 'aroma', label: 'Aroma Percibido' },
                { key: 'estabilidad', label: 'Estabilidad en Vitrina' },
              ].map((attr) => (
                <div key={attr.key} className="space-y-1">
                  <div className="flex justify-between text-slate-700 font-medium">
                    <span>{attr.label}</span>
                    <span className="font-mono font-bold text-amber-900 tabular-nums">
                      {(sensorial as any)[attr.key]} / 10
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="0.5"
                    value={(sensorial as any)[attr.key]}
                    onChange={(e) =>
                      setSensorial({
                        ...sensorial,
                        [attr.key]: Number(e.target.value),
                      })
                    }
                    className="w-full accent-amber-800 cursor-pointer"
                  />
                </div>
              ))}
            </div>

            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Comentarios y Conclusiones de la Cata:
              </label>
              <textarea
                rows={2}
                value={sensorial.comentarios}
                onChange={(e) => setSensorial({ ...sensorial, comentarios: e.target.value })}
                placeholder="Notas sobre intensidad láctica, untuosidad, acidez, persistencia en boca..."
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700"
              />
            </div>
          </div>

          {/* Process parameters & Incidents */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Modificaciones Realizadas respecto al ensayo anterior
              </label>
              <textarea
                rows={2}
                value={modificacionesRealizadas}
                onChange={(e) => setModificacionesRealizadas(e.target.value)}
                placeholder="Tiempos de reposo, temperatura de horneado, plegados, adición de miel..."
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Próximos Ajustes Recomendados
              </label>
              <textarea
                rows={2}
                value={proximosAjustes}
                onChange={(e) => setProximosAjustes(e.target.value)}
                placeholder="Ajustar tiro de horno a los 12 minutos, reducir sal 2g..."
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Resultado Dictaminado
              </label>
              <select
                value={resultado}
                onChange={(e) => setResultado(e.target.value as any)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700 font-semibold"
              >
                <option value="Ajustar parámetros">Ajustar parámetros</option>
                <option value="Satisfactorio">Satisfactorio</option>
                <option value="Rechazado">Rechazado</option>
                <option value="Pendiente cata">Pendiente cata</option>
              </select>
            </div>

            <div className="flex items-center gap-3 pt-4">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={pruebaAprobada}
                  onChange={(e) => setPruebaAprobada(e.target.checked)}
                  className="rounded text-emerald-700 focus:ring-emerald-600 w-4 h-4"
                />
                <span className="text-xs font-bold text-slate-800">
                  ¿Marcar Prueba como Aprobada Definitivamente?
                </span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
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
              {prueba ? 'Guardar Cambios' : 'Registrar Ensayo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
