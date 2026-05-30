import { EVENT_TYPE_LABELS, HOSPITALS } from "./constants";
import type { ClinicalEventRecord, TimelineDisplayRecord } from "./types";

export function isTimelineEvent(ev: ClinicalEventRecord): boolean {
  try {
    const parsed = JSON.parse(ev.summary) as { type?: string };
    return parsed.type !== "patient_data";
  } catch {
    return true;
  }
}

export function formatEventDescription(summary: string): string {
  try {
    const parsed = JSON.parse(summary) as Record<string, unknown>;
    if (parsed.type === "structured_record") {
      const lines: string[] = [];
      const labels: Record<string, string> = {
        recordType: "Tipo",
        substance: "Sustancia",
        procedure: "Procedimiento",
        institution: "Institución",
        date: "Fecha",
        reason: "Motivo",
        description: "Descripción",
        diagnosis: "Diagnóstico",
      };
      for (const [key, value] of Object.entries(parsed)) {
        if (key === "type" || value === undefined || value === "") continue;
        const label = labels[key] ?? key;
        lines.push(`${label}: ${String(value)}`);
      }
      return lines.join("\n");
    }
  } catch {
    // plain text
  }
  return summary;
}

export function eventToTimelineRecord(
  ev: ClinicalEventRecord,
  pinnedIds?: Set<string>,
): TimelineDisplayRecord {
  let title = EVENT_TYPE_LABELS[ev.eventType] ?? ev.eventType;
  let type: string = ev.eventType;

  try {
    const parsed = JSON.parse(ev.summary) as {
      type?: string;
      recordType?: string;
      substance?: string;
      procedure?: string;
    };
    if (parsed.type === "structured_record") {
      if (parsed.recordType === "medication") {
        title = parsed.substance || "Medicación";
        type = "medication";
      } else if (parsed.recordType === "surgery") {
        title = parsed.procedure || "Cirugía";
        type = "surgery";
      } else if (parsed.recordType === "allergy") {
        title = parsed.substance || "Alergia";
        type = "allergy";
      } else if (parsed.recordType === "consultation") {
        title = "Consulta médica";
        type = "consultation";
      } else if (parsed.recordType) {
        title = EVENT_TYPE_LABELS[parsed.recordType] ?? parsed.recordType;
        type = parsed.recordType;
      }
    }
  } catch {
    // plain summary
  }

  const plain = ev.summary?.trim();
  if (plain && !plain.startsWith("{")) {
    const short = plain.length > 80 ? `${plain.slice(0, 80)}…` : plain;
    const generic = EVENT_TYPE_LABELS[ev.eventType] ?? ev.eventType;
    if (title === generic || title === ev.eventType) {
      title = short;
    }
  }

  return {
    id: ev.entityKey,
    title,
    type,
    date: new Date(ev.timestamp).toLocaleDateString("es-AR"),
    institution: HOSPITALS.find((h) => h.id === ev.hospitalId)?.name,
    status: "verified",
    description: formatEventDescription(ev.summary),
    isPinned: pinnedIds?.has(ev.entityKey),
  };
}

export function filterTimelineEvents(
  events: ClinicalEventRecord[],
  searchQuery: string,
  activeFilter: string,
): ClinicalEventRecord[] {
  return events.filter((ev) => {
    if (!isTimelineEvent(ev)) return false;

    let recordType: string | null = null;
    try {
      const parsed = JSON.parse(ev.summary) as {
        type?: string;
        recordType?: string;
      };
      if (parsed.type === "structured_record" && parsed.recordType) {
        recordType = parsed.recordType;
      }
    } catch {
      // ignore
    }

    const hospitalName =
      HOSPITALS.find((h) => h.id === ev.hospitalId)?.name.toLowerCase() ?? "";
    const matchesSearch =
      searchQuery === "" ||
      ev.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (EVENT_TYPE_LABELS[ev.eventType] ?? "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      hospitalName.includes(searchQuery.toLowerCase());

    const matchesFilter =
      activeFilter === "all" ||
      (activeFilter === "consultations" &&
        (ev.eventType === "note" || recordType === "consultation")) ||
      (activeFilter === "hospitalizations" &&
        (ev.eventType === "admission" ||
          ev.eventType === "discharge" ||
          recordType === "hospitalization")) ||
      (activeFilter === "surgeries" && recordType === "surgery") ||
      (activeFilter === "studies" &&
        (ev.eventType === "lab" || recordType === "study")) ||
      (activeFilter === "medications" && recordType === "medication") ||
      (activeFilter === "allergies" &&
        (ev.eventType === "allergy" || recordType === "allergy"));

    return matchesSearch && matchesFilter;
  });
}
