"use client";

import { UI_COPY } from "@/lib/ui-copy";

export function PatientLoadingOverlay({
  label,
  sublabel = UI_COPY.loadingHistory,
}: {
  label: string;
  sublabel?: string;
}) {
  return (
    <div
      className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-white/75 backdrop-blur-[2px]"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="mx-4 max-w-sm rounded-2xl border border-med-line bg-white px-6 py-5 text-center shadow-[var(--med-shadow-soft)]">
        <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-med-secondary/25 border-t-med-secondary" />
        <p className="text-sm font-semibold text-med-ink">{label}</p>
        <p className="mt-1 text-xs text-med-muted">{sublabel}</p>
      </div>
    </div>
  );
}
