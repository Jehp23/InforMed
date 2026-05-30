import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import {
  createClinicalEvent,
  queryClinicalEvents,
} from "@/lib/arkiv";
import type { CreateEventBody, EventType } from "@/lib/types";

const VALID_TYPES: EventType[] = [
  "allergy",
  "admission",
  "discharge",
  "lab",
  "note",
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const patientId = searchParams.get("patientId");

  if (!patientId) {
    return NextResponse.json(
      { error: "patientId es requerido" },
      { status: 400 },
    );
  }

  try {
    const events = await queryClinicalEvents(patientId);
    return NextResponse.json({ events });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error al consultar Arkiv";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  let body: CreateEventBody;
  try {
    body = (await request.json()) as CreateEventBody;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const { patientId, hospitalId, eventType, summary, authorIdentityId } = body;
  if (!patientId || !hospitalId || !eventType || !summary?.trim()) {
    return NextResponse.json(
      { error: "patientId, hospitalId, eventType y summary son requeridos" },
      { status: 400 },
    );
  }

  if (!VALID_TYPES.includes(eventType)) {
    return NextResponse.json({ error: "eventType inválido" }, { status: 400 });
  }

  const payload = {
    patientId,
    hospitalId,
    eventType,
    summary: summary.trim(),
    timestamp: new Date().toISOString(),
  };

  try {
    const { entityKey, txHash } = await createClinicalEvent(payload, {
      authorIdentityId,
    });
    return NextResponse.json({
      event: { ...payload, entityKey, txHash },
      entityKey,
      txHash,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error al crear entidad";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
