import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Documento, DocumentType, DocumentStatus } from '../../types';
import { DocumentFormModal } from './DocumentFormModal';
import {
  Search,
  Plus,
  FileText,
  FileSpreadsheet,
  FileCheck,
  ExternalLink,
  Trash2,
  Filter,
} from 'lucide-react';

export const DocumentsModule: React.FC = () => {
  const { documentos, proyectos, empleados, pruebas, deleteDocumento, openProjectDetail } =
    useApp();

  const [search, setSearch] = useState('');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Documento | null>(null);

  const filtered = documentos.filter((d) => {
    const proy = proyectos.find((p) => p.id === d.proyectoId);
    const matchesSearch =
      d.nombre.toLowerCase().includes(search.toLowerCase()) ||
      d.version.toLowerCase().includes(search.toLowerCase()) ||
      (d.observaciones && d.observaciones.toLowerCase().includes(search.toLowerCase())) ||
      (proy && proy.nombre.toLowerCase().includes(search.toLowerCase()));

    const matchesProject = projectFilter === 'all' || d.proyectoId === projectFilter;
    const matchesType = typeFilter === 'all' || d.tipoDocumento === typeFilter;
    const matchesStatus = statusFilter === 'all' || d.estadoDocumental === statusFilter;

    return matchesSearch && matchesProject && matchesType && matchesStatus;
  });

  const handleEdit = (doc: Documento) => {
    setSelectedDoc(doc);
    setIsModalOpen(true);
  };

  const handleNew = () => {
    setSelectedDoc(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Documentación y Archivos Técnicos
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Módulo 5: Repositorio central de recetas, fichas técnicas, escandallos y alérgenos con trazabilidad de versiones
          </p>
        </div>

        <button
          onClick={handleNew}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-amber-800 hover:bg-amber-900 rounded-lg shadow-2xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Subir Documento</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre de archivo, versión o palabras clave..."
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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-700"
          >
            <option value="all">Todos los Estados</option>
            <option value="Validado">Validado</option>
            <option value="Borrador">Borrador</option>
            <option value="Obsoleto">Obsoleto</option>
          </select>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((doc) => {
          const proy = proyectos.find((p) => p.id === doc.proyectoId);
          const responsable = empleados.find((e) => e.id === doc.responsableId);
          const prueba = doc.pruebaId ? pruebas.find((pr) => pr.id === doc.pruebaId) : null;

          return (
            <div
              key={doc.id}
              className="border border-slate-200 rounded-xl p-4 bg-white shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-slate-800 bg-slate-100 px-1.5 py-0.2 rounded text-[11px]">
                      {doc.version}
                    </span>
                    <span className="text-slate-400">·</span>
                    <span className="text-slate-500 font-mono text-[11px]">{doc.formato}</span>
                  </div>

                  <span
                    className={`text-[11px] font-semibold px-2 py-0.2 rounded ${
                      doc.estadoDocumental === 'Validado'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : doc.estadoDocumental === 'Obsoleto'
                        ? 'bg-slate-100 text-slate-500'
                        : 'bg-amber-50 text-amber-800'
                    }`}
                  >
                    {doc.estadoDocumental}
                  </span>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-slate-900 group-hover:text-amber-800 transition-colors line-clamp-2">
                    {doc.nombre}
                  </h3>

                  <div className="text-[11px] text-slate-500 mt-1">
                    Tipo: <span className="font-medium text-slate-700">{doc.tipoDocumento}</span>
                  </div>

                  {proy && (
                    <button
                      onClick={() => openProjectDetail(proy.id, 'documentos')}
                      className="text-[11px] text-amber-800 hover:underline flex items-center gap-1 mt-1 truncate max-w-full font-medium"
                    >
                      <span>
                        Proyecto: {proy.codigo} - {proy.nombre.substring(0, 25)}...
                      </span>
                      <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                    </button>
                  )}

                  {prueba && (
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Vinculado a: Ensayo #{prueba.numeroPrueba}
                    </p>
                  )}
                </div>

                {doc.observaciones && (
                  <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 line-clamp-2">
                    {doc.observaciones}
                  </p>
                )}
              </div>

              {/* Card Bottom Strip */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-4 text-[11px] text-slate-400">
                <span>{doc.fechaCreacion}</span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(doc)}
                    className="text-slate-600 hover:text-slate-900 font-medium px-2 py-1 rounded hover:bg-slate-100"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() =>
                      alert(`Abriendo visor técnico para: ${doc.nombre} (${doc.version})`)
                    }
                    className="text-amber-800 font-semibold hover:underline"
                  >
                    Descargar
                  </button>
                  <button
                    onClick={() => deleteDocumento(doc.id)}
                    className="text-slate-400 hover:text-rose-600 p-1"
                    title="Eliminar documento"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="md:col-span-3 text-center py-12 bg-white rounded-xl border border-dashed border-slate-200">
            <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-700">No se encontraron documentos</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Prueba con otro filtro o sube una nueva ficha técnica.
            </p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <DocumentFormModal
          documento={selectedDoc}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};
