import { createHash } from "crypto";

import type { Hex } from "@arkiv-network/sdk";
import type { Entity } from "@arkiv-network/sdk/types";
import { eq } from "@arkiv-network/sdk/query";
import { jsonToPayload } from "@arkiv-network/sdk/utils";

import {
  DEFAULT_EXPIRES_IN_SECONDS,
  ENTITY_TYPE_IDENTITY,
  EVENT_STATUS_ACTIVE,
} from "./constants";
import { getPublicClient, getWalletClient } from "./arkiv";
import { withRetry } from "./retry";
import type { UserRole } from "./types";

export type IdentityPayload = {
  displayName: string;
  role: UserRole;
  registeredAt: string;
  app: "medtrail";
};

export type ArkivIdentity = {
  entityKey: Hex;
  userKey: string;
  role: UserRole;
  displayName: string;
  registeredAt: string;
  creator?: string;
  isNew: boolean;
  txHash?: string;
};

function attrMap(entity: Entity) {
  return Object.fromEntries(
    entity.attributes.map((a) => [a.key, String(a.value)]),
  ) as Record<string, string>;
}

export function makeUserKey(email: string, role: UserRole): string {
  return createHash("sha256")
    .update(`${email.trim().toLowerCase()}:${role}`)
    .digest("hex")
    .slice(0, 32);
}

function entityToIdentity(entity: Entity, isNew: boolean, txHash?: string): ArkivIdentity {
  const attrs = attrMap(entity);
  let payload: IdentityPayload;
  try {
    const text =
      entity.payload !== undefined
        ? new TextDecoder().decode(entity.payload)
        : "{}";
    payload = JSON.parse(text) as IdentityPayload;
  } catch {
    payload = {
      displayName: "Usuario MedTrail",
      role: (attrs.role as UserRole) ?? "doctor",
      registeredAt: new Date().toISOString(),
      app: "medtrail",
    };
  }

  return {
    entityKey: entity.key,
    userKey: attrs.userKey ?? "",
    role: (attrs.role as UserRole) ?? payload.role,
    displayName: payload.displayName,
    registeredAt: payload.registeredAt,
    creator: entity.creator,
    isNew,
    txHash,
  };
}

export async function queryIdentity(userKey: string): Promise<ArkivIdentity | null> {
  const client = getPublicClient();

  const result = await withRetry(
    () =>
      client
        .buildQuery()
        .where([
          eq("entityType", ENTITY_TYPE_IDENTITY),
          eq("userKey", userKey),
        ])
        .withPayload(true)
        .withAttributes(true)
        .limit(1)
        .fetch(),
    { attempts: 3, delayMs: 500 },
  );

  const entity = result.entities[0];
  if (!entity) return null;

  return entityToIdentity(entity, false);
}

export async function createIdentity(input: {
  email: string;
  role: UserRole;
  displayName?: string;
}): Promise<ArkivIdentity> {
  const userKey = makeUserKey(input.email, input.role);
  const displayName =
    input.displayName?.trim() ||
    input.email.split("@")[0]?.replace(/[._]/g, " ") ||
    "Usuario MedTrail";

  const payload: IdentityPayload = {
    displayName,
    role: input.role,
    registeredAt: new Date().toISOString(),
    app: "medtrail",
  };

  const wallet = getWalletClient();
  const { entityKey, txHash } = await wallet.createEntity({
    payload: jsonToPayload(payload),
    contentType: "application/json",
    attributes: [
      { key: "entityType", value: ENTITY_TYPE_IDENTITY },
      { key: "userKey", value: userKey },
      { key: "role", value: input.role },
      { key: "status", value: EVENT_STATUS_ACTIVE },
    ],
    expiresIn: DEFAULT_EXPIRES_IN_SECONDS,
  });

  return {
    entityKey,
    userKey,
    role: input.role,
    displayName,
    registeredAt: payload.registeredAt,
    isNew: true,
    txHash,
  };
}

export async function getIdentityByEntityKey(
  entityKey: Hex,
): Promise<ArkivIdentity | null> {
  try {
    const client = getPublicClient();
    const entity = await client.getEntity(entityKey);
    const attrs = attrMap(entity);
    if (attrs.entityType !== ENTITY_TYPE_IDENTITY) return null;
    return entityToIdentity(entity, false);
  } catch {
    return null;
  }
}

export async function ensureIdentity(input: {
  email: string;
  role: UserRole;
  displayName?: string;
}): Promise<ArkivIdentity> {
  const userKey = makeUserKey(input.email, input.role);
  const existing = await queryIdentity(userKey);
  if (existing) return existing;
  return createIdentity(input);
}
