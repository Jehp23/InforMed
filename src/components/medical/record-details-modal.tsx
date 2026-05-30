"use client";

import { ValidationBadge } from "./validation-badge";
import { UI_COPY } from "@/lib/ui-copy";

export function RecordDetailsModal({
  record,
  onClose,
}: {
  record: {
    id: string;
    title: string;
    type: string;
    date: string;
    institution?: string;
    doctor?: string;
    status: "declared" | "document_attached" | "ai_extracted" | "pending_review" | "verified" | "institution_issued" | "corrected" | "discarded";
    description?: string;
  };
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-[var(--med-shadow)]">
        <div className="p-6">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h2 className="font-fraunces text-xl font-semibold text-med-ink">{record.title}</h2>
              <p className="mt-1 text-sm capitalize text-med-muted">{record.type.replace(/_/g, " ")}</p>
            </div>
            <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-med-primary-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-med-muted">Estado</span>
              <ValidationBadge status={record.status} />
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="mb-1 block text-xs text-med-muted">Fecha</span>
                <span className="text-med-ink">{record.date}</span>
              </div>
              {record.institution && (
                <div>
                  <span className="mb-1 block text-xs text-med-muted">Institución</span>
                  <span className="text-med-ink">{record.institution}</span>
                </div>
              )}
            </div>

            {record.description && (
              <div>
                <span className="mb-1 block text-xs text-med-muted">Detalle</span>
                <p className="whitespace-pre-wrap rounded-lg bg-med-primary p-3 text-sm text-med-ink-soft">
                  {record.description}
                </p>
              </div>
            )}

            <div className="inline-flex items-center gap-2 rounded-lg bg-med-secondary-soft px-3 py-2 text-sm font-semibold text-med-secondary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className="h-4 w-4" aria-hidden>
                <path d="M20 6 9 17l-5-5" />
              </svg>
              {UI_COPY.verifiedRecord}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="mt-6 w-full rounded-lg bg-med-secondary py-2.5 text-sm font-semibold text-white hover:bg-med-secondary-hover"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
