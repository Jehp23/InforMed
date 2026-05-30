import { translateTypeToken } from "./event-display-labels";
import {
  EVENT_SUMMARY_MAX,
  validateEventDetail,
  validateEventSummary,
} from "./event-field-limits";
import type { ClinicalEventRecord } from "./types";

export function trimEventFields(summary: string, detail?: string) {
  return {
    summary: summary.trim(),
    detail: detail?.trim() || undefined,
  };
}

export function validateEventFields(
  summary: string,
  detail?: string,
): string | null {
  return validateEventSummary(summary) ?? validateEventDetail(detail);
}

/** Parte breve del resumen (antes de «—») para título en lista y modal. */
export function clinicalHeadlineFromSummary(summary: string): string {
  const trimmed = summary.trim();
  if (!trimmed || trimmed.startsWith("{")) return trimmed;
  const head = trimmed.split("—")[0]?.trim();
  const candidate = head || trimmed;
  return translateTypeToken(candidate);
}

/** Título corto para timeline y chips. */
export function eventTitleFromRecord(ev: ClinicalEventRecord): string {
  const { summary, detail } = ev;
  if (summary.startsWith("{")) return summary;
  const headline = clinicalHeadlineFromSummary(summary);
  if (detail?.trim() || summary.includes("—")) return headline;
  if (summary.length <= EVENT_SUMMARY_MAX) return headline;
  return summary.length > 80 ? `${summary.slice(0, 80)}…` : headline;
}

/** Texto para la sección Detalle del modal (no repetir en el título). */
export function eventDetailFromRecord(ev: ClinicalEventRecord): string | undefined {
  if (ev.detail?.trim()) return ev.detail.trim();
  if (ev.summary.startsWith("{")) return undefined;

  const summary = ev.summary.trim();
  const headline = clinicalHeadlineFromSummary(summary);

  if (summary.includes("—") && summary !== headline) return summary;
  if (summary.length > EVENT_SUMMARY_MAX) return summary;
  return undefined;
}

/** Primera parte del resumen (antes de «—») para banner y chips. */
export function shortClinicalHeadline(reason: string, max = 36): string {
  const head = reason.split("—")[0]?.trim() || reason.trim();
  if (!head) return "Atención";
  if (head.length <= max) return head;
  return `${head.slice(0, max - 1).trim()}…`;
}

export function eventDetailForModal(
  summary: string,
  structuredDescription?: string,
  detail?: string,
): string | undefined {
  if (detail?.trim()) return detail.trim();
  if (structuredDescription?.trim()) return structuredDescription;
  if (!summary.startsWith("{") && summary.trim().length > EVENT_SUMMARY_MAX) {
    return summary.trim();
  }
  return undefined;
}
