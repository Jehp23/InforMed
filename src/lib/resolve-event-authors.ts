import type { Hex } from "@arkiv-network/sdk";

import { getIdentityByEntityKey } from "./identity";
import type { ClinicalEventRecord } from "./types";

export async function enrichEventsWithAuthorNames(
  events: ClinicalEventRecord[],
): Promise<ClinicalEventRecord[]> {
  const ids = [
    ...new Set(
      events
        .map((e) => e.authorIdentityId)
        .filter((id): id is string => Boolean(id)),
    ),
  ];

  if (ids.length === 0) return events;

  const nameById = new Map<string, string>();
  await Promise.all(
    ids.map(async (id) => {
      try {
        const identity = await getIdentityByEntityKey(id as Hex);
        if (identity?.displayName) nameById.set(id, identity.displayName);
      } catch {
        // omitir identidades no resolubles
      }
    }),
  );

  return events.map((ev) => {
    const authorDisplayName = ev.authorIdentityId
      ? nameById.get(ev.authorIdentityId)
      : undefined;
    if (!authorDisplayName) return ev;
    return { ...ev, authorDisplayName };
  });
}
