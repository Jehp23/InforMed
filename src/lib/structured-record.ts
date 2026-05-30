import {
  EVENT_DETAIL_MAX,
  displayLabelFromSummary,
  isTestOrSpamSummary,
  validateEventDetail,
} from "./event-field-limits";

export const STRUCTURED_RECORD_TYPE_LABELS: Record<string, string> = {
  consultation: "Consulta médica",
  hospitalization: "Internación",
  surgery: "Cirugía",
  allergy: "Alergia o reacción",
  medication: "Medicación",
  study: "Estudio o análisis",
  diagnosis: "Diagnóstico",
  vaccine: "Vacuna",
  document: "Documento médico",
  other: "Otro registro",
};

const FIELD_LABELS: Record<string, string> = {
  substance: "Sustancia",
  procedure: "Procedimiento",
  institution: "Institución",
  date: "Fecha",
  reason: "Motivo",
  description: "Descripción",
  diagnosis: "Diagnóstico",
  observations: "Observaciones",
};

export type ParsedStructuredRecord = {
  recordType: string;
  recordTypeLabel: string;
  title: string;
  fields: Array<{ key: string; label: string; value: string }>;
};

export function parseStructuredRecord(summary: string): ParsedStructuredRecord | null {
  try {
    const parsed = JSON.parse(summary) as Record<string, unknown>;
    if (parsed.type !== "structured_record" || !parsed.recordType) return null;

    const recordType = String(parsed.recordType);
    const recordTypeLabel =
      STRUCTURED_RECORD_TYPE_LABELS[recordType] ?? recordType;

    let title = recordTypeLabel;
    if (recordType === "medication" && parsed.substance) {
      title = displayLabelFromSummary(String(parsed.substance), 80) || title;
    } else if (recordType === "surgery" && parsed.procedure) {
      title = displayLabelFromSummary(String(parsed.procedure), 80) || title;
    } else if (recordType === "allergy" && parsed.substance) {
      title = displayLabelFromSummary(String(parsed.substance), 80) || title;
    } else if (parsed.description) {
      const head = String(parsed.description).split("—")[0]?.trim();
      title = displayLabelFromSummary(head || String(parsed.description), 80) || title;
    }

    const fields: ParsedStructuredRecord["fields"] = [];
    for (const [key, value] of Object.entries(parsed)) {
      if (key === "type" || key === "recordType" || value === undefined || value === "") {
        continue;
      }
      const raw = String(value).trim();
      if (!raw || isTestOrSpamSummary(raw)) continue;

      const label = FIELD_LABELS[key] ?? key;
      const display =
        raw.length > EVENT_DETAIL_MAX
          ? `${raw.slice(0, EVENT_DETAIL_MAX - 1)}…`
          : raw;
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
    if (key === "recordType" || !value.trim()) continue;
    if (isTestOrSpamSummary(value)) {
      return "Hay texto de prueba en el formulario. Completá con datos clínicos reales.";
    }
    const detailErr = validateEventDetail(value);
    if (detailErr) return detailErr;
  }

  const hasContent = Object.entries(data).some(
    ([k, v]) => k !== "recordType" && v.trim().length > 0,
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
  if (parsed.fields.length === 0) return true;
  return false;
}

export function formatStructuredRecordDescription(
  summary: string,
  displayTitle?: string,
): string | undefined {
  const parsed = parseStructuredRecord(summary);
  if (!parsed || parsed.fields.length === 0) return undefined;

  const lines = parsed.fields
    .filter((f) => f.label !== "Tipo" && f.value !== displayTitle)
    .map((f) => `${f.label}: ${f.value}`);

  return lines.length > 0 ? lines.join("\n") : undefined;
}
