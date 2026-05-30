export const BRAGA_RPC = "https://braga.hoodi.arkiv.network/rpc";
export const EXPLORER_TX_BASE =
  "https://explorer.braga.hoodi.arkiv.network/tx/";
export const ENTITY_EXPLORER_BASE = "https://data.arkiv.network/entity/";
export const FAUCET_URL = "https://braga.hoodi.arkiv.network/faucet";

export const ENTITY_TYPE_CLINICAL = "clinical_event";
export const ENTITY_TYPE_IDENTITY = "medtrail_identity";
export const ENTITY_TYPE_AI_SUMMARY = "ai_summary";
export const EVENT_STATUS_ACTIVE = "active";
export const EVENT_STATUS_DISCARDED = "discarded";

/** Resúmenes válidos para la presentación — el resto se puede limpiar con npm run cleanup */
export const PRESENTATION_EVENT_SUMMARIES = [
  "Alergia a penicilina — urticaria leve (2022)",
  "Alergia a la lavandina. Brotes bajo los ojos y en los antebrazos.",
  "Ingreso urgencias — dolor torácico atípico, observación 6h",
  "Alta ambulatoria — dolor torácico descartado, seguimiento cardiólogo",
  "Hemograma y perfil lipídico — dentro de rango",
  "Medicación habitual: Losartán 50 mg/día. Sin cambios al alta.",
  "Historial repartido en varios hospitales — coordinar traslados",
  "Alergia a penicilina — rash cutáneo (2021)",
  "Alergia a AINEs — broncoespasmo leve",
  "Hemograma dentro de rango normal",
  "Ingreso observación — control post broncoespasmo",
  "Alta con plan de seguimiento neumonología",
  "Nota: evitar AINEs y antiinflamatorios no prescritos",
  "Alergia a yodo — reacción cutánea leve",
  "Ingreso programado — estudio prequirúrgico",
  "Alta sin complicaciones — control en 7 días",
  "Glucemia en ayunas — 98 mg/dL",
  "Nota administrativa: autorización de interconsulta enviada",
] as const;

/** 7 días — suficiente para la hackathon */
export const DEFAULT_EXPIRES_IN_SECONDS = 604800;

export const HOSPITALS = [
  { id: "hospital-norte", name: "Hospital Norte" },
  { id: "hospital-sur", name: "Hospital Sur" },
  { id: "hospital-centro", name: "Hospital Centro" },
] as const;

export const DEMO_PRIMARY_PATIENT_ID = "demo-001";

export const DEMO_PATIENTS = [
  { id: "demo-001", label: "María González" },
  { id: "demo-002", label: "Juan Pérez" },
  { id: "demo-003", label: "Ana López" },
] as const;

/** Cuentas listas para la demo en vivo — el login las emite/recupera en Arkiv automáticamente */
export const DEMO_ACCOUNTS = [
  {
    role: "doctor" as const,
    email: "medico@demo.com",
    displayName: "Dra. Elena Méndez",
    label: "Profesional de la salud",
  },
  {
    role: "patient" as const,
    email: "maria@demo.com",
    displayName: "María González",
    label: "Paciente",
    patientId: "demo-001",
  },
] as const;

export function getDemoAccount(role: "doctor" | "patient") {
  return DEMO_ACCOUNTS.find((a) => a.role === role);
}

export function resolvePatientIdForEmail(email: string): string {
  const account = DEMO_ACCOUNTS.find((a) => a.role === "patient" && a.email === email);
  return account && "patientId" in account ? account.patientId : DEMO_PATIENTS[0].id;
}

export const EVENT_TYPE_LABELS: Record<string, string> = {
  allergy: "Alergia",
  admission: "Ingreso",
  discharge: "Alta",
  lab: "Laboratorio",
  note: "Nota clínica",
};
