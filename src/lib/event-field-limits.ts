/** Resumen corto del evento (timeline, chips, alergias). */
export const EVENT_SUMMARY_MAX = 120;

/** Detalle opcional (modal, notas largas). */
export const EVENT_DETAIL_MAX = 2000;

export function validateEventSummary(summary: string): string | null {
  const t = summary.trim();
  if (!t) return "El resumen es obligatorio.";
  if (t.length > EVENT_SUMMARY_MAX) {
    return `El resumen no puede superar ${EVENT_SUMMARY_MAX} caracteres. Usá «Detalle» para texto largo.`;
  }
  if (isTestOrSpamSummary(t)) {
    return "El resumen parece texto de prueba. Escribí un dato clínico breve (ej. Penicilina — urticaria).";
  }
  return null;
}

export function validateEventDetail(detail: string | undefined): string | null {
  if (!detail?.trim()) return null;
  if (detail.trim().length > EVENT_DETAIL_MAX) {
    return `El detalle no puede superar ${EVENT_DETAIL_MAX} caracteres.`;
  }
  return null;
}

function compactSummary(summary: string) {
  return summary.trim().replace(/\s+/g, "");
}

/** Texto de prueba (asdasd, teclado, repetición) que no debe mostrarse ni guardarse. */
export function isTestOrSpamSummary(summary: string): boolean {
  const t = summary.trim();
  if (!t || t.startsWith("{")) return false;

  const compact = compactSummary(t);
  if (compact.length < 12) return false;

  if (/^a{8,}$/i.test(compact)) return true;
  if (/^(.)\1{12,}$/i.test(compact)) return true;
  if (/^asdasd+$/i.test(compact)) return true;
  if (/^(asd|qwe|zxc|xxx|abc|test|prueba)+$/i.test(compact)) return true;

  const repeatedChunk = compact.match(/^(.{2,8})\1{4,}$/i);
  if (repeatedChunk && !t.includes(" ")) return true;

  // Teclado sin espacios (asdasd, aaaaa) — no frases clínicas reales
  if (compact.length >= 20 && !t.includes(" ")) {
    const unique = new Set(compact.toLowerCase()).size;
    if (unique / compact.length < 0.35) return true;
  }

  return false;
}

const STRUCTURED_TEXT_KEYS = [
  "description",
  "substance",
  "procedure",
  "reason",
  "diagnosis",
  "observations",
] as const;

function isInvalidStructuredJson(summary: string): boolean {
  try {
    const p = JSON.parse(summary) as Record<string, unknown>;
    if (p.type !== "structured_record") return false;

    let hasValidField = false;
    for (const key of STRUCTURED_TEXT_KEYS) {
      const v = String(p[key] ?? "").trim();
      if (!v) continue;
      if (isTestOrSpamSummary(v) || v.length > EVENT_DETAIL_MAX) return true;
      hasValidField = true;
    }
    return !hasValidField;
  } catch {
    return false;
  }
}

/** Resúmenes spam o de prueba que no deberían quedar on-chain. */
export function isInvalidEventSummary(summary: string): boolean {
  const t = summary.trim();
  if (!t) return false;
  if (t.startsWith("{")) return isInvalidStructuredJson(t);
  if (t.length > EVENT_SUMMARY_MAX) return true;
  return isTestOrSpamSummary(t);
}

/** Etiqueta visible en chips (corta aunque el registro viejo sea largo). */
export function displayLabelFromSummary(summary: string, max = 48): string {
  const t = summary.trim();
  if (!t) return "";
  if (isTestOrSpamSummary(t)) return "";
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trim()}…`;
}
