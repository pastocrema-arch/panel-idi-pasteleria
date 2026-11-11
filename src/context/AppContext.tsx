import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  Proyecto,
  Solicitud,
  Prueba,
  RegistroHoras,
  Documento,
  Empleado,
  AuditoriaRegistro,
  ProjectStatus,
} from '../types';
import {
  INITIAL_EMPLEADOS,
  INITIAL_SOLICITUDES,
  INITIAL_PROYECTOS,
  INITIAL_PRUEBAS,
  INITIAL_REGISTRO_HORAS,
  INITIAL_DOCUMENTOS,
  INITIAL_AUDITORIA,
} from '../data/mockData';
import {
  auth,
  db,
  googleProvider,
  signInWithPopup,
  signOut,
  cleanPayload,
  handleFirestoreError,
  OperationType,
} from '../lib/firebase';
import {
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  writeBatch,
} from 'firebase/firestore';

export type AppModule =
  | 'dashboard'
  | 'solicitudes'
  | 'proyectos'
  | 'pruebas'
  | 'horas'
  | 'equipo'
  | 'documentos'
  | 'informes';

interface AppContextType {
  activeModule: AppModule;
  setActiveModule: (m: AppModule) => void;
  selectedProjectId: string | null;
  setSelectedProjectId: (id: string | null) => void;
  projectDetailInitialTab: string;
  setProjectDetailInitialTab: (tab: string) => void;
  openProjectDetail: (projectId: string, tab?: string) => void;

  // Multi-Device Cloud Sync State
  currentUser: User | null;
  isAuthReady: boolean;
  isCloudConnected: boolean;
  isSyncing: boolean;
  lastSyncedTime: Date | null;
  syncError: string | null;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;

  // Data
  proyectos: Proyecto[];
  solicitudes: Solicitud[];
  pruebas: Prueba[];
  registrosHoras: RegistroHoras[];
  documentos: Documento[];
  empleados: Empleado[];
  auditoria: AuditoriaRegistro[];

  // Helpers
  getEmpleado: (id: string) => Empleado | undefined;
  getProyecto: (id: string) => Proyecto | undefined;
  getProjectActualHours: (proyectoId: string) => number;
  getEmployeeLoggedHours: (empleadoId: string) => number;

  // Actions
  addSolicitud: (data: Partial<Solicitud>) => Solicitud;
  updateSolicitud: (id: string, updates: Partial<Solicitud>) => void;
  convertirSolicitudEnProyecto: (solicitudId: string, proyectoData?: Partial<Proyecto>) => Proyecto;

  addProyecto: (data: Partial<Proyecto>) => Proyecto;
  updateProyecto: (id: string, updates: Partial<Proyecto>) => void;
  deleteProyecto: (id: string) => void;

  addPrueba: (data: Partial<Prueba>) => Prueba;
  updatePrueba: (id: string, updates: Partial<Prueba>) => void;

  addRegistroHoras: (data: Partial<RegistroHoras>) => RegistroHoras;
  deleteRegistroHoras: (id: string) => void;

  addDocumento: (data: Partial<Documento>) => Documento;
  updateDocumento: (id: string, updates: Partial<Documento>) => void;
  deleteDocumento: (id: string) => void;

  addEmpleado: (data: Partial<Empleado>) => Empleado;
  updateEmpleado: (id: string, updates: Partial<Empleado>) => void;
  deleteEmpleado: (id: string) => void;

  resetToDefault: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PROYECTOS: 'patisslab_proyectos_v3',
  SOLICITUDES: 'patisslab_solicitudes_v3',
  PRUEBAS: 'patisslab_pruebas_v3',
  HORAS: 'patisslab_horas_v3',
  DOCUMENTOS: 'patisslab_documentos_v3',
  EMPLEADOS: 'patisslab_empleados_v3',
  AUDITORIA: 'patisslab_auditoria_v3',
};

