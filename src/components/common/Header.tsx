import React, { useState } from 'react';
import { useApp, AppModule } from '../../context/AppContext';
import { Plus, Clock, Cloud, CheckCircle2, RefreshCw, LogIn, LogOut, Laptop } from 'lucide-react';

interface HeaderProps {
  onOpenQuickAction: (action: 'request' | 'project' | 'time') => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenQuickAction }) => {
  const {
    activeModule,
    setActiveModule,
    proyectos,
    currentUser,
    isCloudConnected,
    isSyncing,
    loginWithGoogle,
    logout,
    syncError,
  } = useApp();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const overdueCount = proyectos.filter(
    (p) => p.estado !== 'Finalizado' && p.estado !== 'Cancelado' && new Date(p.fechaFinalPrevista) < new Date()
  ).length;

  const navItems: { id: AppModule; label: string }[] = [
    { id: 'dashboard', label: 'Panel General' },
    { id: 'solicitudes', label: 'Solicitudes' },
    { id: 'proyectos', label: 'Proyectos' },
    { id: 'pruebas', label: 'Pruebas y Ensayos' },
    { id: 'horas', label: 'Control Horario' },
    { id: 'documentos', label: 'Documentación' },
    { id: 'equipo', label: 'Equipo' },
    { id: 'informes', label: 'Informes' },
  ];

  const handleLogin = async () => {
    try {
      setIsLoggingIn(true);
      await loginWithGoogle();
    } catch {
      // Handled in loginWithGoogle
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 lg:gap-8 h-16">
          {/* Zone 1: Single text wordmark */}
          <button
            onClick={() => setActiveModule('dashboard')}
            className="text-lg font-bold tracking-tight text-slate-900 hover:text-amber-700 transition-colors whitespace-nowrap shrink-0 flex items-center gap-2"
          >
            <span className="w-8 h-8 rounded-lg bg-amber-700 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              D
            </span>
            <span>DESARROLLOS I+D+i</span>
          </button>

          {/* Zone 2: Navigation links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 overflow-x-auto py-1">
            {navItems.map((item) => {
              const isActive = activeModule === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveModule(item.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-colors ${
                    isActive
                      ? 'bg-amber-50 text-amber-900 border border-amber-200/80 font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  {item.label}
                  {item.id === 'proyectos' && overdueCount > 0 && (
                    <span className="ml-1.5 text-[10px] text-rose-600 font-bold tabular-nums">
                      ({overdueCount}!)
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Multi-device sync badge + Primary actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Multi-computer Cloud Sync status */}
            {isCloudConnected ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/80 hover:bg-emerald-100 transition-colors"
                  title="Sincronización en la nube multidispositivo activa"
                >
                  {isSyncing ? (
                    <RefreshCw className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
                  ) : (
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                  )}
                  <span className="hidden sm:inline font-semibold">Nube sincronizada</span>
                  <Laptop className="w-3.5 h-3.5 text-emerald-700 ml-0.5" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs uppercase">
                        {currentUser?.email?.substring(0, 2) || 'ID'}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-semibold text-slate-800 truncate">
                          {currentUser?.displayName || 'Usuario de Obrador'}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">{currentUser?.email}</p>
                      </div>
                    </div>
                    <div className="py-2.5 text-xs text-slate-600 space-y-1">
                      <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Sincronización multidispositivo activa</span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Cualquier cambio guardado aquí se verá al instante en cualquier otro ordenador conectado.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Cerrar sesión</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={handleLogin}
                disabled={isLoggingIn}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 transition-colors shadow-2xs"
                title="Conectar a la nube para sincronizar entre varios ordenadores (Ordenador A, B, etc.)"
              >
                {isLoggingIn ? (
                  <RefreshCw className="w-3.5 h-3.5 text-amber-700 animate-spin" />
                ) : (
                  <Cloud className="w-3.5 h-3.5 text-amber-700" />
                )}
                <span className="font-semibold">
                  {isLoggingIn ? 'Conectando...' : 'Conectar varios PCs'}
                </span>
              </button>
            )}

            <button
              onClick={() => onOpenQuickAction('time')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
              title="Registrar horas de trabajo rápido"
            >
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Imputar Horas</span>
            </button>
            <button
              onClick={() => onOpenQuickAction('request')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-amber-800 hover:bg-amber-900 rounded-lg shadow-xs transition-colors whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Nueva Solicitud</span>
            </button>
          </div>
        </div>

        {/* Sync notification banner if not logged in */}
        {!isCloudConnected && (
          <div className="bg-amber-50/90 border-t border-amber-200/60 px-3 py-2 flex items-center justify-between gap-3 text-xs text-amber-900">
            <div className="flex items-center gap-2">
              <Laptop className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                <strong>Modo Multidispositivo:</strong> Para sincronizar datos automáticamente entre el Ordenador A, Ordenador B y otros equipos, pulsa en conectar con Google.
                {syncError && <span className="ml-2 text-rose-700 font-semibold">({syncError})</span>}
              </span>
            </div>
            <button
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="shrink-0 inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-amber-900 bg-amber-200/80 hover:bg-amber-200 rounded-md transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{isLoggingIn ? 'Abriendo...' : 'Iniciar sesión'}</span>
            </button>
          </div>
        )}

        {/* Mobile Navigation Bar */}
        <div className="lg:hidden flex items-center gap-1 overflow-x-auto py-2 border-t border-slate-100 scrollbar-none">
          {navItems.map((item) => {
            const isActive = activeModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveModule(item.id)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-colors ${
                  isActive
                    ? 'bg-amber-800 text-white font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
