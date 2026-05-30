import { eventTitleFromRecord } from "./clinical-event-text";
import { isTestOrSpamSummary } from "./event-field-limits";
import { EVENT_TYPE_LABELS, HOSPITALS } from "./constants";
import type { ClinicalEventRecord } from "./types";
import { formatEventDescription, isTimelineEvent } from "./timeline-utils";

export type DerivedClinicalSummary = {
  allergies: string[];
  currentMedication: string[];
  relevantHistory: string[];
  lastHospitalizations: Array<{ date: string; reason: string; institution: string }>;
  importantSurgeries: Array<{ date: string; procedure: string; institution: string }>;
  pendingDocuments: string[];
  clinicalAlerts: string[];
};

function hospitalName(id: string) {
  return HOSPITALS.find((h) => h.id === id)?.name ?? id;
}

function parseStructured(summary: string): Record<string, unknown> | null {
  try {
    const parsed = JSON.parse(summary) as Record<string, unknown>;
    if (parsed.type === "structured_record") return parsed;
  } catch {
    // plain text
  }
  return null;
}

/** Solo sustancia (ej. «Penicilina»), sin reacción ni fechas. */
export function normalizeAllergySubstance(raw: string): string {
  let text = raw.trim();
  if (!text) return "";

  const prefix = text.match(/^alergia\s+(?:a\s+(?:la\s+)?)?(.+)$/i);
  if (prefix) text = prefix[1].trim();

  const substance = text.split(/\s*[—–]\s*|\s+-\s+|\s*\(|\./)[0]?.trim() ?? text;
  if (!substance) return "";

  const lower = substance.toLowerCase();
  if (lower === "aines" || lower === "aine" || lower.includes("aine")) return "AINEs";
  if (lower.includes("penicilina")) return "Penicilina";
  if (lower.includes("lavandina")) return "Lavandina";

  return substance.charAt(0).toUpperCase() + substance.slice(1).toLowerCase();
}

function allergyDedupKey(substance: string): string {
  const lower = substance.toLowerCase();
  if (lower.includes("penicilina")) return "penicilina";
  if (lower === "aines" || lower === "aine" || lower.includes("aine")) return "aines";
  if (lower.includes("lavandina")) return "lavandina";
  return lower;
}

function extractAllergyLabel(ev: ClinicalEventRecord): string {
  const structured = parseStructured(ev.summary);
  if (structured?.recordType === "allergy" && structured.substance) {
    return normalizeAllergySubstance(String(structured.substance));
  }
  const plain = ev.summary?.trim();
  if (plain && !plain.startsWith("{")) {
    return normalizeAllergySubstance(eventTitleFromRecord(ev));
  }
  return "";
}

function isAllergyEvent(ev: ClinicalEventRecord): boolean {
  if (ev.eventType === "allergy") return true;
  const structured = parseStructured(ev.summary);
  return structured?.recordType === "allergy";
}

function isHospitalizationEvent(ev: ClinicalEventRecord): boolean {
  if (ev.eventType === "admission" || ev.eventType === "discharge") return true;
  const structured = parseStructured(ev.summary);
  return structured?.recordType === "hospitalization";
}

function isMedicationEvent(ev: ClinicalEventRecord): boolean {
  const structured = parseStructured(ev.summary);
  return structured?.recordType === "medication";
}

function isSurgeryEvent(ev: ClinicalEventRecord): boolean {
  const structured = parseStructured(ev.summary);
  return structured?.recordType === "surgery";
}

function pushAllergy(labels: string[], seen: Set<string>, raw: string) {
  const substance = normalizeAllergySubstance(raw);
  if (!substance) return;
  const key = allergyDedupKey(substance);
  if (seen.has(key)) return;
  seen.add(key);
  labels.push(substance);
}

/** Última ficha `patient_data` publicada en Arkiv (si existe). */
export function parseLatestPatientDataFromEvents(
  events: ClinicalEventRecord[],
): { allergies: string[] } | null {
  const fichaEvents = events
    .filter((ev) => {
      try {
        return (JSON.parse(ev.summary) as { type?: string }).type === "patient_data";
      } catch {
        return false;
      }
    })
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

  if (fichaEvents.length === 0) return null;

  try {
    const parsed = JSON.parse(fichaEvents[0].summary) as {
      data?: { allergies?: string[] };
    };
    const list = parsed.data?.allergies;
    if (!Array.isArray(list)) return null;
    return {
      allergies: list.map((a) => String(a).trim()).filter(Boolean),
    };
  } catch {
    return null;
  }
}

/** Alergias unificadas: eventos tipo allergy + ficha verificada en Arkiv. */
export function collectAllergiesFromEvents(events: ClinicalEventRecord[]): string[] {
  const timeline = events.filter(isTimelineEvent);
  const allergies: string[] = [];
  const seen = new Set<string>();

  for (const ev of timeline) {
    if (!isAllergyEvent(ev)) continue;
    if (isTestOrSpamSummary(ev.summary)) continue;
    pushAllergy(allergies, seen, extractAllergyLabel(ev));
  }

  const ficha = parseLatestPatientDataFromEvents(events);
  if (ficha) {
    for (const a of ficha.allergies) {
      pushAllergy(allergies, seen, a);
    }
  }

  return allergies;
}

/** Extrae datos de la ficha y del resumen desde eventos verificados (sin IA). */
export function deriveClinicalSummaryFromEvents(
  events: ClinicalEventRecord[],
): DerivedClinicalSummary {
  const timeline = events
    .filter(isTimelineEvent)
    .slice()
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

  const allergies = collectAllergiesFromEvents(events);

  const medications: string[] = [];
  const seenMed = new Set<string>();
  for (const ev of timeline) {
    if (!isMedicationEvent(ev)) continue;
    const structured = parseStructured(ev.summary);
    const label = structured?.substance
      ? String(structured.substance)
      : formatEventDescription(ev.summary).split("\n")[0] || ev.summary;
    const key = label.toLowerCase();
    if (seenMed.has(key)) continue;
    seenMed.add(key);
    medications.push(label);
  }

  const lastHospitalizations: DerivedClinicalSummary["lastHospitalizations"] = [];
  const seenHosp = new Set<string>();
  for (const e of timeline) {
    if (!isHospitalizationEvent(e)) continue;
    const plainReason = !e.summary.startsWith("{") ? eventTitleFromRecord(e) : "";
    const entry = {
      date: new Date(e.timestamp).toLocaleDateString("es-AR"),
      reason:
        plainReason ||
        formatEventDescription(e.summary).split("\n")[0]?.trim() ||
        EVENT_TYPE_LABELS[e.eventType] ||
        "Internación",
      institution: hospitalName(e.hospitalId),
    };
    const key = `${entry.date}|${entry.reason}|${entry.institution}`;
    if (seenHosp.has(key)) continue;
    seenHosp.add(key);
    lastHospitalizations.push(entry);
    if (lastHospitalizations.length >= 3) break;
  }

  const importantSurgeries = timeline
    .filter(isSurgeryEvent)
    .slice(0, 3)
    .map((e) => {
      const structured = parseStructured(e.summary);
      return {
        date: new Date(e.timestamp).toLocaleDateString("es-AR"),
        procedure: structured?.procedure
          ? String(structured.procedure)
          : formatEventDescription(e.summary).split("\n")[0] || "Cirugía",
        institution: hospitalName(e.hospitalId),
      };
    });

  const clinicalAlerts: string[] = [];
  if (allergies.length > 0) {
    clinicalAlerts.push(
      `${allergies.length} alergia(s) en historial verificado — revisar antes de indicar`,
    );
  }
  const hospitalIds = new Set(timeline.map((e) => e.hospitalId));
  if (hospitalIds.size > 1) {
    clinicalAlerts.push(
      "Historial repartido en varios hospitales — usar brief de traslado al derivar",
    );
  }

  return {
    allergies,
    currentMedication: medications,
    relevantHistory: [],
    lastHospitalizations,
    importantSurgeries,
    pendingDocuments: [],
    clinicalAlerts,
  };
}
