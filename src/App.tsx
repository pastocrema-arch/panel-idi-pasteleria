import React, { useState } from 'react';
import { AppProvider, useApp, AppModule } from './context/AppContext';
import { Header } from './components/common/Header';
import { DashboardModule } from './components/dashboard/DashboardModule';
import { RequestsModule } from './components/requests/RequestsModule';
import { RequestModal } from './components/requests/RequestModal';
import { ProjectsModule } from './components/projects/ProjectsModule';
import { ProjectFormModal } from './components/projects/ProjectFormModal';
import { ProjectDetailModal } from './components/projects/ProjectDetailModal';
import { TrialsModule } from './components/trials/TrialsModule';
import { TrialFormModal } from './components/trials/TrialFormModal';
import { TrialComparisonModal } from './components/trials/TrialComparisonModal';
import { TimeTrackingModule } from './components/timetracking/TimeTrackingModule';
import { TimeEntryModal } from './components/timetracking/TimeEntryModal';
import { DocumentsModule } from './components/documents/DocumentsModule';
import { DocumentFormModal } from './components/documents/DocumentFormModal';
import { TeamModule } from './components/team/TeamModule';
import { ReportsModule } from './components/reports/ReportsModule';
import { Proyecto, Solicitud } from './types';
import { RotateCcw } from 'lucide-react';

