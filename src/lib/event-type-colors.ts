import { EVENT_TYPE_LABELS } from "@/lib/constants";
import type { EventType } from "@/lib/types";

export type EventTypeStyle = {
  label: string;
  dot: string;
  chip: string;
  sectionAccent: string;
  sectionBorder: string;
  sectionBg: string;
};

/** Paleta única — timeline, tabla e MediBot usan los mismos colores. */
export const EVENT_TYPE_STYLE: Record<EventType, EventTypeStyle> = {
  allergy: {
    label: EVENT_TYPE_LABELS.allergy,
    dot: "bg-med-coral",
    chip: "bg-[rgba(224,101,76,.14)] text-med-coral hover:bg-[rgba(224,101,76,.22)]",
    sectionAccent: "text-med-coral",
    sectionBorder: "border-med-coral/40",
    sectionBg: "bg-[rgba(224,101,76,.05)]",
  },
  admission: {
    label: EVENT_TYPE_LABELS.admission,
    dot: "bg-med-amber",
    chip: "bg-med-amber/20 text-[#8a6420] hover:bg-med-amber/30",
    sectionAccent: "text-[#8a6420]",
    sectionBorder: "border-med-amber/45",
    sectionBg: "bg-med-amber/10",
  },
  discharge: {
    label: EVENT_TYPE_LABELS.discharge,
    dot: "bg-med-muted",
    chip: "bg-med-muted/15 text-med-ink-soft hover:bg-med-muted/25",
    sectionAccent: "text-med-muted",
    sectionBorder: "border-med-line",
    sectionBg: "bg-white/70",
  },
  lab: {
    label: EVENT_TYPE_LABELS.lab,
    dot: "bg-sky-500",
    chip: "bg-sky-500/12 text-sky-800 hover:bg-sky-500/20",
    sectionAccent: "text-sky-800",
    sectionBorder: "border-sky-500/30",
    sectionBg: "bg-sky-500/5",
  },
  note: {
    label: EVENT_TYPE_LABELS.note,
    dot: "bg-med-secondary",
    chip: "bg-med-secondary/12 text-med-secondary hover:bg-med-secondary/20",
    sectionAccent: "text-med-secondary",
    sectionBorder: "border-med-secondary/30",
    sectionBg: "bg-med-secondary-soft/35",
  },
};

export const EVENT_TYPE_LEGEND_ORDER: EventType[] = [
  "allergy",
  "admission",
  "discharge",
  "lab",
  "note",
];

export function eventTypeStyle(type: EventType | string): EventTypeStyle {
  if (type in EVENT_TYPE_STYLE) {
    return EVENT_TYPE_STYLE[type as EventType];
  }
  return EVENT_TYPE_STYLE.note;
}

export function chipClassForEventType(type: EventType): string {
  return eventTypeStyle(type).chip;
}

export function dotClassForEventType(type: EventType | string): string {
  return eventTypeStyle(type).dot;
}
