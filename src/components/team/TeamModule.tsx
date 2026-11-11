import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Empleado } from '../../types';
import { TeamMemberModal } from './TeamMemberModal';
import {
  Users,
  Plus,
  Mail,
  Clock,
  Briefcase,
  FolderKanban,
  CheckCircle2,
  Sliders,
  Trash2,
} from 'lucide-react';

export const TeamModule: React.FC = () => {
  const { empleados, proyectos, registrosHoras, openProjectDetail, deleteEmpleado } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmpleado, setSelectedEmpleado] = useState<Empleado | null>(null);

  const handleEdit = (emp: Empleado) => {
    setSelectedEmpleado(emp);
    setIsModalOpen(true);
  };

  const handleNew = () => {
    setSelectedEmpleado(null);
    setIsModalOpen(true);
  };

  // Summary figures
  const totalCapacity = empleados.reduce((acc, curr) => acc + (curr.horasSemanales || 0), 0);
  const totalActive = empleados.filter((e) => e.activo).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Equipo de Trabajo I+D+i
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Módulo 6: Personas, especialidades culinarias, capacidades semanales y asignación de proyectos
          </p>
        </div>

        <button
          onClick={handleNew}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-amber-800 hover:bg-amber-900 rounded-lg shadow-2xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Añadir Especialista</span>
        </button>
      </div>

      {/* KPI banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <span className="text-xs text-slate-500">Miembros Activos</span>
          <p className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">
            {totalActive} <span className="text-xs text-slate-400 font-normal">de {empleados.length} en plantilla</span>
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <span className="text-xs text-slate-500">Capacidad Total Semanal</span>
          <p className="text-2xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
            {totalCapacity} h/sem
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <span className="text-xs text-slate-500">Ratio Proyectos / Especialista</span>
          <p className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">
            {totalActive > 0
              ? (proyectos.filter((p) => p.estado === 'En curso').length / totalActive).toFixed(1)
              : '0.0'}
            <span className="text-xs text-slate-400 font-normal"> en curso</span>
          </p>
        </div>
      </div>

      {/* Empty State when no members exist */}
      {empleados.length === 0 ? (
        <div className="text-center py-14 bg-white rounded-xl border border-dashed border-slate-300 p-8 space-y-3">
          <div className="w-12 h-12 bg-amber-50 text-amber-800 rounded-full flex items-center justify-center mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">
            No hay miembros en el equipo de trabajo
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Has eliminado a los especialistas anteriores. Añade a los integrantes actuales de tu departamento de I+D+i para asignar responsables a los proyectos y registrar su dedicación horaria.
          </p>
          <button
            onClick={handleNew}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-amber-800 hover:bg-amber-900 rounded-lg shadow-2xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>+ Añadir Especialista</span>
          </button>
        </div>
      ) : (
        /* Team Member Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {empleados.map((emp) => {
            // Projects where emp is lead
            const leadProjects = proyectos.filter((p) => p.responsableId === emp.id);
            // Projects where emp is collaborator
            const collabProjects = proyectos.filter(
              (p) => p.colaboradoresIds.includes(emp.id) && p.responsableId !== emp.id
            );
            // Total logged hours
            const loggedHours = registrosHoras
              .filter((h) => h.empleadoId === emp.id)
              .reduce((a, b) => a + (b.tiempoHoras || 0), 0);

            return (
              <div
                key={emp.id}
                className="border border-slate-200 rounded-xl p-5 bg-white shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-amber-800 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                        {emp.nombre[0]}
                        {emp.apellidos[0]}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">
                          {emp.nombre} {emp.apellidos}
                        </h3>
                        <p className="text-xs text-slate-500">{emp.cargo}</p>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        emp.activo
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {emp.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <Clock className="w-3.5 h-3.5" />
                        Disponibilidad:
                      </span>
                      <span className="font-mono font-semibold text-slate-800 tabular-nums">
                        {emp.horasSemanales} h / semana
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <FolderKanban className="w-3.5 h-3.5" />
                        Proyectos como Responsable:
                      </span>
                      <span className="font-semibold text-amber-900 font-mono">
                        {leadProjects.length}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-slate-500">Horas Registradas Totales:</span>
                      <span className="font-mono font-bold text-slate-900 tabular-nums">
                        {loggedHours.toFixed(1)} h
                      </span>
                    </div>
                  </div>

                  {/* Specialties */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Especialidades:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {emp.especialidades.map((esp) => (
                        <span
                          key={esp}
                          className="text-[11px] text-slate-700 bg-slate-100 px-2 py-0.5 rounded"
                        >
                          {esp}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Assigned Projects list */}
                  {leadProjects.length > 0 && (
                    <div className="space-y-1 border-t border-slate-100 pt-2 text-[11px]">
                      <span className="text-slate-400 font-medium">Liderando:</span>
                      <div className="space-y-1">
                        {leadProjects.slice(0, 2).map((p) => (
                          <button
                            key={p.id}
                            onClick={() => openProjectDetail(p.id)}
                            className="w-full text-left font-medium text-amber-800 hover:underline truncate block"
                          >
                            • {p.codigo}: {p.nombre}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-4 text-xs">
                  <span className="text-slate-400 text-[11px] truncate max-w-[150px]">
                    {emp.email}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleEdit(emp)}
                      className="px-2.5 py-1 text-xs font-semibold text-amber-800 hover:bg-amber-50 rounded transition-colors"
                    >
                      Editar Perfil
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`¿Eliminar a ${emp.nombre} ${emp.apellidos} del equipo?`)) {
                          deleteEmpleado(emp.id);
                        }
                      }}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors"
                      title="Eliminar especialista del equipo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isModalOpen && (
        <TeamMemberModal
          empleado={selectedEmpleado}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};
