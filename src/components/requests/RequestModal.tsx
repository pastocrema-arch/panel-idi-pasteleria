import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Solicitud, ProductFamily, ProjectType, Priority, RequestStatus } from '../../types';
import { X, CheckCircle2, ArrowRightCircle } from 'lucide-react';

interface RequestModalProps {
  solicitud?: Solicitud | null;
  isOpen: boolean;
  onClose: () => void;
  onConvertToProject?: (solicitud: Solicitud) => void;
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

const TIPOS_TRABAJO: ProjectType[] = [
  'Nuevo desarrollo',
  'Mejora de producto',
  'Reformulación',
  'Adaptación de formato',
  'Desarrollo para cliente',
  'Innovación tecnológica',
  'Industrialización',
  'Investigación de materias primas',
];

const DEPARTAMENTOS = ['Comercial', 'Producción', 'Dirección', 'Marketing', 'Calidad', 'Clientes'] as const;

export const RequestModal: React.FC<RequestModalProps> = ({
  solicitud,
  isOpen,
  onClose,
  onConvertToProject,
}) => {
  const { addSolicitud, updateSolicitud, empleados, proyectos, openProjectDetail } = useApp();

  const [formData, setFormData] = useState({
    nombreSolicitud: solicitud?.nombreSolicitud || '',
    solicitante: solicitud?.solicitante || '',
    departamentoSolicitante: solicitud?.departamentoSolicitante || 'Comercial',
    familia: (solicitud?.familia || 'Bollería') as ProductFamily,
    tipoTrabajo: (solicitud?.tipoTrabajo || 'Nuevo desarrollo') as ProjectType,
    cliente: solicitud?.cliente || '',
    fechaSolicitud: solicitud?.fechaSolicitud || new Date().toISOString().substring(0, 10),
    fechaEntregaDeseada:
      solicitud?.fechaEntregaDeseada ||
      new Date(Date.now() + 21 * 86400000).toISOString().substring(0, 10),
    prioridad: (solicitud?.prioridad || 'Media') as Priority,
    estado: (solicitud?.estado || 'Nueva solicitud') as RequestStatus,
    responsableEvaluacion:
      solicitud?.responsableEvaluacion ||
      (empleados[0] ? `${empleados[0].nombre} ${empleados[0].apellidos}` : ''),
    observaciones: solicitud?.observaciones || '',
    descripcion: solicitud?.descripcion || '',
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombreSolicitud.trim()) return;

    if (solicitud) {
      updateSolicitud(solicitud.id, formData);
    } else {
      addSolicitud(formData);
    }
    onClose();
  };

  const associatedProject = solicitud?.proyectoAsociadoId
    ? proyectos.find((p) => p.id === solicitud.proyectoAsociadoId)
    : null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl border border-slate-200 overflow-hidden my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {solicitud ? `Solicitud ${solicitud.codigo}` : 'Nueva Solicitud de Trabajo para I+D+i'}
            </h2>
            <p className="text-xs text-slate-500">
              {solicitud ? 'Evaluación y estado de la petición' : 'Registro de entrada para evaluación de viabilidad'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {associatedProject && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center justify-between">
              <div className="text-xs">
                <span className="font-semibold text-amber-900">Convertida en Proyecto: </span>
                <span className="font-mono text-amber-800 font-medium">
                  {associatedProject.codigo} - {associatedProject.nombre}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  openProjectDetail(associatedProject.id);
                }}
                className="text-xs font-semibold text-amber-900 hover:underline flex items-center gap-1"
              >
                Abrir Ficha Proyecto →
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nombre de la Solicitud / Proyecto Propuesto *
              </label>
              <input
                type="text"
                required
                value={formData.nombreSolicitud}
                onChange={(e) => setFormData({ ...formData, nombreSolicitud: e.target.value })}
                placeholder="Ej. Croissant hojaldrado de mantequilla DOP mayor alveolado"
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700 focus:border-amber-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Solicitante (Persona) *
              </label>
              <input
                type="text"
                required
                value={formData.solicitante}
                onChange={(e) => setFormData({ ...formData, solicitante: e.target.value })}
                placeholder="Ej. Javier Pons"
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700 focus:border-amber-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Departamento Solicitante
              </label>
              <select
                value={formData.departamentoSolicitante}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    departamentoSolicitante: e.target.value as any,
                  })
                }
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700 focus:border-amber-700"
              >
                {DEPARTAMENTOS.map((dep) => (
                  <option key={dep} value={dep}>
                    {dep}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Familia de Producto
              </label>
              <select
                value={formData.familia}
                onChange={(e) => setFormData({ ...formData, familia: e.target.value as ProductFamily })}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700 focus:border-amber-700"
              >
                {FAMILIAS.map((fam) => (
                  <option key={fam} value={fam}>
                    {fam}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tipo de Trabajo
              </label>
              <select
                value={formData.tipoTrabajo}
                onChange={(e) =>
                  setFormData({ ...formData, tipoTrabajo: e.target.value as ProjectType })
                }
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700 focus:border-amber-700"
              >
                {TIPOS_TRABAJO.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cliente o Canal de Destino (Opcional)
              </label>
              <input
                type="text"
                value={formData.cliente}
                onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
                placeholder="Ej. Cadena Hotelera / Retail Premium"
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700 focus:border-amber-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Prioridad Solicitada
              </label>
              <select
                value={formData.prioridad}
                onChange={(e) => setFormData({ ...formData, prioridad: e.target.value as Priority })}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700 focus:border-amber-700"
              >
                <option value="Baja">Baja</option>
                <option value="Media">Media</option>
                <option value="Alta">Alta</option>
                <option value="Urgente">Urgente</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Fecha de Solicitud
              </label>
              <input
                type="date"
                value={formData.fechaSolicitud}
                onChange={(e) => setFormData({ ...formData, fechaSolicitud: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700 focus:border-amber-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Fecha Solicitada de Entrega
              </label>
              <input
                type="date"
                value={formData.fechaEntregaDeseada}
                onChange={(e) => setFormData({ ...formData, fechaEntregaDeseada: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700 focus:border-amber-700"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Descripción / Briefing Técnico de la Petición
              </label>
              <textarea
                rows={3}
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                placeholder="Detalla requisitos de sabor, vida útil, condiciones de conservación, temperatura de vitrina o costes objetivo..."
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700 focus:border-amber-700"
              />
            </div>

            {/* Evaluation and Status for existing requests */}
            {solicitud && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Estado de la Solicitud
                  </label>
                  <select
                    value={formData.estado}
                    onChange={(e) =>
                      setFormData({ ...formData, estado: e.target.value as RequestStatus })
                    }
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700 focus:border-amber-700 font-semibold text-slate-800"
                  >
                    <option value="Nueva solicitud">Nueva solicitud</option>
                    <option value="Pendiente de evaluación">Pendiente de evaluación</option>
                    <option value="Aceptada">Aceptada</option>
                    <option value="Rechazada">Rechazada</option>
                    <option value="Convertida en proyecto">Convertida en proyecto</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Responsable de Evaluación I+D+i
                  </label>
                  <select
                    value={formData.responsableEvaluacion}
                    onChange={(e) =>
                      setFormData({ ...formData, responsableEvaluacion: e.target.value })
                    }
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700 focus:border-amber-700"
                  >
                    <option value="">-- Sin asignar --</option>
                    {empleados.map((emp) => (
                      <option key={emp.id} value={`${emp.nombre} ${emp.apellidos}`}>
                        {emp.nombre} {emp.apellidos} ({emp.cargo})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Observaciones Técnicas / Dictamen de Evaluación
                  </label>
                  <textarea
                    rows={2}
                    value={formData.observaciones}
                    onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                    placeholder="Conclusiones sobre viabilidad técnica, capacidad de obrador, costes de materias primas..."
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700 focus:border-amber-700"
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-200 mt-4">
            <div>
              {solicitud &&
                solicitud.estado !== 'Convertida en proyecto' &&
                onConvertToProject && (
                  <button
                    type="button"
                    onClick={() => {
                      onConvertToProject(solicitud);
                      onClose();
                    }}
                    className="px-3.5 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg flex items-center gap-1.5 transition-colors"
                  >
                    <ArrowRightCircle className="w-4 h-4 text-emerald-600" />
                    <span>Aprobar y Convertir en Proyecto</span>
                  </button>
                )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-amber-800 hover:bg-amber-900 rounded-lg shadow-xs transition-colors"
              >
                {solicitud ? 'Guardar Cambios' : 'Registrar Solicitud'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
