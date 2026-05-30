/** Textos orientados a médicos y pacientes (sin jerga Web3 en la app). */

export const UI_COPY = {
  loadingHistory: "Cargando historial…",
  syncing: "Sincronizando…",
  verified: "Verificado",
  verifiedRecord: "Registro verificado",
  verifiedHistory: "Historial verificado",
  verifiedAccount: "Cuenta verificada",
  arkivIdReady: "Tu Arkiv ID quedó listo",
  arkivIdAuto:
    "Lo creamos automáticamente con tu correo. Sin billetera ni pasos extra.",
  loginArkivHint:
    "Al ingresar, InforMed crea o recupera tu Arkiv ID. Solo necesitás tu correo.",
  loginCreatingId: "Preparando tu Arkiv ID…",
  publishRecord: "Publicar registro",
  publishingRecord: "Publicando registro…",
  recordSaved: "Registro guardado",
  recordSavedDetail: "El evento ya forma parte del historial compartido.",
  sessionCheck: "Verificando tu sesión…",
  loginContinue: "Ingresar a InforMed",
  loginConnecting: "Ingresando…",
  multiHospitalHistory: "Eventos de todos los hospitales · respaldo verificable",
  patientHistorySubtitle: "Registros emitidos por tus profesionales de salud",
  roleDoctor: "Profesional de la salud",
  rolePatient: "Paciente",
  historialAssistTitle: "MediBot",
  historialAssistHint:
    "Organiza registros verificados. No diagnostica ni reemplaza criterio clínico.",
  searchHistoryPlaceholder: "Buscar en historia médica…",
  appFooterDoctor:
    "InforMed · historial clínico verificable · registros compartidos entre hospitales",
  appFooterPatient:
    "InforMed · tu historial verificable · acceso seguro entre instituciones de salud",
} as const;

/** Guiño visible solo en marketing / sección para jurado Arkiv */
export const JUDGE_COPY = {
  tagline: "Web3 que se siente Web2",
  sectionLabel: "Para jurado Arkiv",
  sectionTitle: "Por detrás: infraestructura descentralizada. Delante: una app clínica normal.",
  sectionBody:
    "InforMed usa Arkiv en la red Braga para que cada registro sea verificable e inmutable, sin que médicos ni pacientes vean billeteras, hashes ni exploradores.",
} as const;
