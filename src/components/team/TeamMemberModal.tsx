import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Empleado } from '../../types';
import { X } from 'lucide-react';

interface TeamMemberModalProps {
  empleado?: Empleado | null;
  isOpen: boolean;
  onClose: () => void;
}

const ESPECIALIDADES_DISPONIBLES = [
  'Pastelería',
  'Panadería',
  'Chocolatería',
  'Bombonería',
  'Cocina y catering',
  'Tecnología de alimentos',
  'Escandallos y costes',
  'Calidad',
  'Sensorial',
  'Masas fermentadas',
  'Innovación tecnológica',
];

export const TeamMemberModal: React.FC<TeamMemberModalProps> = ({
  empleado,
  isOpen,
  onClose,
}) => {
  const { addEmpleado, updateEmpleado } = useApp();

  const [nombre, setNombre] = useState(empleado?.nombre || '');
  const [apellidos, setApellidos] = useState(empleado?.apellidos || '');
  const [departamento, setDepartamento] = useState(
    empleado?.departamento || 'I+D+i Pastelería'
  );
  const [cargo, setCargo] = useState(empleado?.cargo || 'Pastelero I+D');
  const [email, setEmail] = useState(empleado?.email || '');
  const [horasSemanales, setHorasSemanales] = useState(empleado?.horasSemanales || 40);
  const [activo, setActivo] = useState(empleado?.activo !== undefined ? empleado.activo : true);
  const [especialidades, setEspecialidades] = useState<string[]>(
    empleado?.especialidades || ['Pastelería']
  );

  if (!isOpen) return null;

  const toggleEspecialidad = (esp: string) => {
    if (especialidades.includes(esp)) {
      setEspecialidades(especialidades.filter((e) => e !== esp));
    } else {
      setEspecialidades([...especialidades, esp]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !apellidos.trim()) return;

    const data: Partial<Empleado> = {
      nombre,
      apellidos,
      departamento,
      cargo,
      email: email || `${nombre.toLowerCase()}.${apellidos.toLowerCase().split(' ')[0]}@patisslab.com`,
      horasSemanales: Number(horasSemanales),
      activo,
      especialidades,
    };

    if (empleado) {
      updateEmpleado(empleado.id, data);
    } else {
      addEmpleado(data);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg border border-slate-200 overflow-hidden my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {empleado ? `Editar Ficha: ${empleado.nombre} ${empleado.apellidos}` : 'Nuevo Miembro del Equipo I+D+i'}
            </h2>
            <p className="text-xs text-slate-500">
              Módulo 6: Datos del especialista, especialidades y capacidad semanal
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nombre *
              </label>
              <input
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Marc"
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Apellidos *
              </label>
              <input
                type="text"
                required
                value={apellidos}
                onChange={(e) => setApellidos(e.target.value)}
                placeholder="Ej. Vidal Serra"
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cargo / Especialidad Principal *
              </label>
              <input
                type="text"
                required
                value={cargo}
                onChange={(e) => setCargo(e.target.value)}
                placeholder="Ej. Maestro Chocolatero"
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Departamento
              </label>
              <select
                value={departamento}
                onChange={(e) => setDepartamento(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700"
              >
                <option value="I+D+i Pastelería">I+D+i Pastelería</option>
                <option value="Calidad y Procesos">Calidad y Procesos</option>
                <option value="Dirección Técnica">Dirección Técnica</option>
                <option value="Obrador Central">Obrador Central</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Correo Electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="m.vidal@patisslab.com"
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Horas Disponibles Semanales
              </label>
              <input
                type="number"
                min="5"
                max="60"
                value={horasSemanales}
                onChange={(e) => setHorasSemanales(Number(e.target.value))}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-amber-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Especialidades Técnicas (Selección múltiple)
            </label>
            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200 max-h-36 overflow-y-auto">
              {ESPECIALIDADES_DISPONIBLES.map((esp) => {
                const isSelected = especialidades.includes(esp);
                return (
                  <label
                    key={esp}
                    className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleEspecialidad(esp)}
                      className="rounded text-amber-800 focus:ring-amber-700"
                    />
                    <span>{esp}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={activo}
                onChange={(e) => setActivo(e.target.checked)}
                className="rounded text-amber-800 focus:ring-amber-700"
              />
              <span>Empleado Activo en el Departamento</span>
            </label>
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
              {empleado ? 'Guardar Cambios' : 'Dar de Alta Empleado'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
