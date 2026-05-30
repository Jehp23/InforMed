import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { queryClinicalEvents } from "@/lib/arkiv";
import { buildHandoffBrief } from "@/lib/historial-ai";
import { DEMO_PATIENTS } from "@/lib/constants";

export async function POST(request: Request) {
  let patientId: string | undefined;
  let patientLabel: string | undefined;
  try {
    const body = (await request.json()) as {
      patientId?: string;
      patientLabel?: string;
    };
    patientId = body.patientId;
    patientLabel = body.patientLabel;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  if (!patientId) {
    return NextResponse.json(
      { error: "patientId es requerido" },
      { status: 400 },
    );
  }

  const label =
    patientLabel ??
    DEMO_PATIENTS.find((p) => p.id === patientId)?.label ??
    patientId;

  try {
    const events = await queryClinicalEvents(patientId);
    const { text, source } = await buildHandoffBrief(label, events);
    return NextResponse.json({
      summary: text,
      source,
      eventCount: events.length,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error al generar resumen";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
