"use client";

import { formatFriendlyArkivId } from "@/lib/arkiv-id-display";

/**
 * Arkiv ID visible pero amigable: código corto + nombre, sin direcciones 0x.
 * La identidad real se crea/recupera automáticamente al ingresar con correo.
 */
export function ArkivIdBadge({
  arkivId,
  displayName,
  isNew,
  compact = true,
}: {
  arkivId: string;
  displayName?: string;
  isNew?: boolean;
  compact?: boolean;
}) {
  const friendlyId = formatFriendlyArkivId(arkivId);

  if (compact) {
    return (
      <div
        className="inline-flex max-w-[200px] shrink-0 items-center gap-1.5 rounded-full border border-med-secondary/25 bg-med-secondary-soft px-2.5 py-1"
        title={
          displayName
            ? `Arkiv ID ${friendlyId} · ${displayName}`
            : `Arkiv ID ${friendlyId}`
        }
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-3 w-3 shrink-0 text-med-secondary"
          aria-hidden
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
        <span className="truncate text-[11px] font-semibold text-med-secondary">
          <span className="text-med-muted">Arkiv ID</span> · {friendlyId}
        </span>
        {isNew && (
          <span className="shrink-0 rounded-full bg-med-secondary px-1.5 py-0.5 text-[8px] font-bold uppercase text-white">
            Nuevo
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-med-secondary/20 bg-gradient-to-br from-white to-med-secondary-soft/40 p-4 shadow-[var(--med-shadow-soft)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-med-secondary">
            Arkiv ID
          </p>
          {displayName && (
            <p className="mt-0.5 truncate text-sm font-semibold text-med-ink">{displayName}</p>
          )}
          <p className="mt-1 text-sm font-semibold tracking-wide text-med-secondary">
            {friendlyId}
          </p>
        </div>
        {isNew && (
          <span className="shrink-0 rounded-full bg-med-secondary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
            Emitido
          </span>
        )}
      </div>
      <p className="mt-2 text-xs text-med-muted">
        Identidad creada automáticamente con tu correo. Los registros clínicos quedan vinculados a
        este ID.
      </p>
    </div>
  );
}
