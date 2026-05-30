import { config } from "dotenv";

import { createClinicalEvent } from "../src/lib/arkiv";
import { DEMO_ACCOUNTS } from "../src/lib/constants";
import { ensureIdentity } from "../src/lib/identity";
import type { ClinicalEventPayload } from "../src/lib/types";

/**
 * Demo con al menos un evento de cada tipo por paciente principal.
 * Tipos: allergy, admission, discharge, lab, note
 */
const seeds: ClinicalEventPayload[] = [
  // —— María González (demo-001): todos los tipos ——
  {
    patientId: "demo-001",
    hospitalId: "hospital-norte",
    eventType: "allergy",
    summary: "Alergia a penicilina — urticaria leve (2022)",
    timestamp: "2026-05-27T10:00:00.000Z",
  },
  {
    patientId: "demo-001",
    hospitalId: "hospital-sur",
    eventType: "allergy",
    summary: "Alergia a la lavandina. Brotes bajo los ojos y en los antebrazos.",
    timestamp: "2026-05-27T14:00:00.000Z",
  },
  {
    patientId: "demo-001",
    hospitalId: "hospital-centro",
    eventType: "lab",
    summary: "Hemograma y perfil lipídico — dentro de rango",
    timestamp: "2026-05-26T11:00:00.000Z",
  },
  {
    patientId: "demo-001",
    hospitalId: "hospital-norte",
    eventType: "note",
    summary: "Medicación habitual: Losartán 50 mg/día. Sin cambios al alta.",
    timestamp: "2026-05-25T09:00:00.000Z",
  },
  {
    patientId: "demo-001",
    hospitalId: "hospital-sur",
    eventType: "note",
    summary: "Historial repartido en varios hospitales — coordinar traslados",
    timestamp: "2026-05-24T16:00:00.000Z",
  },
  {
    patientId: "demo-001",
    hospitalId: "hospital-sur",
    eventType: "admission",
    summary: "Ingreso urgencias — dolor torácico atípico, observación 6h",
    timestamp: "2026-05-28T08:30:00.000Z",
  },
  {
    patientId: "demo-001",
    hospitalId: "hospital-sur",
    eventType: "discharge",
    summary: "Alta ambulatoria — dolor torácico descartado, seguimiento cardiólogo",
    timestamp: "2026-05-28T16:00:00.000Z",
  },

  // —— Juan Pérez (demo-002) ——
  {
    patientId: "demo-002",
    hospitalId: "hospital-centro",
    eventType: "allergy",
    summary: "Alergia a penicilina — rash cutáneo (2021)",
    timestamp: "2026-05-25T11:00:00.000Z",
  },
  {
    patientId: "demo-002",
    hospitalId: "hospital-norte",
    eventType: "allergy",
    summary: "Alergia a AINEs — broncoespasmo leve",
    timestamp: "2026-05-26T09:30:00.000Z",
  },
  {
    patientId: "demo-002",
    hospitalId: "hospital-centro",
    eventType: "lab",
    summary: "Hemograma dentro de rango normal",
    timestamp: "2026-05-26T14:00:00.000Z",
  },
  {
    patientId: "demo-002",
    hospitalId: "hospital-centro",
    eventType: "admission",
    summary: "Ingreso observación — control post broncoespasmo",
    timestamp: "2026-05-27T18:00:00.000Z",
  },
  {
    patientId: "demo-002",
    hospitalId: "hospital-centro",
    eventType: "discharge",
    summary: "Alta con plan de seguimiento neumonología",
    timestamp: "2026-05-28T10:00:00.000Z",
  },
  {
    patientId: "demo-002",
    hospitalId: "hospital-norte",
    eventType: "note",
    summary: "Nota: evitar AINEs y antiinflamatorios no prescritos",
    timestamp: "2026-05-26T16:00:00.000Z",
  },

  // —— Ana López (demo-003): set mínimo ——
  {
    patientId: "demo-003",
    hospitalId: "hospital-norte",
    eventType: "allergy",
    summary: "Alergia a yodo — reacción cutánea leve",
    timestamp: "2026-05-20T10:00:00.000Z",
  },
  {
    patientId: "demo-003",
    hospitalId: "hospital-sur",
    eventType: "admission",
    summary: "Ingreso programado — estudio prequirúrgico",
    timestamp: "2026-05-22T08:00:00.000Z",
  },
  {
    patientId: "demo-003",
    hospitalId: "hospital-sur",
    eventType: "discharge",
    summary: "Alta sin complicaciones — control en 7 días",
    timestamp: "2026-05-23T12:00:00.000Z",
  },
  {
    patientId: "demo-003",
    hospitalId: "hospital-centro",
    eventType: "lab",
    summary: "Glucemia en ayunas — 98 mg/dL",
    timestamp: "2026-05-21T09:00:00.000Z",
  },
  {
    patientId: "demo-003",
    hospitalId: "hospital-norte",
    eventType: "note",
    summary: "Nota administrativa: autorización de interconsulta enviada",
    timestamp: "2026-05-19T15:00:00.000Z",
  },
];

async function main() {
  config();

  console.log("Identidades demo (@demo.com)…");
  for (const account of DEMO_ACCOUNTS) {
    const identity = await ensureIdentity({
      email: account.email,
      role: account.role,
      displayName: account.displayName,
    });
    console.log(`✓ ${account.email} → ${identity.entityKey.slice(0, 12)}…`);
  }

  console.log("\nEventos clínicos (5 tipos × pacientes demo)…");
  for (const payload of seeds) {
    const { entityKey, txHash } = await createClinicalEvent(payload);
    console.log(`✓ ${payload.patientId} / ${payload.eventType}`);
    console.log(`  ${entityKey} — ${txHash}`);
  }

  console.log("\nListo.");
  console.log("  Demo médico:  medico@demo.com");
  console.log("  Demo paciente: maria@demo.com");
  console.log("  App: http://localhost:3000");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
