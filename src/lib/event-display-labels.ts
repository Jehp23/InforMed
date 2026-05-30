import { EVENT_TYPE_LABELS } from "./constants";

/** Tipos de registro avanzado (clave técnica en inglés → etiqueta UI en español). */
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

const ALL_TYPE_LABELS: Record<string, string> = {
  ...STRUCTURED_RECORD_TYPE_LABELS,
  ...EVENT_TYPE_LABELS,
};

/** Etiqueta en español; nunca devuelve la clave cruda en inglés. */
export function eventTypeDisplayLabel(typeKey: string): string {
  const trimmed = typeKey?.trim();
  if (!trimmed) return "Registro clínico";

  const lower = trimmed.toLowerCase();
  return (
    ALL_TYPE_LABELS[lower] ??
    ALL_TYPE_LABELS[trimmed] ??
    "Registro clínico"
  );
}

/** Si el texto es solo una clave de tipo (ej. «vaccine»), devuelve la etiqueta en español. */
export function translateTypeToken(value: string): string {
  const t = value.trim();
  if (!t || /\s/.test(t) || t.length > 40) return value;
  const lower = t.toLowerCase();
  return ALL_TYPE_LABELS[lower] ?? value;
}
