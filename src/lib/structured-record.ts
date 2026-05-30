import {
  EVENT_DETAIL_MAX,
  displayLabelFromSummary,
  isTestOrSpamSummary,
  validateEventDetail,
} from "./event-field-limits";
import {
  eventTypeDisplayLabel,
  STRUCTURED_RECORD_TYPE_LABELS,
  translateTypeToken,
} from "./event-display-labels";

export { STRUCTURED_RECORD_TYPE_LABELS };

const FIELD_LABELS: Record<string, string> = {
  substance: "Sustancia",
  procedure: "Procedimiento",
  institution: "Institución",
  date: "Fecha",
  reason: "Motivo",
  description: "Descripción",
  diagnosis: "Diagnóstico",
  observations: "Observaciones",
  recordTypeLabel: "Tipo",
};

const STRUCTURED_META_KEYS = new Set([
  "type",
  "recordType",
  "recordTypeLabel",
]);

export type ParsedStructuredRecord = {
  recordType: string;
  recordTypeLabel: string;
  title: string;
  fields: Array<{ key: string; label: string; value: string }>;
};

function resolveRecordTypeLabel(
  recordType: string,
  storedLabel?: unknown,
): string {
  const fromStore = String(storedLabel ?? "").trim();
  if (fromStore && fromStore.toLowerCase() !== recordType.toLowerCase()) {
    return fromStore;
  }
  return eventTypeDisplayLabel(recordType);
}

function resolveStructuredTitle(
  recordType: string,
  recordTypeLabel: string,
  parsed: Record<string, unknown>,
): string {
  if (recordType === "medication" && parsed.substance) {
    return displayLabelFromSummary(String(parsed.substance), 80) || recordTypeLabel;
  }
  if (recordType === "surgery" && parsed.procedure) {
    return displayLabelFromSummary(String(parsed.procedure), 80) || recordTypeLabel;
  }
  if (recordType === "allergy" && parsed.substance) {
    return displayLabelFromSummary(String(parsed.substance), 80) || recordTypeLabel;
  }
  if (parsed.description) {
    const head = String(parsed.description).split("—")[0]?.trim();
    const fromDesc =
      displayLabelFromSummary(head || String(parsed.description), 80) || "";
    if (fromDesc && fromDesc.toLowerCase() !== recordType.toLowerCase()) {
      return fromDesc;
    }
  }
  return recordTypeLabel;
}

export function enrichStructuredRecordPayload(
  data: Record<string, string>,
): Record<string, string> {
  const recordType = data.recordType?.trim().toLowerCase();
  if (!recordType) return data;

  const recordTypeLabel = eventTypeDisplayLabel(recordType);
  return {
    ...data,
    type: "structured_record",
    recordType,
    recordTypeLabel,
  };
}

export function enrichStructuredRecordSummary(summary: string): string {
  try {
    const parsed = JSON.parse(summary) as Record<string, string>;
    if (parsed.type !== "structured_record" || !parsed.recordType?.trim()) {
      return summary;
    }
    return JSON.stringify(enrichStructuredRecordPayload(parsed));
  } catch {
    return summary;
  }
}

export function parseStructuredRecord(summary: string): ParsedStructuredRecord | null {
  try {
    const parsed = JSON.parse(summary) as Record<string, unknown>;
    if (parsed.type !== "structured_record" || !parsed.recordType) return null;

    const recordType = String(parsed.recordType).trim().toLowerCase();
    const recordTypeLabel = resolveRecordTypeLabel(
      recordType,
      parsed.recordTypeLabel,
    );

    let title = resolveStructuredTitle(recordType, recordTypeLabel, parsed);
    if (title.toLowerCase() === recordType.toLowerCase()) {
      title = recordTypeLabel;
    }
    title = translateTypeToken(title);
    if (title.toLowerCase() === recordType.toLowerCase()) {
      title = recordTypeLabel;
    }

    const fields: ParsedStructuredRecord["fields"] = [
      { key: "recordTypeLabel", label: "Tipo", value: recordTypeLabel },
    ];

    for (const [key, value] of Object.entries(parsed)) {
      if (STRUCTURED_META_KEYS.has(key) || value === undefined || value === "") {
        continue;
      }
      const raw = String(value).trim();
      if (!raw || isTestOrSpamSummary(raw)) continue;

      const label = FIELD_LABELS[key] ?? key;
      const display =
        raw.length > EVENT_DETAIL_MAX
          ? `${raw.slice(0, EVENT_DETAIL_MAX - 1)}…`
          : translateTypeToken(raw);
      fields.push({ key, label, value: display });
    }

    return { recordType, recordTypeLabel, title, fields };
  } catch {
    return null;
  }
}

export function validateStructuredRecordPayload(
  data: Record<string, string>,
): string | null {
  if (!data.recordType?.trim()) return "Elegí un tipo de registro.";

  for (const [key, value] of Object.entries(data)) {
    if (STRUCTURED_META_KEYS.has(key) || !value.trim()) continue;
    if (isTestOrSpamSummary(value)) {
      return "Hay texto de prueba en el formulario. Completá con datos clínicos reales.";
    }
    const detailErr = validateEventDetail(value);
    if (detailErr) return detailErr;
  }

  const hasContent = Object.entries(data).some(
    ([k, v]) => !STRUCTURED_META_KEYS.has(k) && v.trim().length > 0,
  );
  if (!hasContent) return "Completá al menos un campo del registro.";

  return null;
}

export function isInvalidStructuredRecordSummary(summary: string): boolean {
  const parsed = parseStructuredRecord(summary);
  if (!parsed) {
    try {
      const raw = JSON.parse(summary) as { type?: string };
      if (raw.type === "structured_record") {
        const blob = JSON.stringify(raw);
        return isTestOrSpamSummary(blob.replace(/[{":},\s]/g, "").slice(0, 200));
      }
    } catch {
      return false;
    }
    return false;
  }
  if (parsed.fields.length <= 1) return true;
  return false;
}

export function formatStructuredRecordDescription(
  summary: string,
  displayTitle?: string,
): string | undefined {
  const parsed = parseStructuredRecord(summary);
  if (!parsed || parsed.fields.length === 0) return undefined;

  const lines = parsed.fields
    .filter(
      (f) =>
        f.key !== "recordTypeLabel" &&
        f.label !== "Tipo" &&
        f.value !== displayTitle &&
        f.value !== parsed.recordTypeLabel,
    )
    .map((f) => `${f.label}: ${f.value}`);

  return lines.length > 0 ? lines.join("\n") : undefined;
}
