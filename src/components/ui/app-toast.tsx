"use client";

import { useEffect } from "react";

import { ArkivVerifyLinks } from "@/components/ui/arkiv-verify-links";
import { UI_COPY } from "@/lib/ui-copy";

export type ToastPayload = {
  title: string;
  message?: string;
  /** Muestra sello de verificación */
  verified?: boolean;
  /** Enlaces al explorer tras publicar en Arkiv */
  verify?: { entityKey: string; txHash?: string };
};

export function AppToast({
  toast,
  onDismiss,
}: {
  toast: ToastPayload | null;
  onDismiss: () => void;
}) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onDismiss, toast.verify ? 14_000 : 9000);
    return () => clearTimeout(t);
  }, [toast, onDismiss]);

  if (!toast) return null;

  return (
    <div
      className="fixed bottom-5 right-5 z-50 max-w-[min(100vw-2rem,22rem)] animate-[fadeIn_0.2s_ease-out] rounded-2xl border border-med-secondary/30 bg-white p-4 shadow-[var(--med-shadow)]"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-med-ink">{toast.title}</p>
          {toast.message && (
            <p className="mt-1 text-xs text-med-muted">{toast.message}</p>
          )}
          {toast.verify ? (
            <div className="mt-3 space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-med-muted">
                {UI_COPY.verifyOnArkiv}
              </p>
              <ArkivVerifyLinks
                entityKey={toast.verify.entityKey}
                txHash={toast.verify.txHash}
                layout="stack"
              />
            </div>
          ) : (
            toast.verified && (
              <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-med-secondary">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  className="h-3.5 w-3.5"
                  aria-hidden
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                {UI_COPY.verifiedRecord}
              </p>
            )
          )}
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 text-med-muted hover:text-med-ink"
          aria-label="Cerrar"
        >
          ×
        </button>
      </div>
    </div>
  );
}
