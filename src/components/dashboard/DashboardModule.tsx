import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  FolderKanban,
  Clock,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  FlaskConical,
  FileText,
  Calendar,
  ArrowRight,
  ChevronRight,
  Sparkles,
  Laptop,
  Cloud,
  RefreshCw,
} from 'lucide-react';

export const DashboardModule: React.FC<{
  onOpenNewRequest: () => void;
  onOpenNewProject: () => void;
  onOpenNewTimeEntry: () => void;
}> = ({ onOpenNewRequest, onOpenNewProject, onOpenNewTimeEntry }) => {
  const {
    proyectos,
    solicitudes,
    pruebas,
    registrosHoras,
    documentos,
    empleados,
    auditoria,
    openProjectDetail,
    setActiveModule,
    currentUser,
    isCloudConnected,
    loginWithGoogle,
    isSyncing,
    lastSyncedTime,
    syncError,
  } = useApp();

  const [isLoggingIn, setIsLoggingIn] = React.useState(false);

  const handleLoginClick = async () => {
    try {
      setIsLoggingIn(true);
      await loginWithGoogle();
    } catch {
      // Handled in loginWithGoogle
    } finally {
      setIsLoggingIn(false);
    }
  };

  const now = new Date();

  // Metrics
  const activeProjects = proyectos.filter(
    (p) => p.estado === 'En curso' || p.estado === 'En validación'
  );
  const pendingProjects = proyectos.filter((p) => p.estado === 'Pendiente');
  const completedThisMonth = proyectos.filter((p) => {
    if (p.estado !== 'Finalizado' || !p.fechaCierre) return false;
    const closeDate = new Date(p.fechaCierre);
    return (
      closeDate.getMonth() === now.getMonth() &&
      closeDate.getFullYear() === now.getFullYear()
    );
  });
  const overdueProjects = proyectos.filter((p) => {
    if (p.estado === 'Finalizado' || p.estado === 'Cancelado') return false;
    return new Date(p.fechaFinalPrevista) < now;
  });

  const pendingRequests = solicitudes.filter(
    (s) => s.estado === 'Nueva solicitud' || s.estado === 'Pendiente de evaluación'
  );

  // Group projects by family
  const families: Record<string, number> = {};
  proyectos.forEach((p) => {
    families[p.familia] = (families[p.familia] || 0) + 1;
  });

  // Group by status
  const statusCounts = {
    'En curso': proyectos.filter((p) => p.estado === 'En curso').length,
    'En validación': proyectos.filter((p) => p.estado === 'En validación').length,
    'Pendiente': proyectos.filter((p) => p.estado === 'Pendiente').length,
    'Finalizado': proyectos.filter((p) => p.estado === 'Finalizado').length,
  };

  // Total hours logged this month
  const totalHoursLogged = registrosHoras.reduce(
    (acc, curr) => acc + (curr.tiempoHoras || 0),
    0
  );

  return (
    <div className="space-y-8">
      {/* Retraso / Alerta Banner */}
      {overdueProjects.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-rose-900">
          <div className="flex items-start sm:items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5 sm:mt-0" />
            <div>
              <p className="text-sm font-semibold">
                Atención: Hay {overdueProjects.length} proyecto(s) fuera de la fecha prevista
              </p>
              <div className="text-xs text-rose-700 mt-0.5 flex flex-wrap gap-x-2">
                {overdueProjects.map((p) => (
                  <span key={p.id}>
                    • {p.codigo} ({p.nombre.substring(0, 32)}...)
                  </span>
                ))}
              </div>
            </div>
          </div>
          <button
            onClick={() => setActiveModule('proyectos')}
            className="self-start sm:self-auto px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap"
          >
            Revisar Proyectos
          </button>
        </div>
      )}

      {/* Hero Welcome / Department Summary Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Panel General I+D+i de Pastelería
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Control central de formulaciones, ensayos técnicos, dedicación horaria y pipeline de producto.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenNewProject}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors"
          >
            + Nuevo Proyecto
          </button>
          <button
            onClick={onOpenNewTimeEntry}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-amber-800 hover:bg-amber-900 rounded-lg shadow-2xs transition-colors"
          >
            Registrar Horas
          </button>
        </div>
      </div>

      {/* Sincronización Multidispositivo (Ordenador A <-> Ordenador B) */}
      <div className={`rounded-xl border p-4 transition-all ${
        isCloudConnected
          ? 'bg-gradient-to-r from-emerald-50/70 via-teal-50/50 to-white border-emerald-200/80 shadow-2xs'
          : 'bg-gradient-to-r from-amber-50/80 via-orange-50/40 to-white border-amber-200/90 shadow-2xs'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              isCloudConnected ? 'bg-emerald-600 text-white shadow-xs' : 'bg-amber-600 text-white shadow-xs'
            }`}>
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-800">
                  {isCloudConnected ? 'Sincronización Multidispositivo Activa' : 'Sincronización entre Varios Ordenadores'}
                </h3>
                {isCloudConnected ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                    En tiempo real
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                    Conexión pendiente
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                {isCloudConnected
                  ? `Conectado como ${currentUser?.email}. Cualquier cambio en proyectos, pruebas u horas guardado en este ordenador se actualiza de inmediato en el resto de ordenadores de pastelería.`
                  : 'Para que los datos introducidos en el Ordenador A se reflejen automáticamente en el Ordenador B y viceversa, inicia sesión con Google en cada equipo.'}
              </p>
              {isCloudConnected && lastSyncedTime && (
                <p className="text-[11px] text-slate-400 mt-1 font-mono">
                  Última sincronización con la nube: {lastSyncedTime.toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            {isCloudConnected ? (
              <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-white/80 border border-emerald-200 px-3 py-1.5 rounded-lg shadow-2xs">
                {isSyncing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                    <span>Sincronizando...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Base de datos compartida OK</span>
                  </>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-end gap-1">
                <button
                  onClick={handleLoginClick}
                  disabled={isLoggingIn}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white bg-amber-800 hover:bg-amber-900 rounded-lg shadow-xs transition-colors disabled:opacity-75"
                >
                  {isLoggingIn ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Cloud className="w-4 h-4" />
                  )}
                  <span>{isLoggingIn ? 'Abriendo Google...' : 'Activar Sincronización Google'}</span>
                </button>
                {syncError && (
                  <p className="text-[11px] text-rose-700 max-w-xs text-right mt-1 font-medium">
                    {syncError}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Proyectos activos</span>
            <FolderKanban className="w-4 h-4 text-amber-700" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900 tabular-nums">
              {activeProjects.length}
            </span>
            <span className="text-xs text-slate-500">en desarrollo</span>
          </div>
          <div className="mt-3 text-xs text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2">
            <span>{statusCounts['En validación']} en validación</span>
            <button
              onClick={() => setActiveModule('proyectos')}
              className="text-amber-800 hover:underline font-medium"
            >
              Ver todos →
            </button>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Pendientes de iniciar</span>
            <Calendar className="w-4 h-4 text-sky-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900 tabular-nums">
              {pendingProjects.length}
            </span>
            <span className="text-xs text-slate-500">planificados</span>
          </div>
          <div className="mt-3 text-xs text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2">
            <span>{pendingRequests.length} solicitudes en cola</span>
            <button
              onClick={() => setActiveModule('solicitudes')}
              className="text-amber-800 hover:underline font-medium"
            >
              Evaluar →
            </button>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Finalizados este mes</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900 tabular-nums">
              {completedThisMonth.length}
            </span>
            <span className="text-xs text-emerald-600 font-medium">cerrados con éxito</span>
          </div>
          <div className="mt-3 text-xs text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2">
            <span>{proyectos.filter((p) => p.estado === 'Finalizado').length} en histórico</span>
            <span className="text-slate-400">100% fichas OK</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Fuera de plazo</span>
            <AlertTriangle className={`w-4 h-4 ${overdueProjects.length > 0 ? 'text-rose-600' : 'text-slate-400'}`} />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span
              className={`text-3xl font-bold tabular-nums ${
                overdueProjects.length > 0 ? 'text-rose-600' : 'text-slate-900'
              }`}
            >
              {overdueProjects.length}
            </span>
            <span className="text-xs text-slate-500">requieren acción</span>
          </div>
          <div className="mt-3 text-xs text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2">
            <span>{totalHoursLogged} h dedicadas</span>
            <button
              onClick={() => setActiveModule('horas')}
              className="text-amber-800 hover:underline font-medium"
            >
              Imputaciones →
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Projects by family & Status breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Active Projects Spotlight & Family Distribution */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Projects Table/Cards */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Proyectos en Curso y Validación
                </h2>
                <p className="text-xs text-slate-500">
                  Seguimiento de formulaciones prioritarias en el obrador y laboratorio
                </p>
              </div>
              <button
                onClick={() => setActiveModule('proyectos')}
                className="text-xs font-semibold text-amber-800 hover:text-amber-900 flex items-center gap-1"
              >
                Ver todos ({proyectos.length}) <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {activeProjects.slice(0, 4).map((proy) => {
                const trialsCount = pruebas.filter((pr) => pr.proyectoId === proy.id).length;
                const hoursLogged = registrosHoras
                  .filter((h) => h.proyectoId === proy.id)
                  .reduce((acc, curr) => acc + (curr.tiempoHoras || 0), 0);
                const isOverdue = new Date(proy.fechaFinalPrevista) < now;

                return (
                  <div
                    key={proy.id}
                    onClick={() => openProjectDetail(proy.id)}
                    className="group border border-slate-200 hover:border-amber-400/80 rounded-lg p-4 transition-all hover:bg-slate-50/70 cursor-pointer"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-start gap-3">
                        {proy.imagenUrl ? (
                          <img
                            src={proy.imagenUrl}
                            alt={proy.nombre}
                            className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center font-bold text-xs shrink-0">
                            {proy.codigo.split('-')[2]}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-semibold text-slate-600">
                              {proy.codigo}
                            </span>
                            <span className="text-xs text-slate-400">·</span>
                            <span className="text-xs font-medium text-slate-600">
                              {proy.familia}
                            </span>
                            <span className="text-xs text-slate-400">·</span>
                            <span
                              className={`text-xs font-semibold ${
                                proy.prioridad === 'Urgente'
                                  ? 'text-rose-600'
                                  : proy.prioridad === 'Alta'
                                  ? 'text-amber-700'
                                  : 'text-slate-600'
                              }`}
                            >
                              {proy.prioridad}
                            </span>
                          </div>
                          <h3 className="text-sm font-semibold text-slate-900 group-hover:text-amber-800 transition-colors mt-0.5 line-clamp-1">
                            {proy.nombre}
                          </h3>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 self-end sm:self-auto text-xs text-slate-500">
                        <div className="text-right">
                          <span className="text-slate-900 font-semibold tabular-nums">
                            {proy.porcentajeAvance}%
                          </span>
                          <span className="block text-[11px] text-slate-400">avance</span>
                        </div>
                        <div className="text-right">
                          <span className="text-slate-900 font-medium tabular-nums">
                            {hoursLogged} / {proy.horasEstimadas}h
                          </span>
                          <span className="block text-[11px] text-slate-400">{trialsCount} ensayos</span>
                        </div>
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-sm ${
                            proy.estado === 'En validación'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : isOverdue
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {isOverdue ? 'Atrasado' : proy.estado}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full transition-all rounded-full ${
                          proy.estado === 'En validación'
                            ? 'bg-purple-600'
                            : isOverdue
                            ? 'bg-rose-500'
                            : 'bg-amber-700'
                        }`}
                        style={{ width: `${Math.min(100, proy.porcentajeAvance)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Distribution by Product Family */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs">
            <h2 className="text-base font-bold text-slate-900 mb-1">
              Proyectos por Familia de Producto
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Distribución de la carga de innovación según la gama pastelera
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { name: 'Bollería', icon: '🥐' },
                { name: 'Panadería', icon: '🥖' },
                { name: 'Bombonería y chocolate', icon: '🍫' },
                { name: 'Tartas', icon: '🎂' },
                { name: 'Pastelería individual', icon: '🧁' },
                { name: 'Catering', icon: '🥪' },
              ].map((fam) => {
                const count = families[fam.name] || 0;
                const percentage = proyectos.length ? Math.round((count / proyectos.length) * 100) : 0;
                return (
                  <div
                    key={fam.name}
                    className="border border-slate-200 rounded-lg p-3.5 bg-slate-50/50 hover:bg-white transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-lg">{fam.icon}</span>
                      <span className="text-lg font-bold text-slate-900 tabular-nums">
                        {count}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-800 mt-2 truncate">
                      {fam.name}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                      <span>{percentage}% del total</span>
                      <div className="w-16 bg-slate-200 rounded-full h-1">
                        <div
                          className="bg-amber-700 h-1 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Pending Inbound Requests & Recent Lab Activity */}
        <div className="space-y-6">
          {/* Solicitudes de Entrada en espera */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-slate-900">
                Solicitudes de Entrada
              </h2>
              <button
                onClick={() => setActiveModule('solicitudes')}
                className="text-xs font-semibold text-amber-800 hover:underline"
              >
                Gestionar ({solicitudes.length})
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Peticiones de Comercial, Marketing y Producción pendientes de evaluación
            </p>

            <div className="space-y-3">
              {pendingRequests.slice(0, 3).map((sol) => (
                <div
                  key={sol.id}
                  className="p-3 border border-slate-200 rounded-lg bg-slate-50/60 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-mono font-medium">{sol.codigo}</span>
                    <span className="text-amber-900 font-semibold text-[11px] bg-amber-50 px-1.5 py-0.5 rounded">
                      {sol.departamentoSolicitante}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-900 mt-1 line-clamp-2">
                    {sol.nombreSolicitud}
                  </h4>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-200/60 pt-2">
                    <span>Entrega: {sol.fechaEntregaDeseada}</span>
                    <span
                      className={`font-medium ${
                        sol.prioridad === 'Urgente' ? 'text-rose-600' : 'text-slate-600'
                      }`}
                    >
                      {sol.prioridad}
                    </span>
                  </div>
                </div>
              ))}

              {pendingRequests.length === 0 && (
                <p className="text-xs text-slate-400 py-4 text-center">
                  No hay solicitudes pendientes de evaluación.
                </p>
              )}
            </div>

            <button
              onClick={onOpenNewRequest}
              className="mt-4 w-full py-2 px-3 text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 transition-colors text-center block"
            >
              + Registrar Nueva Petición
            </button>
          </div>

          {/* Feed de Trazabilidad y Registro de Cambios */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs">
            <h2 className="text-base font-bold text-slate-900 mb-1">
              Registro de Actividad I+D+i
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Trazabilidad en tiempo real de cambios, catas y validaciones
            </p>

            <div className="space-y-3.5">
              {auditoria.slice(0, 5).map((log) => (
                <div key={log.id} className="text-xs space-y-1 border-b border-slate-100 pb-2.5 last:border-b-0 last:pb-0">
                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span className="font-semibold text-slate-700">{log.usuario}</span>
                    <span className="font-mono tabular-nums">{log.fecha}</span>
                  </div>
                  <p className="text-slate-800 line-clamp-2 font-normal">
                    {log.detalle}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
