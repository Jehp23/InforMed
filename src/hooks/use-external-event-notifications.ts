"use client";

import { useEffect, useRef } from "react";

import { EVENT_TYPE_LABELS, HOSPITALS } from "@/lib/constants";
import type { ToastPayload } from "@/components/ui/app-toast";
import type { ClinicalEventRecord } from "@/lib/types";

function hospitalName(hospitalId: string) {
  return HOSPITALS.find((h) => h.id === hospitalId)?.name ?? hospitalId;
}

function eventLabel(event: ClinicalEventRecord) {
  return EVENT_TYPE_LABELS[event.eventType] ?? "Registro clínico";
}

export function useExternalEventNotifications({
  events,
  loading,
  patientId,
  viewerHospitalId,
  patientLabel,
  onNotify,
}: {
  events: ClinicalEventRecord[];
  loading: boolean;
  patientId: string;
  /** Médico: solo avisa eventos de otros hospitales. Paciente: omitir para avisar cualquier evento nuevo. */
  viewerHospitalId?: string;
  patientLabel: string;
  onNotify: (toast: ToastPayload) => void;
}) {
  const knownKeysRef = useRef<Set<string>>(new Set());
  const readyRef = useRef(false);
  const patientRef = useRef(patientId);

  useEffect(() => {
    if (patientRef.current !== patientId) {
      patientRef.current = patientId;
      knownKeysRef.current = new Set();
      readyRef.current = false;
    }
  }, [patientId]);

  useEffect(() => {
    if (loading) return;

    const keys = new Set(events.map((ev) => ev.entityKey));

    if (!readyRef.current) {
      knownKeysRef.current = keys;
      readyRef.current = true;
      return;
    }

    const incoming = events.filter((ev) => !knownKeysRef.current.has(ev.entityKey));
    knownKeysRef.current = keys;

    for (const ev of incoming) {
      if (viewerHospitalId && ev.hospitalId === viewerHospitalId) continue;

      try {
        const parsed = JSON.parse(ev.summary) as { type?: string };
        if (parsed.type === "patient_data") continue;
      } catch {
        // texto plano — notificar
      }

      const origin = hospitalName(ev.hospitalId);
      onNotify({
        title: viewerHospitalId ? "Nuevo evento desde otro hospital" : "Nuevo registro en tu historial",
        message: `${origin} agregó ${eventLabel(ev).toLowerCase()} para ${patientLabel}.`,
        verified: true,
      });
    }
  }, [events, loading, onNotify, patientLabel, viewerHospitalId]);
}
