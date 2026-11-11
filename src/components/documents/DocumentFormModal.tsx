import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Documento, DocumentType, DocumentStatus } from '../../types';
import { X } from 'lucide-react';

interface DocumentFormModalProps {
  projectId?: string;
  documento?: Documento | null;
  isOpen: boolean;
  onClose: () => void;
}

const TIPOS_DOCUMENTO: DocumentType[] = [
  'Briefing de solicitud',
  'Receta inicial',
  'Receta modificada',
  'Formulación definitiva',
  'Ficha técnica',
  'Escandallo',
  'Ficha de alérgenos',
  'Fotografías',
  'Informe de pruebas',
  'Evaluación sensorial',
  'Propuesta comercial',
  'Documento de industrialización',
  'Validación final',
];

export const DocumentFormModal: React.FC<DocumentFormModalProps> = ({
  projectId: propProjectId,
  documento,
  isOpen,
  onClose,
}) => {
  const { proyectos, empleados, pruebas, addDocumento, updateDocumento } = useApp();

  const [projectId, setProjectId] = useState(
    documento?.proyectoId || propProjectId || (proyectos[0]?.id || '')
  );
  const [nombre, setNombre] = useState(documento?.nombre || '');
  const [tipoDocumento, setTipoDocumento] = useState<DocumentType>(
    documento?.tipoDocumento || 'Ficha técnica'
  );
  const [version, setVersion] = useState(documento?.version || 'v1.0');
  const [responsableId, setResponsableId] = useState(
    documento?.responsableId || (empleados[0]?.id || 'emp-1')
  );
  const [formato, setFormato] = useState<Documento['formato']>(
    documento?.formato || 'PDF'
  );
  const [estadoDocumental, setEstadoDocumental] = useState<DocumentStatus>(
    documento?.estadoDocumental || 'Validado'
  );
  const [pruebaId, setPruebaId] = useState(documento?.pruebaId || '');
  const [observaciones, setObservaciones] = useState(documento?.observaciones || '');

  if (!isOpen) return null;

  const availableTrials = pruebas.filter((p) => p.proyectoId === projectId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !projectId) return;

    const data: Partial<Documento> = {
      nombre,
      proyectoId: projectId,
      pruebaId: pruebaId || undefined,
      tipoDocumento,
      version,
      responsableId,
      formato,
      estadoDocumental,
      observaciones,
      tamano: '1.4 MB',
      fechaCreacion: documento?.fechaCreacion || new Date().toISOString().substring(0, 10),
    };

    if (documento) {
      updateDocumento(documento.id, data);
    } else {
      addDocumento(data);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg border border-slate-200 overflow-hidden my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {documento ? 'Editar Documento Técnico' : 'Subir Documento Técnico / Receta'}
            </h2>
            <p className="text-xs text-slate-500">
              Módulo 5: Control de versiones de recetas, escandallos y fichas técnicas
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
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nombre del Documento *
            </label>
            <input
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. FT-CRO-001 Ficha Técnica Croissant Charentes DOP"
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Proyecto Asociado *
            </label>
            <select
              required
              value={projectId}
              onChange={(e) => {
                setProjectId(e.target.value);
                setPruebaId('');
              }}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700 font-medium"
            >
              {proyectos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.codigo} - {p.nombre.substring(0, 45)}...
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tipo de Documento *
              </label>
              <select
                value={tipoDocumento}
                onChange={(e) => setTipoDocumento(e.target.value as DocumentType)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700"
              >
                {TIPOS_DOCUMENTO.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Versión (Control de cambios) *
              </label>
              <input
                type="text"
                required
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="v1.0, v1.1, v2.0..."
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-amber-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Formato de Archivo
              </label>
              <select
                value={formato}
                onChange={(e) => setFormato(e.target.value as any)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700"
              >
                <option value="PDF">PDF</option>
                <option value="Excel">Excel</option>
                <option value="Word">Word</option>
                <option value="Imagen">Imagen</option>
                <option value="JSON">JSON</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Estado Documental *
              </label>
              <select
                value={estadoDocumental}
                onChange={(e) => setEstadoDocumental(e.target.value as DocumentStatus)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700 font-semibold"
              >
                <option value="Borrador">Borrador</option>
                <option value="Validado">Validado</option>
                <option value="Obsoleto">Obsoleto</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Responsable del Documento
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

            {availableTrials.length > 0 && (
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Vincular a Ensayo Concreto (Opcional)
                </label>
                <select
                  value={pruebaId}
                  onChange={(e) => setPruebaId(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700"
                >
                  <option value="">A nivel general de proyecto</option>
                  {availableTrials.map((t) => (
                    <option key={t.id} value={t.id}>
                      Ensayo #{t.numeroPrueba} - {t.nombrePrueba.substring(0, 35)}...
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Observaciones / Control de Revisiones
            </label>
            <textarea
              rows={2}
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Notas sobre cambios en la formulación respecto a la versión anterior..."
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700"
            />
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
              {documento ? 'Guardar Cambios' : 'Registrar Documento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
