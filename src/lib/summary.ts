import type { ClinicalEventRecord } from "./types";
import { collectAllergiesFromEvents } from "./derive-patient-summary";
import { EVENT_TYPE_LABELS, HOSPITALS } from "./constants";

function hospitalName(id: string) {
  return HOSPITALS.find((h) => h.id === id)?.name ?? id;
}

/** Brief de traslado sin API de IA */
export function buildRuleBasedHandoff(
  patientLabel: string,
  events: ClinicalEventRecord[],
): string {
  if (events.length === 0) {
    return `Brief de historial — ${patientLabel}\nSin eventos verificables cargados. Publicá el primer registro desde la consola.`;
  }

  const allergyLabels = collectAllergiesFromEvents(events);
  const admissions = events.filter((e) => e.eventType === "admission");
  const lines: string[] = [
    `Brief de historial — ${patientLabel}`,
    `${events.length} evento(s) verificable(s) en el historial compartido.`,
    "",
  ];

  if (allergyLabels.length > 0) {
    lines.push(
      "Alergias registradas:",
      ...allergyLabels.map((a) => `  • ${a}`),
      "",
    );
  } else {
    lines.push("Alergias registradas: ninguna en el timeline.", "");
  }

  if (admissions.length > 0) {
    const last = admissions[0];
    lines.push(
      `Último ingreso: ${last.summary} — ${hospitalName(last.hospitalId)} (${new Date(last.timestamp).toLocaleDateString("es-AR")}).`,
      "",
    );
  }

  lines.push("Hitos recientes:");
  for (const e of events.slice(0, 6)) {
    const tipo = EVENT_TYPE_LABELS[e.eventType] ?? e.eventType;
    const fecha = new Date(e.timestamp).toLocaleDateString("es-AR");
    lines.push(`  • [${fecha}] ${tipo}: ${e.summary} — ${hospitalName(e.hospitalId)}`);
  }

  lines.push("", "— Generado sin IA (reglas locales). No reemplaza lectura del historial.");
  return lines.join("\n");
}

/** Borrador de registro sin API de IA */
export function buildRuleBasedDraftNote(eventType: string, bullets: string): string {
  const lines = bullets
    .split(/\n+/)
    .map((l) => l.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean);
  const body = lines.join(". ");
  const prefix =
    eventType === "allergy"
      ? "Alergia registrada: "
      : eventType === "admission"
        ? "Ingreso: "
        : eventType === "note"
          ? "Nota: "
          : "";
  return `${prefix}${body}${body.endsWith(".") ? "" : "."}`;
}

/** @deprecated Usar buildHandoffBrief desde historial-ai */
export async function buildAiSummary(
  patientId: string,
  events: ClinicalEventRecord[],
): Promise<{ text: string; source: import("./llm-chat").LlmAssistSource }> {
  const { buildHandoffBrief } = await import("./historial-ai");
  return buildHandoffBrief(patientId, events);
}