const MainApp: React.FC = () => {
  const {
    activeModule,
    setActiveModule,
    selectedProjectId,
    setSelectedProjectId,
    projectDetailInitialTab,
    setProjectDetailInitialTab,
    resetToDefault,
  } = useApp();

  // Modals state
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Proyecto | null>(null);
  const [convertingRequest, setConvertingRequest] = useState<Solicitud | null>(null);

  const [isTimeEntryOpen, setIsTimeEntryOpen] = useState(false);
  const [targetProjectIdForTime, setTargetProjectIdForTime] = useState<string | undefined>();

  const [isNewTrialOpen, setIsNewTrialOpen] = useState(false);
  const [targetProjectIdForTrial, setTargetProjectIdForTrial] = useState<string | undefined>();

  const [isCompareTrialsOpen, setIsCompareTrialsOpen] = useState(false);
  const [targetProjectIdForCompare, setTargetProjectIdForCompare] = useState<string | undefined>();

  const [isNewDocOpen, setIsNewDocOpen] = useState(false);
  const [targetProjectIdForDoc, setTargetProjectIdForDoc] = useState<string | undefined>();

  const handleQuickAction = (action: 'request' | 'project' | 'time') => {
    if (action === 'request') setIsNewRequestOpen(true);
    if (action === 'project') setIsNewProjectOpen(true);
    if (action === 'time') {
      setTargetProjectIdForTime(undefined);
      setIsTimeEntryOpen(true);
    }
  };

  const handleConvertToProject = (solicitud: Solicitud) => {
    setConvertingRequest(solicitud);
    setEditingProject(null);
    setIsNewProjectOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-amber-100 selection:text-amber-900">
      <Header onOpenQuickAction={handleQuickAction} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeModule === 'dashboard' && (
          <DashboardModule
            onOpenNewRequest={() => setIsNewRequestOpen(true)}
            onOpenNewProject={() => {
              setConvertingRequest(null);
              setEditingProject(null);
              setIsNewProjectOpen(true);
            }}
            onOpenNewTimeEntry={() => {
              setTargetProjectIdForTime(undefined);
              setIsTimeEntryOpen(true);
            }}
          />
        )}

        {activeModule === 'solicitudes' && (
          <RequestsModule onConvertToProject={handleConvertToProject} />
        )}

        {activeModule === 'proyectos' && (
          <ProjectsModule
            onOpenNewProject={() => {
              setConvertingRequest(null);
              setEditingProject(null);
              setIsNewProjectOpen(true);
            }}
            onOpenProjectDetail={(id) => {
              setSelectedProjectId(id);
              setProjectDetailInitialTab('general');
            }}
            onEditProject={(p) => {
              setEditingProject(p);
              setConvertingRequest(null);
              setIsNewProjectOpen(true);
            }}
          />
        )}

        {activeModule === 'pruebas' && <TrialsModule />}

        {activeModule === 'horas' && (
          <TimeTrackingModule
            onOpenNewTimeEntry={() => {
              setTargetProjectIdForTime(undefined);
              setIsTimeEntryOpen(true);
            }}
          />
        )}

        {activeModule === 'documentos' && <DocumentsModule />}

        {activeModule === 'equipo' && <TeamModule />}

        {activeModule === 'informes' && <ReportsModule />}
      </main>

      {/* Detail Project Modal (Ficha del Proyecto con 7 pestañas) */}
      {selectedProjectId && (
        <ProjectDetailModal
          projectId={selectedProjectId}
          initialTab={projectDetailInitialTab}
          onClose={() => setSelectedProjectId(null)}
          onOpenNewTrial={(pId) => {
            setTargetProjectIdForTrial(pId);
            setIsNewTrialOpen(true);
          }}
          onOpenCompareTrials={(pId) => {
            setTargetProjectIdForCompare(pId);
            setIsCompareTrialsOpen(true);
          }}
          onOpenNewTimeEntry={(pId) => {
            setTargetProjectIdForTime(pId);
            setIsTimeEntryOpen(true);
          }}
          onOpenNewDocument={(pId) => {
            setTargetProjectIdForDoc(pId);
            setIsNewDocOpen(true);
          }}
          onEditProject={(p) => {
            setEditingProject(p);
            setConvertingRequest(null);
            setIsNewProjectOpen(true);
          }}
        />
      )}

      {/* Global Modals */}
      {isNewRequestOpen && (
        <RequestModal
          isOpen={isNewRequestOpen}
          onClose={() => setIsNewRequestOpen(false)}
          onConvertToProject={handleConvertToProject}
        />
      )}

      {isNewProjectOpen && (
        <ProjectFormModal
          proyecto={editingProject}
          solicitudOrigen={convertingRequest}
          isOpen={isNewProjectOpen}
          onClose={() => {
            setIsNewProjectOpen(false);
            setEditingProject(null);
            setConvertingRequest(null);
          }}
          onSaved={(newProj) => {
            setSelectedProjectId(newProj.id);
            setActiveModule('proyectos');
          }}
        />
      )}

      {isTimeEntryOpen && (
        <TimeEntryModal
          projectId={targetProjectIdForTime}
          isOpen={isTimeEntryOpen}
          onClose={() => setIsTimeEntryOpen(false)}
        />
      )}

      {isNewTrialOpen && (
        <TrialFormModal
          projectId={targetProjectIdForTrial}
          isOpen={isNewTrialOpen}
          onClose={() => setIsNewTrialOpen(false)}
        />
      )}

      {isCompareTrialsOpen && targetProjectIdForCompare && (
        <TrialComparisonModal
          projectId={targetProjectIdForCompare}
          isOpen={isCompareTrialsOpen}
          onClose={() => setIsCompareTrialsOpen(false)}
        />
      )}

      {isNewDocOpen && (
        <DocumentFormModal
          projectId={targetProjectIdForDoc}
          isOpen={isNewDocOpen}
          onClose={() => setIsNewDocOpen(false)}
        />
      )}

      {/* Quiet Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">DESARROLLOS I+D+i</span>
            <span>·</span>
            <span>Gestión técnica para obradores y laboratorios de pastelería</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                if (confirm('¿Restablecer todos los datos a la demostración inicial?')) {
                  resetToDefault();
                }
              }}
              className="text-slate-500 hover:text-amber-800 flex items-center gap-1 transition-colors"
              title="Restablecer base de datos a ejemplos demostrativos"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restablecer datos de demostración</span>
            </button>
            <span className="text-slate-400">Versión 2.4.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
