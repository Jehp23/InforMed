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
  summary: string;
  timestamp: string;
}

export interface ClinicalEventRecord extends ClinicalEventPayload {
  entityKey: string;
  txHash?: string;
  creator?: string;
}

export interface CreateEventBody {
  patientId: string;
  hospitalId: string;
  eventType: EventType;
  summary: string;
  authorIdentityId?: string;
}

export type StructuredRecordFormData = {
  recordType: string;
} & Record<string, string>;

export type TimelineDisplayRecord = {
  id: string;
  title: string;
  type: string;
  date: string;
  institution?: string;
  doctor?: string;
  status: ValidationStatus;
  hasDocument?: boolean;
  importance?: "critical" | "important" | "routine";
  isPinned?: boolean;
  description?: string;
  notes?: string;
};
