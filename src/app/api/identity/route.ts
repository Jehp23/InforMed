import { NextResponse } from "next/server";
import type { Hex } from "@arkiv-network/sdk";

export const runtime = "nodejs";
export const maxDuration = 30;
export const dynamic = "force-dynamic";

import { ENTITY_EXPLORER_BASE } from "@/lib/constants";
import {
  ensureIdentity,
  getIdentityByEntityKey,
  makeUserKey,
} from "@/lib/identity";
import type { UserRole } from "@/lib/types";

function identityResponse(identity: {
  entityKey: string;
  userKey: string;
  role: UserRole;
  displayName: string;
  isNew: boolean;
  txHash?: string;
}) {
  return {
    entityKey: identity.entityKey,
    arkivId: identity.entityKey,
    userKey: identity.userKey,
    displayName: identity.displayName,
    role: identity.role,
    isNew: identity.isNew,
    txHash: identity.txHash,
    explorerUrl: `${ENTITY_EXPLORER_BASE}${identity.entityKey}`,
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const arkivId = searchParams.get("arkivId");

  if (!arkivId) {
    return NextResponse.json({ error: "arkivId es requerido" }, { status: 400 });
  }

  try {
    const identity = await getIdentityByEntityKey(arkivId as Hex);
    if (!identity) {
      return NextResponse.json(
        { error: "Identidad no encontrada en Arkiv" },
        { status: 404 },
      );
    }
    return NextResponse.json(identityResponse(identity));
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Error al verificar identidad";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  let body: { email?: string; role?: UserRole; displayName?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const { email, role, displayName } = body;
  const normalizedEmail = email?.trim().toLowerCase();

  if (!normalizedEmail?.includes("@") || !role || !["doctor", "patient"].includes(role)) {
    return NextResponse.json(
      { error: "Correo válido y rol (doctor|patient) son requeridos" },
      { status: 400 },
    );
  }

  try {
    const identity = await ensureIdentity({
      email: normalizedEmail,
      role,
      displayName,
    });
    return NextResponse.json({
      ...identityResponse(identity),
      email: normalizedEmail,
      userKey: makeUserKey(normalizedEmail, role),
    });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Error al emitir identidad en Arkiv";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
