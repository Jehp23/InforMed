import type { ClinicalEventRecord } from "./types";
import { chatCompletion, type LlmAssistSource } from "./llm-chat";
import { buildRuleBasedHandoff, buildRuleBasedDraftNote } from "./summary";

const HANDOFF_SYSTEM = `Sos un asistente administrativo de historiales clínicos digitales (InforMed / Arkiv).
NO sos médico: no diagnosticás, no recomendás tratamientos ni interpretás estudios.
Tu trabajo: reorganizar eventos ya verificados para que otro profesional lea el historial más rápido al recibir un paciente o derivarlo.
Salida en español, máximo 14 líneas, con etiquetas cortas:
• Alergias registradas (si hay)
• Hitos recientes (fecha aproximada, hospital, tipo de evento)
• Pendientes administrativos (solo si los datos lo sugieren; ej. "solicitar estudios previos")
Solo usá el JSON provisto. Si falta información, decilo. No inventes datos.`;

const DRAFT_SYSTEM = `Sos un asistente de redacción para registros en historial clínico compartido.
El profesional te da bullets o notas sueltas; devolvés UN texto listo para publicar como registro (sin encabezados markdown).
NO diagnosticás ni sugerís tratamientos. Solo ordenás y clarificás lo que el usuario escribió.
Máximo 6 oraciones, español rioplatense neutro, tono factual.`;

function filterTimeline(events: ClinicalEventRecord[]) {
  return events.filter((e) => {
    try {
      return (JSON.parse(e.summary) as { type?: string }).type !== "patient_data";
    } catch {
      return true;
    }
  });
}

export async function buildHandoffBrief(
  patientLabel: string,
  events: ClinicalEventRecord[],
): Promise<{ text: string; source: LlmAssistSource }> {
  const timeline = filterTimeline(events);

  const context = timeline.map((e) => ({
    eventType: e.eventType,
    summary: e.summary,
    hospitalId: e.hospitalId,
    timestamp: e.timestamp,
  }));

  const llm = await chatCompletion(
    [
      { role: "system", content: HANDOFF_SYSTEM },
      {
        role: "user",
        content: `Paciente: ${patientLabel}\nEventos verificados:\n${JSON.stringify(context, null, 2)}`,
      },
    ],
    0.2,
  );

  if (llm) {
    return { text: llm.text, source: llm.source };
  }

  return {
    text: buildRuleBasedHandoff(patientLabel, timeline),
    source: "rules",
  };
}

export async function buildDraftNoteFromBullets(
  eventType: string,
  bullets: string,
): Promise<{ text: string; source: LlmAssistSource }> {
  const trimmed = bullets.trim();
  if (!trimmed) {
    return { text: "", source: "rules" };
  }

  const llm = await chatCompletion(
    [
      { role: "system", content: DRAFT_SYSTEM },
      {
        role: "user",
        content: `Tipo de registro: ${eventType}\nNotas del profesional:\n${trimmed}`,
      },
    ],
    0.3,
  );

  if (llm) {
    return { text: llm.text, source: llm.source };
  }

  return {
    text: buildRuleBasedDraftNote(eventType, trimmed),
    source: "rules",
  };
}
