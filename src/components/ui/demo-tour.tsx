"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

export type DemoTourStep = {
  target: string;
  title: string;
  body: string;
};

const VIEWPORT_PAD = 16;
const TOOLTIP_GAP = 12;
const MOBILE_MAX = 639;

function readCompleted(storageKey: string) {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(storageKey) === "1";
}

function markCompleted(storageKey: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(storageKey, "1");
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function computeTooltipPosition(
  rect: DOMRect | null,
  size: { width: number; height: number },
): { top: number; left: number } | null {
  if (typeof window === "undefined") return null;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const maxW = Math.min(320, vw - VIEWPORT_PAD * 2);
  const w = Math.min(size.width, maxW);
  const h = size.height;

  if (!rect) {
    return {
      top: clamp((vh - h) / 2, VIEWPORT_PAD, vh - h - VIEWPORT_PAD),
      left: clamp((vw - w) / 2, VIEWPORT_PAD, vw - w - VIEWPORT_PAD),
    };
  }

  let top = rect.bottom + TOOLTIP_GAP;
  if (top + h > vh - VIEWPORT_PAD) {
    top = rect.top - TOOLTIP_GAP - h;
  }
  if (top < VIEWPORT_PAD) {
    top = clamp((vh - h) / 2, VIEWPORT_PAD, vh - h - VIEWPORT_PAD);
  }

  let left = rect.left + rect.width / 2 - w / 2;
  left = clamp(left, VIEWPORT_PAD, vw - w - VIEWPORT_PAD);

  return { top, left };
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
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number } | null>(null);
  const [useMobileDock, setUseMobileDock] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    markCompleted(storageKey);
    setStepIndex(null);
    setSpotlight(null);
    setTooltipPos(null);
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
    el.scrollIntoView({ block: "nearest", behavior: "smooth", inline: "nearest" });
    requestAnimationFrame(() => {
      setSpotlight(el.getBoundingClientRect());
    });
  }, [stepIndex, steps]);

  const repositionTooltip = useCallback(() => {
    const node = tooltipRef.current;
    if (!node || stepIndex === null) return;

    const mobile = window.innerWidth <= MOBILE_MAX;
    setUseMobileDock(mobile);
    if (mobile) {
      setTooltipPos(null);
      return;
    }

    const size = node.getBoundingClientRect();
    setTooltipPos(computeTooltipPosition(spotlight, size));
  }, [spotlight, stepIndex]);

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

    const onLayout = () => {
      updateSpotlight();
      repositionTooltip();
    };

    window.addEventListener("resize", onLayout);
    window.addEventListener("scroll", onLayout, true);
    return () => {
      window.removeEventListener("resize", onLayout);
      window.removeEventListener("scroll", onLayout, true);
    };
  }, [stepIndex, updateSpotlight, repositionTooltip]);

  useLayoutEffect(() => {
    repositionTooltip();
  }, [stepIndex, spotlight, repositionTooltip, steps]);

  if (stepIndex === null || steps.length === 0) return null;

  const step = steps[stepIndex];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === steps.length - 1;

  const goNext = () => (isLast ? close() : setStepIndex(stepIndex + 1));
  const goBack = () => {
    if (!isFirst) setStepIndex(stepIndex - 1);
  };

  const tooltipStyle =
    !useMobileDock && tooltipPos
      ? { top: tooltipPos.top, left: tooltipPos.left }
      : undefined;

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
        ref={tooltipRef}
        className={`z-[101] w-[min(320px,calc(100vw-2rem))] max-h-[min(70vh,420px)] overflow-y-auto rounded-2xl border border-med-secondary/30 bg-white p-4 shadow-[var(--med-shadow)] ${
          useMobileDock
            ? "fixed bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6"
            : "absolute"
        }`}
        style={tooltipStyle}
      >
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-med-secondary">
          Paso {stepIndex + 1} de {steps.length}
        </p>
        <h3 id="demo-tour-title" className="mt-1 font-fraunces text-lg font-semibold text-med-ink">
          {step.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-med-ink-soft">{step.body}</p>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={close}
            className="text-xs font-semibold text-med-muted hover:text-med-ink"
          >
            Omitir
          </button>
          <div className="flex flex-wrap items-center gap-2">
            {!isFirst && (
              <button
                type="button"
                onClick={goBack}
                className="rounded-lg border border-med-line px-4 py-2 text-sm font-semibold text-med-ink hover:bg-med-primary-2"
              >
                Anterior
              </button>
            )}
            <button type="button" onClick={goNext} className="med-btn-primary px-4 py-2 text-sm">
              {isLast ? "Listo" : "Siguiente"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function resetDemoTour(storageKey: string) {
  if (typeof window === "undefined") return;
  localStorage.removeItem(storageKey);
}
