"use client";

import { useEffect } from "react";

export function MedOverlay({
  open,
  onClose,
  title,
  subtitle,
  children,
  variant = "modal",
  wide = false,
  ariaLabel,
  headerAction,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  variant?: "modal" | "drawer";
  wide?: boolean;
  ariaLabel?: string;
  headerAction?: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const drawerWidth = wide
    ? "max-w-[min(42rem,calc(100vw-1.5rem))]"
    : "max-w-[min(24rem,calc(100vw-1.5rem))]";

  if (variant === "drawer") {
    return (
      <div className="fixed inset-0 z-50 flex" role="presentation">
        <button
          type="button"
          className="absolute inset-0 bg-med-ink/25 backdrop-blur-[2px]"
          aria-label="Cerrar"
          onClick={onClose}
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-label={ariaLabel ?? title ?? "Panel"}
          className={`relative ml-auto flex h-full w-full flex-col border-l border-med-line bg-white shadow-[var(--med-shadow)] ${drawerWidth}`}
        >
          {(title || subtitle) && (
            <header className="flex shrink-0 items-start justify-between gap-3 border-b border-med-line px-5 py-4">
              <div>
                {title && (
                  <h2 className="font-display text-lg font-semibold text-med-ink">{title}</h2>
                )}
                {subtitle && <p className="mt-0.5 text-sm text-med-muted">{subtitle}</p>}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {headerAction}
                <CloseButton onClose={onClose} />
              </div>
            </header>
          )}
          <div className="flex min-h-0 flex-1 flex-col">{children}</div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center sm:p-6"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-med-ink/30 backdrop-blur-[2px]"
        aria-label="Cerrar"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel ?? title ?? "Ventana"}
        className={`relative flex max-h-[min(90vh,720px)] w-full flex-col overflow-hidden rounded-2xl border border-med-line bg-white shadow-[var(--med-shadow)] ${
          wide ? "max-w-2xl" : "max-w-lg"
        }`}
      >
        {(title || subtitle) && (
          <header className="flex shrink-0 items-start justify-between gap-3 border-b border-med-line px-5 py-4">
            <div>
              {title && (
                <h2 className="font-display text-lg font-semibold text-med-ink">{title}</h2>
              )}
              {subtitle && <p className="mt-0.5 text-sm text-med-muted">{subtitle}</p>}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {headerAction}
              <CloseButton onClose={onClose} />
            </div>
          </header>
        )}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 scrollbar-thin">{children}</div>
      </div>
    </div>
  );
}

function CloseButton({ onClose }: { onClose: () => void }) {
  return (
    <button
      type="button"
      onClick={onClose}
      className="flex size-9 shrink-0 items-center justify-center rounded-full border border-med-line text-med-muted transition hover:bg-med-primary-2 hover:text-med-ink"
      aria-label="Cerrar ventana"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </button>
  );
}
