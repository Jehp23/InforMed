import {
  clinicalHeadlineFromSummary,
  eventDetailFromRecord,
} from "./clinical-event-text";
import { eventTypeDisplayLabel } from "./event-display-labels";
import { isInvalidEventSummary } from "./event-field-limits";
import { EVENT_TYPE_LABELS, HOSPITALS } from "./constants";
import {
  formatStructuredRecordDescription,
  parseStructuredRecord,
} from "./structured-record";
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
  const structured = formatStructuredRecordDescription(summary);
  if (structured) return structured;

  try {
    const parsed = JSON.parse(summary) as { type?: string };
    if (parsed.type === "structured_record") return summary;
  } catch {
    // plain text
  }
  return summary;
}

export function eventToTimelineRecord(
  ev: ClinicalEventRecord,
  pinnedIds?: Set<string>,
): TimelineDisplayRecord | null {
  if (isInvalidEventSummary(ev.summary)) return null;

  const structured = parseStructuredRecord(ev.summary);
  let title = EVENT_TYPE_LABELS[ev.eventType] ?? ev.eventType;

  let parsedRecordType: string | undefined;
  if (!structured) {
    try {
      const parsed = JSON.parse(ev.summary) as {
        type?: string;
        recordType?: string;
      };
      if (parsed.type === "structured_record" && parsed.recordType) {
        parsedRecordType = parsed.recordType;
        title = eventTypeDisplayLabel(parsed.recordType);
      }
    } catch {
      // plain summary
    }

    const plain = ev.summary?.trim();
    if (plain && !plain.startsWith("{")) {
      const headline = clinicalHeadlineFromSummary(plain);
      const generic = EVENT_TYPE_LABELS[ev.eventType] ?? ev.eventType;
      if (!parsedRecordType) {
        title = headline;
      } else if (title === generic || title === ev.eventType) {
        title = headline;
      }
    }
  } else {
    title = structured.title;
  }

  const longDetail = eventDetailFromRecord(ev);
  const structuredDetail = structured
    ? formatStructuredRecordDescription(ev.summary, title)
    : undefined;
  let description = longDetail ?? structuredDetail;
  if (description?.trim() === title.trim()) description = undefined;

  const typeKey = structured?.recordType ?? parsedRecordType ?? ev.eventType;

  return {
    id: ev.entityKey,
    title,
    type: typeKey,
    typeLabel: eventTypeDisplayLabel(typeKey),
    date: new Date(ev.timestamp).toLocaleDateString("es-AR"),
    institution: HOSPITALS.find((h) => h.id === ev.hospitalId)?.name,
    status: "verified",
    doctor: ev.authorDisplayName,
    authorIdentityId: ev.authorIdentityId,
    description,
    isPinned: pinnedIds?.has(ev.entityKey),
    rawSummary: ev.summary,
  };
}

export function filterTimelineEvents(
  events: ClinicalEventRecord[],
  searchQuery: string,
  activeFilter: string,
): ClinicalEventRecord[] {
  return events.filter((ev) => {
    if (!isTimelineEvent(ev)) return false;
    if (isInvalidEventSummary(ev.summary)) return false;

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
