import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Proyecto, ProductFamily, ProjectType, Priority, ProjectStatus, Solicitud } from '../../types';
import { X } from 'lucide-react';

interface ProjectFormModalProps {
  proyecto?: Proyecto | null;
  solicitudOrigen?: Solicitud | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (proyecto: Proyecto) => void;
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

const TIPOS_PROYECTO: ProjectType[] = [
  'Nuevo desarrollo',
  'Mejora de producto',
  'Reformulación',
  'Adaptación de formato',
  'Desarrollo para cliente',
  'Innovación tecnológica',
  'Industrialización',
  'Investigación de materias primas',
];

export const ProjectFormModal: React.FC<ProjectFormModalProps> = ({
  proyecto,
  solicitudOrigen,
  isOpen,
  onClose,
  onSaved,
}) => {
  const { addProyecto, updateProyecto, convertirSolicitudEnProyecto, empleados } = useApp();

  const [formData, setFormData] = useState({
    nombre: proyecto?.nombre || solicitudOrigen?.nombreSolicitud || '',
    descripcion: proyecto?.descripcion || solicitudOrigen?.descripcion || '',
    familia: (proyecto?.familia || solicitudOrigen?.familia || 'Bollería') as ProductFamily,
    subfamilia: proyecto?.subfamilia || 'Desarrollo obrador',
    tipoProyecto: (proyecto?.tipoProyecto || solicitudOrigen?.tipoTrabajo || 'Nuevo desarrollo') as ProjectType,
    responsableId: proyecto?.responsableId || (empleados[0]?.id || 'emp-1'),
    colaboradoresIds: proyecto?.colaboradoresIds || [],
    prioridad: (proyecto?.prioridad || solicitudOrigen?.prioridad || 'Media') as Priority,
    fechaInicioPrevista:
      proyecto?.fechaInicioPrevista || new Date().toISOString().substring(0, 10),
    fechaInicioReal: proyecto?.fechaInicioReal || new Date().toISOString().substring(0, 10),
    fechaFinalPrevista:
      proyecto?.fechaFinalPrevista ||
      solicitudOrigen?.fechaEntregaDeseada ||
      new Date(Date.now() + 30 * 86400000).toISOString().substring(0, 10),
    estado: (proyecto?.estado || 'En curso') as ProjectStatus,
    porcentajeAvance: proyecto?.porcentajeAvance || 0,
    horasEstimadas: proyecto?.horasEstimadas || 40,
    cliente: proyecto?.cliente || solicitudOrigen?.cliente || '',
    imagenUrl: proyecto?.imagenUrl || '',
    resultadoFinal: proyecto?.resultadoFinal || '',
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre.trim()) return;

    let savedProject: Proyecto;
    if (solicitudOrigen && !proyecto) {
      savedProject = convertirSolicitudEnProyecto(solicitudOrigen.id, formData);
    } else if (proyecto) {
      updateProyecto(proyecto.id, formData);
      savedProject = { ...proyecto, ...formData };
    } else {
      savedProject = addProyecto(formData);
    }

    if (onSaved) onSaved(savedProject);
    onClose();
  };

  const toggleColaborador = (empId: string) => {
    if (formData.colaboradoresIds.includes(empId)) {
      setFormData({
        ...formData,
        colaboradoresIds: formData.colaboradoresIds.filter((id) => id !== empId),
      });
    } else {
      setFormData({
        ...formData,
        colaboradoresIds: [...formData.colaboradoresIds, empId],
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl border border-slate-200 overflow-hidden my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {proyecto
                ? `Editar Proyecto ${proyecto.codigo}`
                : solicitudOrigen
                ? `Convertir Solicitud ${solicitudOrigen.codigo} en Proyecto`
                : 'Nuevo Proyecto I+D+i de Pastelería'}
            </h2>
            <p className="text-xs text-slate-500">
              Ficha central de desarrollo técnico, planificación y asignación de equipo
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nombre del Proyecto *
              </label>
              <input
                type="text"
                required
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Ej. Croissant Mantequilla DOP Charentes 36 Capas"
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700 focus:border-amber-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Familia de Producto *
              </label>
              <select
                value={formData.familia}
                onChange={(e) => setFormData({ ...formData, familia: e.target.value as ProductFamily })}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700"
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
                Subfamilia / Formato
              </label>
              <input
                type="text"
                value={formData.subfamilia}
                onChange={(e) => setFormData({ ...formData, subfamilia: e.target.value })}
                placeholder="Ej. Hojaldre fermentado / Bombón de molde"
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tipo de Proyecto *
              </label>
              <select
                value={formData.tipoProyecto}
                onChange={(e) =>
                  setFormData({ ...formData, tipoProyecto: e.target.value as ProjectType })
                }
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700"
              >
                {TIPOS_PROYECTO.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Prioridad
              </label>
              <select
                value={formData.prioridad}
                onChange={(e) => setFormData({ ...formData, prioridad: e.target.value as Priority })}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700"
              >
                <option value="Baja">Baja</option>
                <option value="Media">Media</option>
                <option value="Alta">Alta</option>
                <option value="Urgente">Urgente</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Responsable del Proyecto *
              </label>
              <select
                value={formData.responsableId}
                onChange={(e) => setFormData({ ...formData, responsableId: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700 font-medium"
              >
                <option value="">-- Sin asignar --</option>
                {empleados.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.nombre} {emp.apellidos} — {emp.cargo}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cliente o Proyecto Propio
              </label>
              <input
                type="text"
                value={formData.cliente}
                onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
                placeholder="Ej. Grandes Hoteles / Catálogo Propio"
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700"
              />
            </div>

            {/* Colaboradores multi-select checkboxes */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Colaboradores del Equipo I+D+i
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                {empleados.length === 0 ? (
                  <p className="col-span-full text-xs text-slate-400 py-1">
                    No hay miembros registrados en el equipo.
                  </p>
                ) : (
                  empleados
                    .filter((emp) => emp.id !== formData.responsableId)
                    .map((emp) => {
                      const isChecked = formData.colaboradoresIds.includes(emp.id);
                      return (
                        <label
                          key={emp.id}
                          className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleColaborador(emp.id)}
                            className="rounded text-amber-800 focus:ring-amber-700"
                          />
                          <span className="truncate">{emp.nombre} {emp.apellidos.split(' ')[0]}</span>
                        </label>
                      );
                    })
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Fecha Inicio Prevista
              </label>
              <input
                type="date"
                value={formData.fechaInicioPrevista}
                onChange={(e) => setFormData({ ...formData, fechaInicioPrevista: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Fecha Final Prevista (Entrega) *
              </label>
              <input
                type="date"
                required
                value={formData.fechaFinalPrevista}
                onChange={(e) => setFormData({ ...formData, fechaFinalPrevista: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Horas Estimadas de Desarrollo
              </label>
              <input
                type="number"
                min="1"
                step="0.5"
                value={formData.horasEstimadas}
                onChange={(e) => setFormData({ ...formData, horasEstimadas: Number(e.target.value) })}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Estado Actual
              </label>
              <select
                value={formData.estado}
                onChange={(e) => setFormData({ ...formData, estado: e.target.value as ProjectStatus })}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700 font-semibold"
              >
                <option value="Pendiente">Pendiente</option>
                <option value="En curso">En curso</option>
                <option value="En validación">En validación</option>
                <option value="Finalizado">Finalizado</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Descripción y Objetivos Técnicos del Proyecto
              </label>
              <textarea
                rows={3}
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                placeholder="Alcance técnico, objetivos organolépticos, curvas de templado o parámetros de cocción..."
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200 mt-4">
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
              {proyecto ? 'Guardar Cambios' : 'Crear Proyecto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
