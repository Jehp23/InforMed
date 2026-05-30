"use client";

import { ValidationBadge } from "./validation-badge";
import { ArkivIdBadge } from "@/components/ui/arkiv-id-badge";
import { eventTypeDisplayLabel } from "@/lib/event-display-labels";
import { parseStructuredRecord } from "@/lib/structured-record";
import { UI_COPY } from "@/lib/ui-copy";
import type { TimelineDisplayRecord, ValidationStatus } from "@/lib/types";

type RecordDetails = Pick<
  TimelineDisplayRecord,
  | "id"
  | "title"
  | "type"
  | "typeLabel"
  | "date"
  | "institution"
  | "doctor"
  | "authorIdentityId"
  | "status"
  | "description"
  | "rawSummary"
>;

export function RecordDetailsModal({
  record,
  onClose,
}: {
  record: RecordDetails;
  onClose: () => void;
}) {
  const structured = record.rawSummary
    ? parseStructuredRecord(record.rawSummary)
    : null;

  const typeLabel =
    record.typeLabel ?? eventTypeDisplayLabel(record.type);
  const professionalName = record.doctor?.trim();
  const authorId = record.authorIdentityId;
  const detailText = record.description?.trim();
  const showDetail = Boolean(detailText) && detailText !== record.title.trim();

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-3 sm:items-center sm:p-6"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0"
        aria-label="Cerrar"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="record-details-title"
        className="relative flex max-h-[min(92vh,840px)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-[var(--med-shadow)]"
      >
        <header className="shrink-0 border-b border-med-line px-5 py-4 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h2
                id="record-details-title"
                className="break-words font-fraunces text-xl font-semibold text-med-ink"
              >
                {record.title}
              </h2>
              <p className="mt-1 text-sm font-medium text-med-secondary">
                {typeLabel}
              </p>
              {record.institution && (
                <p className="mt-0.5 text-sm text-med-muted">{record.institution}</p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-lg p-2 hover:bg-med-primary-2"
              aria-label="Cerrar detalle"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-5 py-4 sm:px-6 sm:py-5">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs text-med-muted">Estado</span>
              <ValidationBadge status={record.status as ValidationStatus} />
            </div>

            <div className="grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <span className="mb-1 block text-xs text-med-muted">Fecha</span>
                <span className="text-med-ink">{record.date}</span>
              </div>
              {(professionalName || authorId) && (
                <div className="min-w-0 sm:col-span-2">
                  <span className="mb-1 block text-xs text-med-muted">
                    Profesional que registró
                  </span>
                  {professionalName ? (
                    <p className="font-medium text-med-ink">{professionalName}</p>
                  ) : (
                    <p className="text-med-muted text-sm">
                      Identidad verificada en Arkiv
                    </p>
                  )}
                  {authorId && (
                    <div className="mt-2">
                      <ArkivIdBadge arkivId={authorId} displayName={professionalName} />
                    </div>
                  )}
                </div>
              )}
            </div>

            {structured && structured.fields.length > 0 ? (
              <div className="min-w-0">
                <span className="mb-1 block text-xs text-med-muted">Detalle</span>
                <dl className="space-y-3 rounded-lg bg-med-primary p-4 text-sm">
                  {structured.fields.map((field) => (
                    <div key={field.key} className="min-w-0">
                      <dt className="text-xs font-semibold text-med-muted">{field.label}</dt>
                      <dd className="mt-0.5 whitespace-pre-wrap break-words text-med-ink-soft [overflow-wrap:anywhere]">
                        {field.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            ) : (
              showDetail && (
                <div className="min-w-0">
                  <span className="mb-1 block text-xs text-med-muted">Detalle</span>
                  <p className="whitespace-pre-wrap break-words rounded-lg bg-med-primary p-4 text-sm leading-relaxed text-med-ink-soft [overflow-wrap:anywhere]">
                    {detailText}
                  </p>
                </div>
              )
            )}

            <div className="inline-flex max-w-full items-center gap-2 rounded-lg bg-med-secondary-soft px-3 py-2 text-sm font-semibold text-med-secondary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className="h-4 w-4 shrink-0" aria-hidden>
                <path d="M20 6 9 17l-5-5" />
              </svg>
              <span className="min-w-0 break-words">{UI_COPY.verifiedRecord}</span>
            </div>
          </div>
        </div>

        <footer className="shrink-0 border-t border-med-line px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-lg bg-med-secondary py-2.5 text-sm font-semibold text-white hover:bg-med-secondary-hover"
          >
            Cerrar
          </button>
        </footer>
      </div>
    </div>
  );
}
