import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BarChart3,
  TrendingUp,
  Clock,
  PieChart,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Download,
  Users,
  Printer,
  ChevronRight,
} from 'lucide-react';

export const ReportsModule: React.FC = () => {
  const {
    proyectos,
    solicitudes,
    registrosHoras,
    empleados,
    pruebas,
    getProjectActualHours,
    openProjectDetail,
  } = useApp();

  const [activeReport, setActiveReport] = useState<number>(1);

  // 1. Proyectos por responsable
  const projectsByResponsible = empleados.map((emp) => {
    const list = proyectos.filter((p) => p.responsableId === emp.id);
    const active = list.filter((p) => p.estado === 'En curso' || p.estado === 'En validación').length;
    const completed = list.filter((p) => p.estado === 'Finalizado').length;
    return { emp, list, active, completed, total: list.length };
  });

  // 2. Proyectos por familia
  const families = [
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
  const projectsByFamily = families
    .map((fam) => {
      const list = proyectos.filter((p) => p.familia === fam);
      return {
        family: fam,
        count: list.length,
        percentage: proyectos.length ? Math.round((list.length / proyectos.length) * 100) : 0,
        projects: list,
      };
    })
    .filter((f) => f.count > 0);

  // 3. Horas dedicadas por persona
  const hoursByPerson = empleados.map((emp) => {
    const entries = registrosHoras.filter((h) => h.empleadoId === emp.id);
    const totalHours = entries.reduce((a, b) => a + (b.tiempoHoras || 0), 0);
    return { emp, totalHours, count: entries.length };
  });

  // 4. Horas dedicadas por proyecto
  const hoursByProject = proyectos.map((p) => {
    const actual = getProjectActualHours(p.id);
    return {
      proyecto: p,
      actual,
      estimated: p.horasEstimadas,
      diff: actual - p.horasEstimadas,
      pctConsumed: Math.round((actual / (p.horasEstimadas || 1)) * 100),
    };
  });

  // 5. Solicitudes por departamento
  const departments = ['Comercial', 'Producción', 'Dirección', 'Marketing', 'Calidad', 'Clientes'];
  const requestsByDept = departments.map((dept) => {
    const list = solicitudes.filter((s) => s.departamentoSolicitante === dept);
    const converted = list.filter((s) => s.estado === 'Convertida en proyecto').length;
    return {
      dept,
      total: list.length,
      converted,
      conversionRate: list.length ? Math.round((converted / list.length) * 100) : 0,
    };
  });

  // 6. Porcentaje de proyectos finalizados en plazo
  const completedProjects = proyectos.filter((p) => p.estado === 'Finalizado');
  const onTimeProjects = completedProjects.filter((p) => {
    if (!p.fechaFinalReal) return true;
    return new Date(p.fechaFinalReal) <= new Date(p.fechaFinalPrevista);
  });
  const onTimePercentage = completedProjects.length
    ? Math.round((onTimeProjects.length / completedProjects.length) * 100)
    : 100;

  // 7. Tiempo medio de desarrollo (en días)
  const durations = completedProjects
    .map((p) => {
      const start = new Date(p.fechaInicioReal || p.fechaInicioPrevista);
      const end = new Date(p.fechaFinalReal || p.fechaCierre || p.fechaFinalPrevista);
      const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      return diff > 0 ? diff : 15;
    });
  const avgDurationDays = durations.length
    ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
    : 38;

  // 8. Proyectos pendientes de validación
  const validationProjects = proyectos.filter((p) => p.estado === 'En validación');

  // 9. Proyectos cancelados y motivos
  const cancelledProjects = proyectos.filter((p) => p.estado === 'Cancelado');

  // 10. Comparación de horas previstas vs reales
  const totalEstimatedHours = proyectos.reduce((a, b) => a + (b.horasEstimadas || 0), 0);
  const totalActualHours = registrosHoras.reduce((a, b) => a + (b.tiempoHoras || 0), 0);

  const reportList = [
    { id: 1, title: '1. Proyectos por responsable', desc: 'Distribución de liderazgo y carga técnica por pastelero' },
    { id: 2, title: '2. Proyectos por familia de producto', desc: 'Desglose por bollería, panadería, bombonería, etc.' },
    { id: 3, title: '3. Horas dedicadas por persona', desc: 'Cómputo acumulado de tiempo invertido por especialista' },
    { id: 4, title: '4. Horas dedicadas por proyecto', desc: 'Imputaciones reales sobre presupuesto de horas' },
    { id: 5, title: '5. Solicitudes por departamento', desc: 'Origen de las peticiones recibidas y ratio de conversión' },
    { id: 6, title: '6. % Proyectos finalizados en plazo', desc: 'Cumplimiento de calendarios y fechas límite' },
    { id: 7, title: '7. Tiempo medio de desarrollo', desc: 'Ciclo medio de I+D desde el briefing hasta el cierre' },
    { id: 8, title: '8. Pendientes de validación', desc: 'Fórmulas terminadas en espera de cata final' },
    { id: 9, title: '9. Proyectos cancelados y motivos', desc: 'Descartes de formulación o falta de viabilidad' },
    { id: 10, title: '10. Horas previstas vs reales', desc: 'Análisis global de desviaciones horarias y productividad' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Informes y Análisis de Rendimiento I+D+i
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Módulo 7: Indicadores clave de productividad, cumplimiento de plazos, horas y resultados
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors self-start sm:self-auto"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Imprimir / Exportar PDF</span>
        </button>
      </div>

      {/* Main Grid: Sidebar list of 10 reports + Active report view */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Menu (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-3 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-slate-400 px-3 py-1.5 block uppercase tracking-wider">
            10 Informes de Gestión
          </span>
          {reportList.map((rep) => {
            const isSelected = activeReport === rep.id;
            return (
              <button
                key={rep.id}
                onClick={() => setActiveReport(rep.id)}
                className={`w-full text-left p-2.5 rounded-lg text-xs transition-colors ${
                  isSelected
                    ? 'bg-amber-50 text-amber-900 font-bold border border-amber-200 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{rep.title}</span>
                  {isSelected && <ChevronRight className="w-3.5 h-3.5 text-amber-800" />}
                </div>
                <p className="text-[10px] text-slate-400 font-normal mt-0.5 truncate">
                  {rep.desc}
                </p>
              </button>
            );
          })}
        </div>

        {/* Right Detail Pane (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-6">
          {/* REPORT 1: PROYECTOS POR RESPONSABLE */}
          {activeReport === 1 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  1. Proyectos Asignados por Responsable
                </h2>
                <p className="text-xs text-slate-500">
                  Distribución de proyectos activos, en validación y finalizados por cada jefe de proyecto
                </p>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <tr>
                      <th className="py-2.5 px-4">Responsable</th>
                      <th className="py-2.5 px-4 text-center">En curso</th>
                      <th className="py-2.5 px-4 text-center">Finalizados</th>
                      <th className="py-2.5 px-4 text-right">Total Proyectos</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {projectsByResponsible.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-slate-400">
                          No hay miembros registrados en el equipo. Añade especialistas en el módulo de Equipo.
                        </td>
                      </tr>
                    ) : (
                      projectsByResponsible.map(({ emp, active, completed, total }) => (
                        <tr key={emp.id} className="hover:bg-slate-50/70">
                          <td className="py-2.5 px-4">
                            <span className="font-semibold text-slate-900">
                              {emp.nombre} {emp.apellidos}
                            </span>
                            <span className="block text-[11px] text-slate-400">{emp.cargo}</span>
                          </td>
                          <td className="py-2.5 px-4 text-center font-mono font-medium text-amber-800 tabular-nums">
                            {active}
                          </td>
                          <td className="py-2.5 px-4 text-center font-mono font-medium text-emerald-700 tabular-nums">
                            {completed}
                          </td>
                          <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                            {total}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* REPORT 2: PROYECTOS POR FAMILIA */}
          {activeReport === 2 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  2. Distribución de Proyectos por Familia de Producto
                </h2>
                <p className="text-xs text-slate-500">
                  Segmentación del portafolio técnico entre masas fermentadas, chocolatería, pastelería y catering
                </p>
              </div>

              <div className="space-y-3">
                {projectsByFamily.map((item) => (
                  <div key={item.family} className="border border-slate-100 p-3 rounded-lg bg-slate-50/50">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-semibold text-slate-800">{item.family}</span>
                      <span className="font-mono text-slate-700 font-bold tabular-nums">
                        {item.count} proyectos ({item.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-amber-800 h-2 rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* REPORT 3: HORAS DEDICADAS POR PERSONA */}
          {activeReport === 3 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  3. Horas Totales Dedicadas por Persona
                </h2>
                <p className="text-xs text-slate-500">
                  Cómputo de horas imputadas en proyectos y ensayos por cada miembro del equipo
                </p>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <tr>
                      <th className="py-2.5 px-4">Especialista</th>
                      <th className="py-2.5 px-4 text-center">Partes Registrados</th>
                      <th className="py-2.5 px-4 text-right">Horas Imputadas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {hoursByPerson.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="py-6 text-center text-slate-400">
                          No hay miembros registrados en el equipo.
                        </td>
                      </tr>
                    ) : (
                      hoursByPerson.map(({ emp, totalHours, count }) => (
                        <tr key={emp.id} className="hover:bg-slate-50/70">
                          <td className="py-2.5 px-4 font-medium text-slate-900">
                            {emp.nombre} {emp.apellidos}
                            <span className="block text-[11px] text-slate-400">{emp.cargo}</span>
                          </td>
                          <td className="py-2.5 px-4 text-center font-mono text-slate-600 tabular-nums">
                            {count}
                          </td>
                          <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900 tabular-nums text-sm">
                            {totalHours.toFixed(1)} h
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* REPORT 4: HORAS DEDICADAS POR PROYECTO */}
          {activeReport === 4 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  4. Horas Dedicadas por Proyecto
                </h2>
                <p className="text-xs text-slate-500">
                  Comparativa de horas consumidas frente al presupuesto inicial estimado
                </p>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <tr>
                      <th className="py-2.5 px-4">Proyecto</th>
                      <th className="py-2.5 px-4 text-center">Horas Reales</th>
                      <th className="py-2.5 px-4 text-center">Presupuestadas</th>
                      <th className="py-2.5 px-4 text-right">% Consumo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {hoursByProject.map(({ proyecto, actual, estimated, pctConsumed }) => (
                      <tr key={proyecto.id} className="hover:bg-slate-50/70">
                        <td className="py-2.5 px-4">
                          <span className="font-mono font-semibold text-slate-900">
                            {proyecto.codigo}
                          </span>
                          <span className="block text-slate-700 truncate max-w-xs">
                            {proyecto.nombre}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-center font-mono font-bold text-slate-900 tabular-nums">
                          {actual} h
                        </td>
                        <td className="py-2.5 px-4 text-center font-mono text-slate-500 tabular-nums">
                          {estimated} h
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono tabular-nums">
                          <span
                            className={`font-bold ${
                              pctConsumed > 100 ? 'text-rose-600' : 'text-slate-800'
                            }`}
                          >
                            {pctConsumed}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* REPORT 5: SOLICITUDES POR DEPARTAMENTO */}
          {activeReport === 5 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  5. Solicitudes Recibidas por Departamento
                </h2>
                <p className="text-xs text-slate-500">
                  Volumen de peticiones entrantes y tasa de conversión en proyectos técnicos
                </p>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <tr>
                      <th className="py-2.5 px-4">Departamento</th>
                      <th className="py-2.5 px-4 text-center">Total Recibidas</th>
                      <th className="py-2.5 px-4 text-center">Convertidas a Proyecto</th>
                      <th className="py-2.5 px-4 text-right">Tasa Conversión</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {requestsByDept.map(({ dept, total, converted, conversionRate }) => (
                      <tr key={dept} className="hover:bg-slate-50/70">
                        <td className="py-2.5 px-4 font-semibold text-slate-800">{dept}</td>
                        <td className="py-2.5 px-4 text-center font-mono font-bold text-slate-900 tabular-nums">
                          {total}
                        </td>
                        <td className="py-2.5 px-4 text-center font-mono text-emerald-700 font-semibold tabular-nums">
                          {converted}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono font-bold text-amber-900 tabular-nums">
                          {conversionRate}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* REPORT 6: % PROYECTOS EN PLAZO */}
          {activeReport === 6 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  6. Cumplimiento de Plazos de Entrega (SLA)
                </h2>
                <p className="text-xs text-slate-500">
                  Eficacia temporal en la culminación de desarrollos antes de la fecha límite
                </p>
              </div>

              <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-6 flex flex-col items-center justify-center text-center space-y-2">
                <span className="text-4xl font-bold font-mono text-emerald-800 tabular-nums">
                  {onTimePercentage}%
                </span>
                <p className="text-xs font-semibold text-emerald-950">
                  Proyectos finalizados dentro del plazo previsto
                </p>
                <p className="text-[11px] text-emerald-800">
                  {onTimeProjects.length} de {completedProjects.length} proyectos cerrados cumplieron la fecha
                </p>
              </div>
            </div>
          )}

          {/* REPORT 7: TIEMPO MEDIO DE DESARROLLO */}
          {activeReport === 7 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  7. Tiempo Medio de Ciclo de Desarrollo
                </h2>
                <p className="text-xs text-slate-500">
                  Días promedio transcurridos desde el inicio real hasta la validación y cierre
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center space-y-2">
                <span className="text-4xl font-bold font-mono text-amber-900 tabular-nums">
                  {avgDurationDays} días
                </span>
                <p className="text-xs font-semibold text-slate-800">
                  Ciclo medio de formulación y puesta a punto de un nuevo producto
                </p>
                <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                  Incluye desde la fase de amasado y calibración sensorial hasta la redacción de la ficha técnica final.
                </p>
              </div>
            </div>
          )}

          {/* REPORT 8: PENDIENTES DE VALIDACIÓN */}
          {activeReport === 8 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  8. Proyectos Pendientes de Validación
                </h2>
                <p className="text-xs text-slate-500">
                  Desarrollos que han finalizado sus pruebas técnicas y requieren dictamen de cata o aprobación comercial
                </p>
              </div>

              <div className="space-y-3">
                {validationProjects.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => openProjectDetail(p.id, 'cierre')}
                    className="p-3.5 border border-purple-200 bg-purple-50/40 rounded-xl flex items-center justify-between cursor-pointer hover:bg-purple-50 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-mono font-bold text-purple-900">{p.codigo}</span>
                        <span className="text-purple-400">·</span>
                        <span className="text-purple-800">{p.familia}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 mt-0.5">{p.nombre}</h4>
                    </div>
                    <span className="text-xs font-semibold text-purple-900 hover:underline">
                      Revisar y Validar →
                    </span>
                  </div>
                ))}

                {validationProjects.length === 0 && (
                  <p className="text-xs text-slate-400 py-6 text-center">
                    No hay proyectos pendientes de validación en este momento.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* REPORT 9: PROYECTOS CANCELADOS */}
          {activeReport === 9 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  9. Proyectos Cancelados y Motivos
                </h2>
                <p className="text-xs text-slate-500">
                  Registro de ensayos no viables para conservar el aprendizaje del laboratorio
                </p>
              </div>

              {cancelledProjects.length > 0 ? (
                <div className="space-y-3">
                  {cancelledProjects.map((p) => (
                    <div key={p.id} className="p-3.5 border border-slate-200 rounded-xl bg-slate-50">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono font-bold text-slate-800">{p.codigo}</span>
                        <span className="text-rose-600 font-semibold">Cancelado</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 mt-1">{p.nombre}</h4>
                      <p className="text-[11px] text-slate-600 mt-1">
                        Motivo: {p.motivoCancelacion || 'Inviabilidad sensorial o de costes.'}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <p className="text-xs font-semibold text-slate-700">0 proyectos cancelados</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Todos los desarrollos iniciados se encuentran activos o han culminado con éxito.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* REPORT 10: HORAS PREVISTAS VS REALES */}
          {activeReport === 10 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  10. Desviación Global: Horas Previstas vs Reales
                </h2>
                <p className="text-xs text-slate-500">
                  Balance de precisión en la estimación de dedicación para el departamento de I+D+i
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                  <span className="text-xs text-slate-500">Horas Totales Estimadas</span>
                  <p className="text-2xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
                    {totalEstimatedHours} h
                  </p>
                </div>

                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                  <span className="text-xs text-slate-500">Horas Reales Computadas</span>
                  <p className="text-2xl font-bold font-mono text-amber-900 mt-1 tabular-nums">
                    {totalActualHours.toFixed(1)} h
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed bg-amber-50/60 p-3 rounded-lg border border-amber-200/80">
                La desviación global actual es del{' '}
                <span className="font-bold text-amber-900 font-mono">
                  {Math.round((totalActualHours / (totalEstimatedHours || 1)) * 100)}%
                </span>{' '}
                sobre las previsiones de la cartera de proyectos en desarrollo.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
