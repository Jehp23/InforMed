import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { queryClinicalEvents } from "@/lib/arkiv";
import { replyHistorialChat, type HistorialChatTurn } from "@/lib/historial-chat";
import { isLlmConfigured } from "@/lib/llm-chat";
import { DEMO_PATIENTS } from "@/lib/constants";

export async function POST(request: Request) {
  let patientId: string | undefined;
  let patientLabel: string | undefined;
  let message = "";
  let history: HistorialChatTurn[] = [];

  try {
    const body = (await request.json()) as {
      patientId?: string;
      patientLabel?: string;
      message?: string;
      history?: HistorialChatTurn[];
    };
    patientId = body.patientId;
    patientLabel = body.patientLabel;
    message = body.message ?? "";
    history = Array.isArray(body.history) ? body.history : [];
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  if (!patientId) {
    return NextResponse.json({ error: "patientId es requerido" }, { status: 400 });
  }

  if (!message.trim()) {
    return NextResponse.json({ error: "Escribí un mensaje" }, { status: 400 });
  }

  if (message.length > 2000) {
    return NextResponse.json({ error: "Mensaje demasiado largo" }, { status: 400 });
  }

  const label =
    patientLabel ??
    DEMO_PATIENTS.find((p) => p.id === patientId)?.label ??
    patientId;

  try {
    const events = await queryClinicalEvents(patientId);
    const { reply, source } = await replyHistorialChat({
      patientLabel: label,
      events,
      message,
      history: history.filter(
        (t) =>
          (t.role === "user" || t.role === "assistant") &&
          typeof t.content === "string",
      ),
    });

    return NextResponse.json({
      reply,
      source,
      llmConfigured: isLlmConfigured(),
    });
  } catch (e) {
    const errMsg = e instanceof Error ? e.message : "Error en el asistente";
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
