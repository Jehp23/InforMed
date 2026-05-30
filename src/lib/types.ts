export type EventType =
  | "allergy"
  | "admission"
  | "discharge"
  | "lab"
  | "note";

export type UserRole = "doctor" | "patient";

export type LoginSession = {
  role: UserRole;
  email: string;
  arkivId: string;
  userKey: string;
  displayName: string;
  txHash?: string;
  isNewIdentity: boolean;
};

export type ValidationStatus =
  | "declared"
  | "document_attached"
  | "ai_extracted"
  | "pending_review"
  | "verified"
  | "institution_issued"
  | "corrected"
  | "discarded";

export interface ClinicalEventPayload {
  patientId: string;
  hospitalId: string;
  eventType: EventType;
  /** Resumen breve (timeline, chips). */
  summary: string;
  /** Texto largo opcional (modal). */
  detail?: string;
  timestamp: string;
}

export interface ClinicalEventRecord extends ClinicalEventPayload {
  entityKey: string;
  txHash?: string;
  creator?: string;
  /** Identidad Arkiv del profesional que publicó el registro. */
  authorIdentityId?: string;
  /** Nombre resuelto desde la entidad de identidad (API). */
  authorDisplayName?: string;
}

export interface CreateEventBody {
  patientId: string;
  hospitalId: string;
  eventType: EventType;
  summary: string;
  detail?: string;
  authorIdentityId?: string;
}

export type StructuredRecordFormData = {
  recordType: string;
} & Record<string, string>;

export type TimelineDisplayRecord = {
  id: string;
  title: string;
  /** Clave técnica (allergy, consultation, …) para colores y filtros. */
  type: string;
  /** Etiqueta en español para la UI. */
  typeLabel: string;
  date: string;
  institution?: string;
  doctor?: string;
  authorIdentityId?: string;
  status: ValidationStatus;
  hasDocument?: boolean;
  importance?: "critical" | "important" | "routine";
  isPinned?: boolean;
  description?: string;
  notes?: string;
  /** Resumen on-chain para parsear registros estructurados en el modal. */
  rawSummary?: string;
};
