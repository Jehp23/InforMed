import { config } from "dotenv";

import { deleteClinicalEvent, queryClinicalEvents } from "../src/lib/arkiv";
import { isInvalidEventSummary } from "../src/lib/event-field-limits";
import { isTimelineEvent } from "../src/lib/timeline-utils";
import { DEMO_PATIENTS } from "../src/lib/constants";

async function cleanupPatient(patientId: string, dryRun: boolean) {
  const events = await queryClinicalEvents(patientId);
  const invalid = events.filter((e) => {
    if (!isTimelineEvent(e)) return false;
    return isInvalidEventSummary(e.summary);
  });

  console.log(`\n${patientId}: ${invalid.length} evento(s) inválido(s)`);

  for (const event of invalid) {
    const preview = event.summary.replace(/\s+/g, " ").slice(0, 80);
    if (dryRun) {
      console.log(`  [dry-run] eliminaría (${event.summary.length} chars): ${preview}…`);
      continue;
    }
    const { txHash } = await deleteClinicalEvent(event.entityKey as `0x${string}`);
    console.log(`  ✓ eliminado: ${preview}…`);
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

  console.log("\nListo. Recargá la app.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