const REMOVED_EMPLOYEES = [
  'marc vidal',
  'elena soler',
  'carlos mendoza',
  'sofía aranda',
  'sofia aranda',
  'lucía navarro',
  'lucia navarro',
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeModule, setActiveModule] = useState<AppModule>('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [projectDetailInitialTab, setProjectDetailInitialTab] = useState<string>('general');

  // Firebase auth & cloud sync state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncedTime, setLastSyncedTime] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Local state initialized with cached values or mock data
  const [empleados, setEmpleados] = useState<Empleado[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EMPLEADOS);
    const parsed: Empleado[] = saved ? JSON.parse(saved) : INITIAL_EMPLEADOS;
    return parsed.filter((emp) => {
      const fullName = `${emp.nombre} ${emp.apellidos}`.toLowerCase();
      const isIdMatch = ['emp-1', 'emp-2', 'emp-3', 'emp-4', 'emp-5'].includes(emp.id);
      const isNameMatch = REMOVED_EMPLOYEES.some((rem) => fullName.includes(rem));
      return !isIdMatch && !isNameMatch;
    });
  });

  const [solicitudes, setSolicitudes] = useState<Solicitud[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SOLICITUDES);
    return saved ? JSON.parse(saved) : INITIAL_SOLICITUDES;
  });

  const [proyectos, setProyectos] = useState<Proyecto[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PROYECTOS);
    return saved ? JSON.parse(saved) : INITIAL_PROYECTOS;
  });

  const [pruebas, setPruebas] = useState<Prueba[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PRUEBAS);
    return saved ? JSON.parse(saved) : INITIAL_PRUEBAS;
  });

  const [registrosHoras, setRegistrosHoras] = useState<RegistroHoras[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.HORAS);
    return saved ? JSON.parse(saved) : INITIAL_REGISTRO_HORAS;
  });

  const [documentos, setDocumentos] = useState<Documento[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DOCUMENTOS);
    return saved ? JSON.parse(saved) : INITIAL_DOCUMENTOS;
  });

  const [auditoria, setAuditoria] = useState<AuditoriaRegistro[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUDITORIA);
    return saved ? JSON.parse(saved) : INITIAL_AUDITORIA;
  });

  // LocalStorage persistence for instant offline fallback
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EMPLEADOS, JSON.stringify(empleados));
  }, [empleados]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SOLICITUDES, JSON.stringify(solicitudes));
  }, [solicitudes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROYECTOS, JSON.stringify(proyectos));
  }, [proyectos]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRUEBAS, JSON.stringify(pruebas));
  }, [pruebas]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HORAS, JSON.stringify(registrosHoras));
  }, [registrosHoras]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DOCUMENTOS, JSON.stringify(documentos));
  }, [documentos]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUDITORIA, JSON.stringify(auditoria));
  }, [auditoria]);

  // Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsAuthReady(true);
      setSyncError(null);
    });
    return () => unsubscribe();
  }, []);

  // Track if initial cloud seed check has been done
  const hasCheckedSeed = useRef<boolean>(false);

  // Firestore Real-Time Subscriptions (only attach when user is authenticated)
  useEffect(() => {
    if (!isAuthReady || !currentUser) {
      return;
    }

    setIsSyncing(true);

    // Initial check: if projects collection is empty in Firestore, seed it once so all computers start with sample data
    const seedInitialDataIfNeeded = async () => {
      if (hasCheckedSeed.current) return;
      hasCheckedSeed.current = true;
      try {
        const snap = await getDocs(collection(db, 'proyectos'));
        if (snap.empty) {
          const batch = writeBatch(db);
          INITIAL_PROYECTOS.forEach((p) => {
            batch.set(doc(db, 'proyectos', p.id), cleanPayload(p));
          });
          INITIAL_SOLICITUDES.forEach((s) => {
            batch.set(doc(db, 'solicitudes', s.id), cleanPayload(s));
          });
          INITIAL_PRUEBAS.forEach((pr) => {
            batch.set(doc(db, 'pruebas', pr.id), cleanPayload(pr));
          });
          INITIAL_REGISTRO_HORAS.forEach((h) => {
            batch.set(doc(db, 'registrosHoras', h.id), cleanPayload(h));
          });
          INITIAL_DOCUMENTOS.forEach((d) => {
            batch.set(doc(db, 'documentos', d.id), cleanPayload(d));
          });
          INITIAL_AUDITORIA.forEach((a) => {
            batch.set(doc(db, 'auditoria', a.id), cleanPayload(a));
          });
          await batch.commit();
        }
      } catch (err) {
        console.warn('Initial seeding note:', err);
      }
    };

    seedInitialDataIfNeeded();

    // 1. Proyectos listener
    const unsubProyectos = onSnapshot(
      collection(db, 'proyectos'),
      (snapshot) => {
        const items: Proyecto[] = [];
        snapshot.forEach((d) => items.push(d.data() as Proyecto));
        if (items.length > 0) {
          setProyectos(items);
        }
        setLastSyncedTime(new Date());
        setIsSyncing(false);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'proyectos');
      }
    );

    // 2. Solicitudes listener
    const unsubSolicitudes = onSnapshot(
      collection(db, 'solicitudes'),
      (snapshot) => {
        const items: Solicitud[] = [];
        snapshot.forEach((d) => items.push(d.data() as Solicitud));
        if (items.length > 0) {
          setSolicitudes(items);
        }
        setLastSyncedTime(new Date());
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'solicitudes');
      }
    );

    // 3. Pruebas listener
    const unsubPruebas = onSnapshot(
      collection(db, 'pruebas'),
      (snapshot) => {
        const items: Prueba[] = [];
        snapshot.forEach((d) => items.push(d.data() as Prueba));
        if (items.length > 0) {
          setPruebas(items);
        }
        setLastSyncedTime(new Date());
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'pruebas');
      }
    );

    // 4. RegistrosHoras listener
    const unsubHoras = onSnapshot(
      collection(db, 'registrosHoras'),
      (snapshot) => {
        const items: RegistroHoras[] = [];
        snapshot.forEach((d) => items.push(d.data() as RegistroHoras));
        if (items.length > 0) {
          setRegistrosHoras(items);
        }
        setLastSyncedTime(new Date());
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'registrosHoras');
      }
    );

    // 5. Documentos listener
    const unsubDocumentos = onSnapshot(
      collection(db, 'documentos'),
      (snapshot) => {
        const items: Documento[] = [];
        snapshot.forEach((d) => items.push(d.data() as Documento));
        if (items.length > 0) {
          setDocumentos(items);
        }
        setLastSyncedTime(new Date());
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'documentos');
      }
    );

    // 6. Empleados listener
    const unsubEmpleados = onSnapshot(
      collection(db, 'empleados'),
      (snapshot) => {
        const items: Empleado[] = [];
        snapshot.forEach((d) => items.push(d.data() as Empleado));
        const filtered = items.filter((emp) => {
          const fullName = `${emp.nombre} ${emp.apellidos}`.toLowerCase();
          const isIdMatch = ['emp-1', 'emp-2', 'emp-3', 'emp-4', 'emp-5'].includes(emp.id);
          const isNameMatch = REMOVED_EMPLOYEES.some((rem) => fullName.includes(rem));
          return !isIdMatch && !isNameMatch;
        });
        if (filtered.length > 0) {
          setEmpleados(filtered);
        }
        setLastSyncedTime(new Date());
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'empleados');
      }
    );

    // 7. Auditoria listener
    const unsubAuditoria = onSnapshot(
      collection(db, 'auditoria'),
      (snapshot) => {
        const items: AuditoriaRegistro[] = [];
        snapshot.forEach((d) => items.push(d.data() as AuditoriaRegistro));
        if (items.length > 0) {
          items.sort((a, b) => (b.fecha > a.fecha ? 1 : -1));
          setAuditoria(items);
        }
        setLastSyncedTime(new Date());
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'auditoria');
      }
    );

    return () => {
      unsubProyectos();
      unsubSolicitudes();
      unsubPruebas();
      unsubHoras();
      unsubDocumentos();
      unsubEmpleados();
      unsubAuditoria();
    };
  }, [currentUser, isAuthReady]);

  // Auth actions
  const loginWithGoogle = async () => {
    try {
      setSyncError(null);
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      if (
        err?.code === 'auth/popup-closed-by-user' ||
        err?.code === 'auth/cancelled-popup-request'
      ) {
        // Normal user action: window closed before sign-in completed
        return;
      }
      if (err?.code === 'auth/popup-blocked') {
        const msg = 'La ventana de inicio de sesión fue bloqueada por el navegador. Permite las ventanas emergentes (popups) en la barra de direcciones.';
        setSyncError(msg);
        return;
      }
      console.warn('Nota de inicio de sesión con Google:', err?.message || err);
      setSyncError(err?.message || 'Error al conectar con Google');
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  // Helpers
  const getEmpleado = (id: string) => empleados.find((e) => e.id === id);
  const getProyecto = (id: string) => proyectos.find((p) => p.id === id);

  const getProjectActualHours = (proyectoId: string) => {
    return registrosHoras
      .filter((h) => h.proyectoId === proyectoId)
      .reduce((acc, curr) => acc + (curr.tiempoHoras || 0), 0);
  };

  const getEmployeeLoggedHours = (empleadoId: string) => {
    return registrosHoras
      .filter((h) => h.empleadoId === empleadoId)
      .reduce((acc, curr) => acc + (curr.tiempoHoras || 0), 0);
  };

  const logAudit = async (
    entidad: AuditoriaRegistro['entidad'],
    entidadId: string,
    accion: AuditoriaRegistro['accion'],
    detalle: string,
    entidadCodigo?: string
  ) => {
    const userName = currentUser?.displayName || currentUser?.email || 'Usuario de Obrador';
    const newEntry: AuditoriaRegistro = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      fecha: new Date().toISOString().replace('T', ' ').substring(0, 16),
      usuario: userName,
      entidad,
      entidadId,
      entidadCodigo,
      accion,
      detalle,
    };
    setAuditoria((prev) => [newEntry, ...prev]);

    if (currentUser) {
      try {
        await setDoc(doc(db, 'auditoria', newEntry.id), cleanPayload(newEntry));
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, 'auditoria');
      }
    }
  };

  const openProjectDetail = (projectId: string, tab = 'general') => {
    setSelectedProjectId(projectId);
    setProjectDetailInitialTab(tab);
    setActiveModule('proyectos');
  };

  // Actions: Solicitudes
  const addSolicitud = (data: Partial<Solicitud>): Solicitud => {
    const nextNumber = solicitudes.length + 1;
    const codigo = `SOL-2026-${String(nextNumber).padStart(3, '0')}`;
    const newSol: Solicitud = {
      id: `sol-${Date.now()}`,
      codigo,
      fechaSolicitud: data.fechaSolicitud || new Date().toISOString().substring(0, 10),
      solicitante: data.solicitante || currentUser?.displayName || 'Nuevo Solicitante',
      departamentoSolicitante: data.departamentoSolicitante || 'Comercial',
      nombreSolicitud: data.nombreSolicitud || 'Solicitud sin nombre',
      descripcion: data.descripcion || '',
      familia: data.familia || 'Bollería',
      tipoTrabajo: data.tipoTrabajo || 'Nuevo desarrollo',
      cliente: data.cliente || '',
      fechaEntregaDeseada: data.fechaEntregaDeseada || new Date().toISOString().substring(0, 10),
      prioridad: data.prioridad || 'Media',
      estado: data.estado || 'Nueva solicitud',
      observaciones: data.observaciones || '',
      responsableEvaluacion: data.responsableEvaluacion,
    };

    setSolicitudes((prev) => [newSol, ...prev]);
    logAudit('Solicitud', newSol.id, 'Creación', `Creada nueva solicitud: ${newSol.nombreSolicitud}`, codigo);

    if (currentUser) {
      setDoc(doc(db, 'solicitudes', newSol.id), cleanPayload(newSol)).catch((err) => {
        handleFirestoreError(err, OperationType.WRITE, 'solicitudes');
      });
    }

    return newSol;
  };

  const updateSolicitud = (id: string, updates: Partial<Solicitud>) => {
    let updatedItem: Solicitud | null = null;
    setSolicitudes((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const updated = { ...s, ...updates };
          updatedItem = updated;
          if (updates.estado && updates.estado !== s.estado) {
            logAudit('Solicitud', id, 'Cambio de estado', `Estado cambiado de "${s.estado}" a "${updates.estado}"`, s.codigo);
          }
          return updated;
        }
        return s;
      })
    );

    if (currentUser && updatedItem) {
      setDoc(doc(db, 'solicitudes', id), cleanPayload(updatedItem), { merge: true }).catch((err) => {
        handleFirestoreError(err, OperationType.UPDATE, 'solicitudes');
      });
    }
  };

  const convertirSolicitudEnProyecto = (solicitudId: string, proyectoData?: Partial<Proyecto>): Proyecto => {
    const sol = solicitudes.find((s) => s.id === solicitudId);
    if (!sol) throw new Error('Solicitud no encontrada');

    const nextProjectNum = proyectos.length + 1;
    const codigo = `PRO-2026-${String(nextProjectNum).padStart(3, '0')}`;

    const newProject: Proyecto = {
      id: `pro-${Date.now()}`,
      codigo,
      nombre: proyectoData?.nombre || sol.nombreSolicitud,
      solicitudOrigenId: sol.id,
      descripcion: proyectoData?.descripcion || sol.descripcion,
      familia: proyectoData?.familia || sol.familia,
      subfamilia: proyectoData?.subfamilia || 'Línea estándar',
      tipoProyecto: proyectoData?.tipoProyecto || sol.tipoTrabajo,
      responsableId: proyectoData?.responsableId || (empleados[0]?.id || 'emp-1'),
      colaboradoresIds: proyectoData?.colaboradoresIds || [],
      prioridad: proyectoData?.prioridad || sol.prioridad,
      fechaInicioPrevista: proyectoData?.fechaInicioPrevista || new Date().toISOString().substring(0, 10),
      fechaInicioReal: proyectoData?.fechaInicioReal || new Date().toISOString().substring(0, 10),
      fechaFinalPrevista: proyectoData?.fechaFinalPrevista || sol.fechaEntregaDeseada,
      estado: 'En curso',
      porcentajeAvance: 5,
      horasEstimadas: proyectoData?.horasEstimadas || 40,
      cliente: sol.cliente,
      imagenUrl: proyectoData?.imagenUrl,
    };

    setProyectos((prev) => [newProject, ...prev]);

    updateSolicitud(solicitudId, {
      estado: 'Convertida en proyecto',
      proyectoAsociadoId: newProject.id,
      fechaAceptacion: new Date().toISOString().substring(0, 10),
    });

    logAudit(
      'Proyecto',
      newProject.id,
      'Creación',
      `Proyecto originado a partir de la solicitud ${sol.codigo}: ${newProject.nombre}`,
      codigo
    );

    if (currentUser) {
      setDoc(doc(db, 'proyectos', newProject.id), cleanPayload(newProject)).catch((err) => {
        handleFirestoreError(err, OperationType.WRITE, 'proyectos');
      });
    }

    return newProject;
  };

  // Actions: Proyectos
  const addProyecto = (data: Partial<Proyecto>): Proyecto => {
    const nextProjectNum = proyectos.length + 1;
    const codigo = `PRO-2026-${String(nextProjectNum).padStart(3, '0')}`;

    const newProject: Proyecto = {
      id: `pro-${Date.now()}`,
      codigo,
      nombre: data.nombre || 'Nuevo Proyecto de Pastelería',
      descripcion: data.descripcion || '',
      familia: data.familia || 'Bollería',
      subfamilia: data.subfamilia || 'Desarrollo obrador',
      tipoProyecto: data.tipoProyecto || 'Nuevo desarrollo',
      responsableId: data.responsableId || (empleados[0]?.id || 'emp-1'),
      colaboradoresIds: data.colaboradoresIds || [],
      prioridad: data.prioridad || 'Media',
      fechaInicioPrevista: data.fechaInicioPrevista || new Date().toISOString().substring(0, 10),
      fechaInicioReal: data.fechaInicioReal || new Date().toISOString().substring(0, 10),
      fechaFinalPrevista: data.fechaFinalPrevista || new Date(Date.now() + 30 * 86400000).toISOString().substring(0, 10),
      estado: (data.estado as ProjectStatus) || 'Pendiente',
      porcentajeAvance: data.porcentajeAvance || 0,
      horasEstimadas: data.horasEstimadas || 40,
      cliente: data.cliente,
      imagenUrl: data.imagenUrl,
      solicitudOrigenId: data.solicitudOrigenId,
    };

    setProyectos((prev) => [newProject, ...prev]);
    logAudit('Proyecto', newProject.id, 'Creación', `Creado proyecto: ${newProject.nombre}`, codigo);

    if (currentUser) {
      setDoc(doc(db, 'proyectos', newProject.id), cleanPayload(newProject)).catch((err) => {
        handleFirestoreError(err, OperationType.WRITE, 'proyectos');
      });
    }

    return newProject;
  };

  const updateProyecto = (id: string, updates: Partial<Proyecto>) => {
    let updatedItem: Proyecto | null = null;
    setProyectos((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const updated = { ...p, ...updates };
          if (updates.estado && updates.estado !== p.estado) {
            logAudit('Proyecto', id, 'Cambio de estado', `Estado cambiado de "${p.estado}" a "${updates.estado}"`, p.codigo);
            if (updates.estado === 'Finalizado' && !updated.fechaCierre) {
              updated.fechaCierre = new Date().toISOString().substring(0, 10);
            }
          }
          if (updates.fechaFinalPrevista && updates.fechaFinalPrevista !== p.fechaFinalPrevista) {
            logAudit('Proyecto', id, 'Modificación', `Fecha final prevista ajustada a ${updates.fechaFinalPrevista}`, p.codigo);
          }
          updatedItem = updated;
          return updated;
        }
        return p;
      })
    );

    if (currentUser && updatedItem) {
      setDoc(doc(db, 'proyectos', id), cleanPayload(updatedItem), { merge: true }).catch((err) => {
        handleFirestoreError(err, OperationType.UPDATE, 'proyectos');
      });
    }
  };

  const deleteProyecto = (id: string) => {
    const proy = proyectos.find((p) => p.id === id);
    setProyectos((prev) => prev.filter((p) => p.id !== id));
    if (proy) {
      logAudit('Proyecto', id, 'Modificación', `Eliminado proyecto ${proy.codigo}`, proy.codigo);
    }

    if (currentUser) {
      deleteDoc(doc(db, 'proyectos', id)).catch((err) => {
        handleFirestoreError(err, OperationType.DELETE, 'proyectos');
      });
    }
  };

  // Actions: Pruebas
  const addPrueba = (data: Partial<Prueba>): Prueba => {
    const projectTrials = pruebas.filter((p) => p.proyectoId === data.proyectoId);
    const nextTrialNum = projectTrials.length + 1;
    const globalCount = pruebas.length + 1;
    const codigo = `PRU-2026-${String(globalCount).padStart(3, '0')}`;

    const newPrueba: Prueba = {
      id: `pru-${Date.now()}`,
      proyectoId: data.proyectoId || '',
      codigo,
      numeroPrueba: nextTrialNum,
      nombrePrueba: data.nombrePrueba || `Ensayo #${nextTrialNum}`,
      fechaRealizacion: data.fechaRealizacion || new Date().toISOString().substring(0, 10),
      responsableId: data.responsableId || (empleados[0]?.id || 'emp-1'),
      objetivo: data.objetivo || '',
      formulacion: data.formulacion || [],
      formulacionNotas: data.formulacionNotas,
      modificacionesRealizadas: data.modificacionesRealizadas || '',
      resultado: data.resultado || 'Ajustar parámetros',
      evaluacionSensorial: data.evaluacionSensorial || {
        textura: 7,
        sabor: 7,
        aspectoVisual: 7,
        aroma: 7,
        estabilidad: 7,
        comentarios: '',
      },
      incidencias: data.incidencias,
      fotografias: data.fotografias || [],
      proximosAjustes: data.proximosAjustes,
      fechaValidacion: data.fechaValidacion,
      pruebaAprobada: data.pruebaAprobada || false,
    };

    setPruebas((prev) => [newPrueba, ...prev]);

    const proy = proyectos.find((p) => p.id === newPrueba.proyectoId);
    logAudit(
      'Prueba',
      newPrueba.id,
      'Creación',
      `Registrado ${newPrueba.nombrePrueba} para ${proy?.codigo || 'proyecto'}`,
      codigo
    );

    if (currentUser) {
      setDoc(doc(db, 'pruebas', newPrueba.id), cleanPayload(newPrueba)).catch((err) => {
        handleFirestoreError(err, OperationType.WRITE, 'pruebas');
      });
    }

    return newPrueba;
  };

  const updatePrueba = (id: string, updates: Partial<Prueba>) => {
    let updatedItem: Prueba | null = null;
    setPruebas((prev) =>
      prev.map((pr) => {
        if (pr.id === id) {
          const updated = { ...pr, ...updates };
          if (updates.pruebaAprobada !== undefined && updates.pruebaAprobada !== pr.pruebaAprobada) {
            logAudit(
              'Prueba',
              id,
              'Aprobación',
              updates.pruebaAprobada
                ? `Prueba ${pr.codigo} aprobada oficialmente`
                : `Aprobación de prueba ${pr.codigo} revocada`,
              pr.codigo
            );
          }
          updatedItem = updated;
          return updated;
        }
        return pr;
      })
    );

    if (currentUser && updatedItem) {
      setDoc(doc(db, 'pruebas', id), cleanPayload(updatedItem), { merge: true }).catch((err) => {
        handleFirestoreError(err, OperationType.UPDATE, 'pruebas');
      });
    }
  };

  // Actions: Registro Horas
  const calculateHoursDiff = (inicio: string, fin: string): number => {
    if (!inicio || !fin) return 1;
    const [h1, m1] = inicio.split(':').map(Number);
    const [h2, m2] = fin.split(':').map(Number);
    const diffMin = h2 * 60 + m2 - (h1 * 60 + m1);
    if (diffMin <= 0) return 0.5;
    return Math.round((diffMin / 60) * 10) / 10;
  };

  const addRegistroHoras = (data: Partial<RegistroHoras>): RegistroHoras => {
    const inicio = data.horaInicio || '09:00';
    const fin = data.horaFin || '13:00';
    const tiempoHoras = data.tiempoHoras !== undefined ? data.tiempoHoras : calculateHoursDiff(inicio, fin);

    const newReg: RegistroHoras = {
      id: `h-${Date.now()}`,
      fecha: data.fecha || new Date().toISOString().substring(0, 10),
      empleadoId: data.empleadoId || (empleados[0]?.id || 'emp-1'),
      proyectoId: data.proyectoId || '',
      tarea: data.tarea,
      pruebaId: data.pruebaId,
      tipoActividad: data.tipoActividad || 'Desarrollo de recetas',
      horaInicio: inicio,
      horaFin: fin,
      tiempoHoras,
      observaciones: data.observaciones,
    };

    setRegistrosHoras((prev) => [newReg, ...prev]);

    const proy = proyectos.find((p) => p.id === newReg.proyectoId);
    const emp = empleados.find((e) => e.id === newReg.empleadoId);
    logAudit(
      'Horas',
      newReg.id,
      'Registro de horas',
      `${emp?.nombre || 'Empleado'} registró ${newReg.tiempoHoras}h en ${proy?.codigo || 'proyecto'} (${newReg.tipoActividad})`,
      proy?.codigo
    );

    if (currentUser) {
      setDoc(doc(db, 'registrosHoras', newReg.id), cleanPayload(newReg)).catch((err) => {
        handleFirestoreError(err, OperationType.WRITE, 'registrosHoras');
      });
    }

    return newReg;
  };

  const deleteRegistroHoras = (id: string) => {
    setRegistrosHoras((prev) => prev.filter((r) => r.id !== id));
    if (currentUser) {
      deleteDoc(doc(db, 'registrosHoras', id)).catch((err) => {
        handleFirestoreError(err, OperationType.DELETE, 'registrosHoras');
      });
    }
  };

  // Actions: Documentos
  const addDocumento = (data: Partial<Documento>): Documento => {
    const newDoc: Documento = {
      id: `doc-${Date.now()}`,
      nombre: data.nombre || 'Nuevo Documento Técnico',
      proyectoId: data.proyectoId || '',
      pruebaId: data.pruebaId,
      tipoDocumento: data.tipoDocumento || 'Ficha técnica',
      fechaCreacion: data.fechaCreacion || new Date().toISOString().substring(0, 10),
      responsableId: data.responsableId || (empleados[0]?.id || 'emp-1'),
      version: data.version || 'v1.0',
      formato: data.formato || 'PDF',
      tamano: data.tamano || '1.2 MB',
      observaciones: data.observaciones,
      estadoDocumental: data.estadoDocumental || 'Borrador',
    };

    setDocumentos((prev) => [newDoc, ...prev]);
    logAudit('Documento', newDoc.id, 'Creación', `Añadido documento ${newDoc.nombre} (${newDoc.version})`);

    if (currentUser) {
      setDoc(doc(db, 'documentos', newDoc.id), cleanPayload(newDoc)).catch((err) => {
        handleFirestoreError(err, OperationType.WRITE, 'documentos');
      });
    }

    return newDoc;
  };

  const updateDocumento = (id: string, updates: Partial<Documento>) => {
    let updatedItem: Documento | null = null;
    setDocumentos((prev) =>
      prev.map((d) => {
        if (d.id === id) {
          const updated = { ...d, ...updates };
          if (updates.estadoDocumental && updates.estadoDocumental !== d.estadoDocumental) {
            logAudit('Documento', id, 'Validación', `Estado de documento cambiado a ${updates.estadoDocumental}`);
          }
          updatedItem = updated;
          return updated;
        }
        return d;
      })
    );

    if (currentUser && updatedItem) {
      setDoc(doc(db, 'documentos', id), cleanPayload(updatedItem), { merge: true }).catch((err) => {
        handleFirestoreError(err, OperationType.UPDATE, 'documentos');
      });
    }
  };

  const deleteDocumento = (id: string) => {
    setDocumentos((prev) => prev.filter((d) => d.id !== id));
    if (currentUser) {
      deleteDoc(doc(db, 'documentos', id)).catch((err) => {
        handleFirestoreError(err, OperationType.DELETE, 'documentos');
      });
    }
  };

  // Actions: Empleados
  const addEmpleado = (data: Partial<Empleado>): Empleado => {
    const newEmp: Empleado = {
      id: `emp-${Date.now()}`,
      nombre: data.nombre || 'Nombre',
      apellidos: data.apellidos || 'Apellidos',
      departamento: data.departamento || 'I+D+i Pastelería',
      cargo: data.cargo || 'Especialista I+D',
      email: data.email || 'contacto@patisslab.com',
      horasSemanales: data.horasSemanales || 40,
      especialidades: data.especialidades || ['Pastelería'],
      activo: data.activo !== undefined ? data.activo : true,
    };

    setEmpleados((prev) => [...prev, newEmp]);
    logAudit('Equipo', newEmp.id, 'Creación', `Nuevo miembro incorporado al equipo: ${newEmp.nombre} ${newEmp.apellidos}`);

    if (currentUser) {
      setDoc(doc(db, 'empleados', newEmp.id), cleanPayload(newEmp)).catch((err) => {
        handleFirestoreError(err, OperationType.WRITE, 'empleados');
      });
    }

    return newEmp;
  };

  const updateEmpleado = (id: string, updates: Partial<Empleado>) => {
    let updatedItem: Empleado | null = null;
    setEmpleados((prev) =>
      prev.map((e) => {
        if (e.id === id) {
          const updated = { ...e, ...updates };
          updatedItem = updated;
          return updated;
        }
        return e;
      })
    );

    if (currentUser && updatedItem) {
      setDoc(doc(db, 'empleados', id), cleanPayload(updatedItem), { merge: true }).catch((err) => {
        handleFirestoreError(err, OperationType.UPDATE, 'empleados');
      });
    }
  };

  const deleteEmpleado = (id: string) => {
    const emp = empleados.find((e) => e.id === id);
    setEmpleados((prev) => prev.filter((e) => e.id !== id));
    if (emp) {
      logAudit('Equipo', id, 'Modificación', `Eliminado miembro del equipo: ${emp.nombre} ${emp.apellidos}`);
    }

    if (currentUser) {
      deleteDoc(doc(db, 'empleados', id)).catch((err) => {
        handleFirestoreError(err, OperationType.DELETE, 'empleados');
      });
    }
  };

  const resetToDefault = () => {
    setEmpleados(INITIAL_EMPLEADOS);
    setSolicitudes(INITIAL_SOLICITUDES);
    setProyectos(INITIAL_PROYECTOS);
    setPruebas(INITIAL_PRUEBAS);
    setRegistrosHoras(INITIAL_REGISTRO_HORAS);
    setDocumentos(INITIAL_DOCUMENTOS);
    setAuditoria(INITIAL_AUDITORIA);
    localStorage.clear();
  };

  return (
    <AppContext.Provider
      value={{
        activeModule,
        setActiveModule,
        selectedProjectId,
        setSelectedProjectId,
        projectDetailInitialTab,
        setProjectDetailInitialTab,
        openProjectDetail,
        currentUser,
        isAuthReady,
        isCloudConnected: !!currentUser,
        isSyncing,
        lastSyncedTime,
        syncError,
        loginWithGoogle,
        logout,
        proyectos,
        solicitudes,
        pruebas,
        registrosHoras,
        documentos,
        empleados,
        auditoria,
        getEmpleado,
        getProyecto,
        getProjectActualHours,
        getEmployeeLoggedHours,
        addSolicitud,
        updateSolicitud,
        convertirSolicitudEnProyecto,
        addProyecto,
        updateProyecto,
        deleteProyecto,
        addPrueba,
        updatePrueba,
        addRegistroHoras,
        deleteRegistroHoras,
        addDocumento,
        updateDocumento,
        deleteDocumento,
        addEmpleado,
        updateEmpleado,
        deleteEmpleado,
        resetToDefault,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
