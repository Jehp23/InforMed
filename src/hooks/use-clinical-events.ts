"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { fetchJson } from "@/lib/api-client";
import type { ClinicalEventRecord } from "@/lib/types";

const POLL_MS = 60_000;

export function useClinicalEvents(patientId: string) {
  const [events, setEvents] = useState<ClinicalEventRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadSeq = useRef(0);
  const patientIdRef = useRef(patientId);

  const load = useCallback(
    async (pid: string, opts?: { silent?: boolean }) => {
      const seq = ++loadSeq.current;
      const silent = opts?.silent ?? false;

      if (!silent) {
        setLoading(true);
        setRefreshing(false);
        setError(null);
      } else {
        setRefreshing(true);
      }

      try {
        const { ok, data, error: apiError } = await fetchJson<{
          events?: ClinicalEventRecord[];
          error?: string;
        }>(`/api/events?patientId=${encodeURIComponent(pid)}`);

        if (seq !== loadSeq.current) return null;

        if (!ok || !data) {
          throw new Error(apiError ?? data?.error ?? "Error al cargar eventos");
        }

        const nextEvents = data.events ?? [];
        setEvents(nextEvents);
        setError(null);

        const patientDataEvent = nextEvents.find((ev) => {
          try {
            return (JSON.parse(ev.summary) as { type?: string }).type === "patient_data";
          } catch {
            return false;
          }
        });

        return { events: nextEvents, patientDataEvent };
      } catch (e) {
        if (seq !== loadSeq.current) return null;
        const message = e instanceof Error ? e.message : "Error desconocido";
        setError(message);
        return null;
      } finally {
        if (seq === loadSeq.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [],
  );

  useEffect(() => {
    patientIdRef.current = patientId;
    setEvents([]);
    setLoading(true);
    setRefreshing(false);
    setError(null);
    loadSeq.current += 1;

    void load(patientId);

    const interval = setInterval(
      () => void load(patientId, { silent: true }),
      POLL_MS,
    );

    return () => {
      loadSeq.current += 1;
      clearInterval(interval);
    };
  }, [patientId, load]);

  const reload = useCallback(
    (pid: string = patientId) => {
      const silent = events.length > 0 && pid === patientIdRef.current;
      void load(pid, { silent });
    },
    [load, patientId, events.length],
  );

  return { events, setEvents, loading, refreshing, error, reload };
};
