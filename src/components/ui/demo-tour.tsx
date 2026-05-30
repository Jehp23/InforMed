"use client";

import { useCallback, useEffect, useState } from "react";

export type DemoTourStep = {
  target: string;
  title: string;
  body: string;
};

function readCompleted(storageKey: string) {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(storageKey) === "1";
}

function markCompleted(storageKey: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(storageKey, "1");
}

export function DemoTour({
  steps,
  storageKey,
  forceOpen = false,
  onClose,
}: {
  steps: DemoTourStep[];
  storageKey: string;
  forceOpen?: boolean;
  onClose?: () => void;
}) {
  const [stepIndex, setStepIndex] = useState<number | null>(null);
  const [spotlight, setSpotlight] = useState<DOMRect | null>(null);

  const close = useCallback(() => {
    markCompleted(storageKey);
    setStepIndex(null);
    setSpotlight(null);
    onClose?.();
  }, [onClose, storageKey]);

  const updateSpotlight = useCallback(() => {
    if (stepIndex === null) return;
    const step = steps[stepIndex];
    const el = document.querySelector(`[data-tour="${step.target}"]`);
    if (!el) {
      setSpotlight(null);
      return;
    }
    el.scrollIntoView({ block: "center", behavior: "smooth" });
    setSpotlight(el.getBoundingClientRect());
  }, [stepIndex, steps]);

  useEffect(() => {
    if (forceOpen) {
      setStepIndex(0);
      return;
    }
    if (!readCompleted(storageKey)) setStepIndex(0);
  }, [forceOpen, storageKey]);

  useEffect(() => {
    updateSpotlight();
    if (stepIndex === null) return;

    window.addEventListener("resize", updateSpotlight);
    window.addEventListener("scroll", updateSpotlight, true);
    return () => {
      window.removeEventListener("resize", updateSpotlight);
      window.removeEventListener("scroll", updateSpotlight, true);
    };
  }, [stepIndex, updateSpotlight]);

  if (stepIndex === null || steps.length === 0) return null;

  const step = steps[stepIndex];
  const isLast = stepIndex === steps.length - 1;

  const tooltipTop = spotlight
    ? Math.min(spotlight.bottom + 12, window.innerHeight - 180)
    : window.innerHeight / 2 - 80;
  const tooltipLeft = spotlight
    ? Math.min(Math.max(spotlight.left, 16), window.innerWidth - 320)
    : window.innerWidth / 2 - 150;

  return (
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true" aria-labelledby="demo-tour-title">
      <button
        type="button"
        className="absolute inset-0 bg-med-ink/45"
        aria-label="Cerrar guía"
        onClick={close}
      />

      {spotlight && (
        <div
          className="pointer-events-none absolute rounded-xl ring-4 ring-med-secondary ring-offset-2 ring-offset-transparent transition-all duration-200"
          style={{
            top: spotlight.top - 4,
            left: spotlight.left - 4,
            width: spotlight.width + 8,
            height: spotlight.height + 8,
            boxShadow: "0 0 0 9999px rgba(26, 32, 44, 0.45)",
          }}
        />
      )}

      <div
        className="absolute z-[101] w-[min(300px,calc(100vw-2rem))] rounded-2xl border border-med-secondary/30 bg-white p-4 shadow-[var(--med-shadow)]"
        style={{ top: tooltipTop, left: tooltipLeft }}
      >
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-med-secondary">
          Paso {stepIndex + 1} de {steps.length}
        </p>
        <h3 id="demo-tour-title" className="mt-1 font-fraunces text-lg font-semibold text-med-ink">
          {step.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-med-ink-soft">{step.body}</p>
        <div className="mt-4 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={close}
            className="text-xs font-semibold text-med-muted hover:text-med-ink"
          >
            Omitir
          </button>
          <button
            type="button"
            onClick={() => (isLast ? close() : setStepIndex(stepIndex + 1))}
            className="med-btn-primary px-4 py-2 text-sm"
          >
            {isLast ? "Listo" : "Siguiente"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function resetDemoTour(storageKey: string) {
  if (typeof window === "undefined") return;
  localStorage.removeItem(storageKey);
}
