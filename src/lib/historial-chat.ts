import type { ClinicalEventRecord } from "./types";
import { chatCompletion, type LlmAssistSource } from "./llm-chat";
import {
  collectAllergiesFromEvents,
  deriveClinicalSummaryFromEvents,
} from "./derive-patient-summary";
import { buildRuleBasedHandoff } from "./summary";
import { eventTypeDisplayLabel } from "./event-display-labels";
import { parseStructuredRecord } from "./structured-record";
import { EVENT_TYPE_LABELS, HOSPITALS } from "./constants";

export type HistorialChatTurn = {
  role: "user" | "assistant";
  content: string;
};

const CHAT_SYSTEM = `Sos el asistente de historial de InforMed (registros clínicos verificados en Arkiv).
Tu único alcance es ayudar al profesional con tareas administrativas del historial:
- resumir o ordenar eventos ya cargados,
- preparar briefs de traslado entre hospitales,
- redactar borradores de texto para publicar un registro,
- responder preguntas sobre qué figura en el historial (fechas, hospitales, alergias registradas).

PROHIBIDO: diagnosticar, sugerir tratamientos, interpretar estudios, dar consejo médico.
Si preguntan algo clínico, decí que solo podés ayudar con el historial verificado.
Usá el bloque "resumenDerivado" (especialmente "alergias") y la lista "eventos". Si alergias tiene ítems, listalos; no digas que no hay si el resumen las incluye.
Solo usá ese contexto. Si no hay datos, decilo. Español rioplatense, respuestas cortas (máx. 12 líneas salvo que pidan un brief).
Formato del brief (sin # ni ###), muy breve:
- **Brief de traslado — [paciente]**
- **Alergias:** (dejá la sección vacía o escribí "ver registros" — la UI lista las sustancias sola)
- **Últimas internaciones:** (vacía; la UI muestra chips Ingreso/Alta clicables con fecha y hospital)
- **Medicación:** (vacía; la UI enlaza notas con medicación habitual)
- **Notas:** (vacía; la UI enlaza notas administrativas)
- Opcional **Laboratorio:** si hay estudios recientes (vacía; la UI enlaza labs)
NO repitas "Alergia a…", ni reacciones, ni motivos largos: el detalle está en cada registro al abrirlo.
Tipos de evento (la UI los colorea igual que el historial): alergia, ingreso, alta, laboratorio, nota.`;

function timelineEvents(events: ClinicalEventRecord[]) {
  return events.filter((e) => {
    try {
      return (JSON.parse(e.summary) as { type?: string }).type !== "patient_data";
    } catch {
      return true;
    }
  });
}

function buildChatContext(events: ClinicalEventRecord[]) {
  const timeline = timelineEvents(events);
  const derived = deriveClinicalSummaryFromEvents(events);
  return {
    resumenDerivado: {
      alergias: derived.allergies,
      alertas: derived.clinicalAlerts,
      ultimasInternaciones: derived.lastHospitalizations,
      medicacion: derived.currentMedication,
    },
    eventos: timeline.map((e) => ({
      eventType: e.eventType,
      label:
        parseStructuredRecord(e.summary)?.recordTypeLabel ??
        EVENT_TYPE_LABELS[e.eventType] ??
        eventTypeDisplayLabel(e.eventType),
      summary: e.summary,
      hospital: HOSPITALS.find((h) => h.id === e.hospitalId)?.name ?? e.hospitalId,
      timestamp: e.timestamp,
    })),
  };
}

function ruleBasedReply(
  userMessage: string,
  patientLabel: string,
  events: ClinicalEventRecord[],
): string {
  const lower = userMessage.toLowerCase();
  const timeline = timelineEvents(events);

  if (
    lower.includes("brief") ||
    lower.includes("traslado") ||
    lower.includes("deriv")
  ) {
    return buildRuleBasedHandoff(patientLabel, timeline);
  }

  if (lower.includes("alergia")) {
    const allergyLabels = collectAllergiesFromEvents(events);
    if (allergyLabels.length === 0) {
      return "No hay alergias registradas en el historial verificado de este paciente.";
    }
    return [
      "Alergias en el historial verificado:",
      ...allergyLabels.map((a) => `• ${a}`),
    ].join("\n");
  }

  if (timeline.length === 0) {
    return "Este paciente no tiene eventos en el historial todavía. Podés cargar el primero con «Registrar evento».";
  }

  return [
    "El chat con IA necesita GROQ_API_KEY en el servidor (reiniciá npm run dev después de agregarla).",
    `Hay ${timeline.length} evento(s) verificados — usá la pestaña Historial o pedí un «brief de traslado».`,
  ].join("\n");
}

export async function replyHistorialChat(input: {
  patientLabel: string;
  events: ClinicalEventRecord[];
  message: string;
  history?: HistorialChatTurn[];
}): Promise<{ reply: string; source: LlmAssistSource }> {
  const trimmed = input.message.trim();
  if (!trimmed) {
    return { reply: "Escribí una pregunta sobre el historial.", source: "rules" };
  }

  const contextJson = JSON.stringify(buildChatContext(input.events), null, 2);

  const history = (input.history ?? []).slice(-6);

  const llm = await chatCompletion(
    [
      { role: "system", content: CHAT_SYSTEM },
      {
        role: "system",
        content: `Paciente: ${input.patientLabel}\nEventos verificados:\n${contextJson}`,
      },
      ...history.map((t) => ({ role: t.role, content: t.content })),
      { role: "user", content: trimmed },
    ],
    0.25,
  );

  if (llm) {
    return { reply: llm.text, source: llm.source };
  }

  return {
    reply: ruleBasedReply(trimmed, input.patientLabel, input.events),
    source: "rules",
  };
}
