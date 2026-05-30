"use client";

import { useEffect } from "react";

import { formatFriendlyArkivId } from "@/lib/arkiv-id-display";
import { UI_COPY } from "@/lib/ui-copy";

export type WelcomeNotice = {
  isNewIdentity: boolean;
  displayName: string;
  arkivId: string;
};

export function SessionWelcomeBanner({
  notice,
  onDismiss,
  autoDismissMs = 5000,
}: {
  notice: WelcomeNotice;
  onDismiss: () => void;
  autoDismissMs?: number;
}) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, autoDismissMs);
    return () => clearTimeout(timer);
  }, [onDismiss, autoDismissMs]);

  const isNew = notice.isNewIdentity;
  const friendlyId = formatFriendlyArkivId(notice.arkivId);

  return (
    <div
      role="status"
      aria-live="polite"
      className={`mb-4 flex flex-wrap items-start justify-between gap-3 rounded-xl border px-4 py-3.5 ${
        isNew
          ? "border-med-secondary/35 bg-gradient-to-r from-med-secondary-soft/80 to-white"
          : "border-med-line bg-white"
      }`}
    >
      <div className="min-w-0 flex-1">
        {isNew ? (
          <>
            <p className="text-sm font-semibold text-med-ink">{UI_COPY.arkivIdReady}</p>
            <p className="mt-0.5 text-sm text-med-ink-soft">{UI_COPY.arkivIdAuto}</p>
            <p className="mt-2 text-xs font-semibold text-med-secondary">
              Arkiv ID · {friendlyId}
            </p>
          </>
        ) : (
          <>
            <p className="text-sm font-semibold text-med-ink">
              Bienvenido de nuevo, {notice.displayName}
            </p>
            <p className="mt-0.5 text-sm text-med-ink-soft">
              Tu historial se actualiza automáticamente al ingresar.
            </p>
            <p className="mt-2 text-xs font-semibold text-med-secondary">
              Arkiv ID · {friendlyId}
            </p>
          </>
        )}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="shrink-0 rounded-lg px-2 py-1 text-xs font-medium text-med-muted transition hover:bg-med-primary hover:text-med-ink"
        aria-label="Cerrar aviso"
      >
        Cerrar
      </button>
    </div>
  );
}
