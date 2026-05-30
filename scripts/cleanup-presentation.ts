import { config } from "dotenv";

import {
  deleteClinicalEvent,
  queryClinicalEvents,
} from "../src/lib/arkiv";
import {
  DEMO_PATIENTS,
  PRESENTATION_EVENT_SUMMARIES,
} from "../src/lib/constants";
import type { ClinicalEventRecord } from "../src/lib/types";

function isPatientData(summary: string): boolean {
  try {
    return (JSON.parse(summary) as { type?: string }).type === "patient_data";
  } catch {
    return false;
  }
}

function pickNewest(events: ClinicalEventRecord[]): ClinicalEventRecord | null {
  if (events.length === 0) return null;
  return [...events].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  )[0];
}

function keysToKeep(events: ClinicalEventRecord[]): Set<string> {
  const keep = new Set<string>();

  const patientDataEvents = events.filter((e) => isPatientData(e.summary));
  const latestPatientData = pickNewest(patientDataEvents);
  if (latestPatientData) keep.add(latestPatientData.entityKey);

  for (const summary of PRESENTATION_EVENT_SUMMARIES) {
    const matches = events.filter((e) => e.summary.trim() === summary);
    const latest = pickNewest(matches);
    if (latest) keep.add(latest.entityKey);
  }

  return keep;
}

async function cleanupPatient(patientId: string, dryRun: boolean) {
  const events = await queryClinicalEvents(patientId);
  const keep = keysToKeep(events);
  const toDelete = events.filter((e) => !keep.has(e.entityKey));

  console.log(`\n${patientId}: ${events.length} total → conservar ${keep.size}, eliminar ${toDelete.length}`);

  for (const event of toDelete) {
    const preview = event.summary.replace(/\s+/g, " ").slice(0, 72);
    if (dryRun) {
      console.log(`  [dry-run] eliminaría: ${preview}`);
      continue;
    }
    const { txHash } = await deleteClinicalEvent(event.entityKey as `0x${string}`);
    console.log(`  ✓ eliminado: ${preview}`);
    console.log(`    tx: ${txHash}`);
  }
}

async function main() {
  config();
  const dryRun = process.argv.includes("--dry-run");

  if (dryRun) {
    console.log("Modo dry-run — no se borra nada on-chain\n");
  }

  for (const patient of DEMO_PATIENTS) {
    await cleanupPatient(patient.id, dryRun);
  }

  console.log("\nListo. Recargá la app para ver el historial limpio.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
