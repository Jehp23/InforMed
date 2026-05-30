import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;
export const dynamic = "force-dynamic";

import { buildDraftNoteFromBullets } from "@/lib/historial-ai";

export async function POST(request: Request) {
  let eventType = "note";
  let bullets = "";
  try {
    const body = (await request.json()) as {
      eventType?: string;
      bullets?: string;
    };
    eventType = body.eventType ?? "note";
    bullets = body.bullets ?? "";
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  if (!bullets.trim()) {
    return NextResponse.json(
      { error: "Escribí al menos una nota o bullet para ordenar" },
      { status: 400 },
    );
  }

  try {
    const { text, source } = await buildDraftNoteFromBullets(eventType, bullets);
    return NextResponse.json({ draft: text, source });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error al redactar";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
