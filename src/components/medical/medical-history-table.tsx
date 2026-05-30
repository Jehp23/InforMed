"use client";

import { useState } from "react";
import { dotClassForEventType } from "@/lib/event-type-colors";

import type { TimelineRecord } from "./medical-timeline";

const PAGE_SIZE = 8;

export function MedicalHistoryTable({
  records,
  onViewDetails,
}: {
  records: TimelineRecord[];
  onViewDetails?: (id: string) => void;
}) {
  const [visible, setVisible] = useState(PAGE_SIZE);
  const shown = records.slice(0, visible);
  const hasMore = visible < records.length;

  if (records.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-xl border border-med-line">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-med-line bg-med-primary-2 text-[11px] font-semibold uppercase tracking-wide text-med-muted">
              <th className="w-[88px] px-3 py-2.5">Fecha</th>
              <th className="px-3 py-2.5">Evento</th>
              <th className="hidden px-3 py-2.5 sm:table-cell">Hospital</th>
              <th className="w-10 px-2 py-2.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-med-line bg-white">
            {shown.map((record) => (
              <tr
                key={record.id}
                className="group transition hover:bg-med-primary/50"
              >
                <td className="whitespace-nowrap px-3 py-2.5 text-xs font-medium text-med-ink-soft">
                  {record.date}
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex items-start gap-2">
                    <span
                      className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${dotClassForEventType(record.type)}`}
                      aria-hidden
                    />
                    <div className="min-w-0">
                      <p className="line-clamp-2 font-medium text-med-ink">{record.title}</p>
                      <p className="mt-0.5 text-[11px] capitalize text-med-muted sm:hidden">
                        {record.institution}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="hidden px-3 py-2.5 text-xs text-med-muted sm:table-cell">
                  {record.institution ?? "—"}
                </td>
                <td className="px-2 py-2.5 text-center">
                  {onViewDetails && (
                    <button
                      type="button"
                      onClick={() => onViewDetails(record.id)}
                      className="rounded-lg p-1.5 text-med-muted opacity-60 transition hover:bg-med-secondary-soft hover:text-med-secondary group-hover:opacity-100"
                      title="Ver detalle"
                    >
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {hasMore && (
        <button
          type="button"
          onClick={() => setVisible((v) => v + PAGE_SIZE)}
          className="w-full rounded-lg border border-med-line bg-white py-2 text-sm font-medium text-med-secondary hover:bg-med-primary-2"
        >
          Ver más ({records.length - visible} restantes)
        </button>
      )}

      {visible > PAGE_SIZE && (
        <button
          type="button"
          onClick={() => setVisible(PAGE_SIZE)}
          className="w-full text-center text-xs font-medium text-med-muted hover:text-med-secondary"
        >
          Mostrar menos
        </button>
      )}
    </div>
  );
}
