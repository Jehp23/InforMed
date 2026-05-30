import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

import {
  createClinicalEvent,
  queryClinicalEvents,
} from "@/lib/arkiv";
import { enrichEventsWithAuthorNames } from "@/lib/resolve-event-authors";
import { trimEventFields, validateEventFields } from "@/lib/clinical-event-text";
import { isInvalidEventSummary } from "@/lib/event-field-limits";
import {
  enrichStructuredRecordSummary,
  validateStructuredRecordPayload,
} from "@/lib/structured-record";
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
    const events = await enrichEventsWithAuthorNames(
      await queryClinicalEvents(patientId),
    );
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

  const { patientId, hospitalId, eventType, summary, detail, authorIdentityId } = body;
  if (!patientId || !hospitalId || !eventType || !summary?.trim()) {
    return NextResponse.json(
      { error: "patientId, hospitalId, eventType y summary son requeridos" },
      { status: 400 },
    );
  }

  if (!VALID_TYPES.includes(eventType)) {
    return NextResponse.json({ error: "eventType inválido" }, { status: 400 });
  }

  const trimmedSummary = summary.trim();
  let payloadSummary = trimmedSummary;
  let payloadDetail = detail?.trim();

  if (trimmedSummary.startsWith("{")) {
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(trimmedSummary) as Record<string, unknown>;
    } catch {
      return NextResponse.json({ error: "Registro estructurado inválido" }, { status: 400 });
    }
    const structError = validateStructuredRecordPayload(
      parsed as Record<string, string>,
    );
    if (structError) {
      return NextResponse.json({ error: structError }, { status: 400 });
    }
    if (isInvalidEventSummary(trimmedSummary)) {
      return NextResponse.json({ error: "Registro de prueba no permitido" }, { status: 400 });
    }
    payloadSummary = enrichStructuredRecordSummary(trimmedSummary);
  } else {
    const fields = trimEventFields(trimmedSummary, payloadDetail);
    const validationError = validateEventFields(fields.summary, fields.detail);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }
    payloadSummary = fields.summary;
    payloadDetail = fields.detail;
  }

  const payload = {
    patientId,
    hospitalId,
    eventType,
    summary: payloadSummary,
    ...(payloadDetail ? { detail: payloadDetail } : {}),
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
