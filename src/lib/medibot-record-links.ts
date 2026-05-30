import { normalizeAllergySubstance } from "@/lib/derive-patient-summary";
import { isTimelineEvent } from "@/lib/timeline-utils";
import { EVENT_TYPE_LABELS, HOSPITALS } from "@/lib/constants";
import type { ClinicalEventRecord, EventType } from "@/lib/types";

export type RecordLinkPhrase = {
  phrase: string;
  recordId: string;
  label: string;
  shortLabel: string;
  eventType: EventType;
  meta?: string;
};

const MAX_LINK_PHRASE_LEN = 48;
const MIN_LINK_PHRASE_LEN = 5;

/** Texto enlazable en el chat (evita frases demasiado largas). */
function linkPhraseForSummary(plain: string): string {
  const head = plain.split("—")[0]?.trim() || plain;
  if (head.length >= MIN_LINK_PHRASE_LEN && head.length <= MAX_LINK_PHRASE_LEN) return head;
  if (plain.length <= MAX_LINK_PHRASE_LEN) return plain;
  return `${plain.slice(0, MAX_LINK_PHRASE_LEN - 1).trim()}…`;
}

function pushPhrase(
  bucket: RecordLinkPhrase[],
  seen: Set<string>,
  phrase: string,
  recordId: string,
  label: string,
  shortLabel: string,
  eventType: EventType,
  meta?: string,
) {
  const trimmed = phrase.trim();
  if (trimmed.length < MIN_LINK_PHRASE_LEN || trimmed.length > MAX_LINK_PHRASE_LEN) return;
  const global = trimmed.toLowerCase();
  if (seen.has(global)) return;
  seen.add(global);
  bucket.push({ phrase: trimmed, recordId, label, shortLabel, eventType, meta });
}

function hospitalName(id: string) {
  return HOSPITALS.find((h) => h.id === id)?.name ?? id;
}

function shortLabelForEvent(eventType: EventType): string {
  return EVENT_TYPE_LABELS[eventType] ?? eventType;
}

/** Frases cortas para enlazar registros en el chat (con color por eventType). */
export function collectRecordLinkPhrases(events: ClinicalEventRecord[]): RecordLinkPhrase[] {
  const out: RecordLinkPhrase[] = [];
  const seen = new Set<string>();

  for (const ev of events) {
    if (!isTimelineEvent(ev)) continue;

    const plain = ev.summary?.trim();
    if (!plain || plain.startsWith("{")) continue;

    if (ev.eventType === "allergy") {
      const substance = normalizeAllergySubstance(plain);
      pushPhrase(out, seen, substance, ev.entityKey, plain, substance, "allergy");
      continue;
    }

    if (ev.eventType === "admission" || ev.eventType === "discharge") {
      const dateStr = new Date(ev.timestamp).toLocaleDateString("es-AR");
      const hosp = hospitalName(ev.hospitalId);
      const meta = `${dateStr} · ${hosp}`;
      const shortLabel = shortLabelForEvent(ev.eventType);
      out.push({
        phrase: dateStr,
        recordId: ev.entityKey,
        label: plain,
        shortLabel,
        eventType: ev.eventType,
        meta,
      });
      pushPhrase(out, seen, hosp, ev.entityKey, plain, shortLabel, ev.eventType, meta);
      continue;
    }

    const typeLabel = shortLabelForEvent(ev.eventType);
    const linkText = linkPhraseForSummary(plain);
    pushPhrase(out, seen, linkText, ev.entityKey, plain, typeLabel, ev.eventType);
  }

  return out.sort((a, b) => b.phrase.length - a.phrase.length);
}

export function uniqueRecordLinksById(
  phrases: RecordLinkPhrase[],
  eventType: EventType,
): RecordLinkPhrase[] {
  const seen = new Set<string>();
  return phrases.filter((p) => {
    if (p.eventType !== eventType) return false;
    if (seen.has(p.recordId)) return false;
    seen.add(p.recordId);
    return true;
  });
}

export function uniqueRecordLinksByTypes(
  phrases: RecordLinkPhrase[],
  types: EventType[],
): RecordLinkPhrase[] {
  const set = new Set(types);
  const seen = new Set<string>();
  return phrases.filter((p) => {
    if (!set.has(p.eventType)) return false;
    if (seen.has(p.recordId)) return false;
    seen.add(p.recordId);
    return true;
  });
}

export type TextSegment =
  | { type: "text"; value: string }
  | {
      type: "link";
      value: string;
      recordId: string;
      label: string;
      shortLabel: string;
      eventType: EventType;
    };

export function splitTextByRecordPhrases(
  text: string,
  phrases: RecordLinkPhrase[],
): TextSegment[] {
  if (!text || phrases.length === 0) return [{ type: "text", value: text }];

  const lower = text.toLowerCase();
  let best: {
    index: number;
    len: number;
    recordId: string;
    label: string;
    shortLabel: string;
    eventType: EventType;
  } | null = null;

  for (const { phrase, recordId, label, shortLabel, eventType } of phrases) {
    const pl = phrase.toLowerCase();
    const idx = lower.indexOf(pl);
    if (idx === -1) continue;
    if (!best || idx < best.index || (idx === best.index && pl.length > best.len)) {
      best = { index: idx, len: pl.length, recordId, label, shortLabel, eventType };
    }
  }

  if (!best) return [{ type: "text", value: text }];

  const before = text.slice(0, best.index);
  const match = text.slice(best.index, best.index + best.len);
  const after = text.slice(best.index + best.len);

  const linkSegment: TextSegment = {
    type: "link",
    value: match,
    recordId: best.recordId,
    label: best.label,
    shortLabel: best.shortLabel,
    eventType: best.eventType,
  };

  return [
    ...splitTextByRecordPhrases(before, phrases),
    linkSegment,
    ...splitTextByRecordPhrases(after, phrases),
  ].filter((s) => s.value.length > 0);
}
