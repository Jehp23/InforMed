"use client";

import { Fragment } from "react";

import { EventTypeLegend } from "@/components/doctor/event-type-legend";
import {
  EVENT_TYPE_STYLE,
  eventTypeStyle,
} from "@/lib/event-type-colors";
import {
  type RecordLinkPhrase,
  uniqueRecordLinksById,
  uniqueRecordLinksByTypes,
} from "@/lib/medibot-record-links";
import type { EventType } from "@/lib/types";

function stripMarkdownNoise(line: string): string {
  return line
    .replace(/^#{1,6}\s+/, "")
    .replace(/^>\s*/, "")
    .replace(/^[\*\-•]\s+/, "")
    .replace(/^\*\*([^*]+)\*\*:?\s*/, "")
    .trim();
}

function renderBoldParts(text: string, keyPrefix: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  if (parts.length <= 1 && !text.includes("**")) {
    return text.replace(/\*\*/g, "");
  }

  return parts.map((part, i) => {
    const bold = part.match(/^\*\*([^*]+)\*\*$/);
    if (bold) {
      return (
        <strong key={`${keyPrefix}-b-${i}`} className="font-semibold text-med-ink">
          {bold[1]}
        </strong>
      );
    }
    return <Fragment key={`${keyPrefix}-t-${i}`}>{part}</Fragment>;
  });
}

function RecordLinkChip({
  shortLabel,
  label,
  recordId,
  eventType,
  onOpenRecord,
}: {
  shortLabel: string;
  label: string;
  recordId: string;
  eventType: EventType;
  onOpenRecord: (recordId: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpenRecord(recordId)}
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold transition ${eventTypeStyle(eventType).chip}`}
      title={label}
    >
      {shortLabel}
    </button>
  );
}

function AllergySectionRows({
  recordPhrases,
  onOpenRecord,
}: {
  recordPhrases: RecordLinkPhrase[];
  onOpenRecord: (recordId: string) => void;
}) {
  const items = uniqueRecordLinksById(recordPhrases, "allergy");
  if (items.length === 0) {
    return <p className="text-sm text-med-muted">Sin alergias en el historial verificado.</p>;
  }
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((p) => (
        <RecordLinkChip
          key={p.recordId}
          shortLabel={p.shortLabel}
          label={p.label}
          recordId={p.recordId}
          eventType={p.eventType}
          onOpenRecord={onOpenRecord}
        />
      ))}
    </div>
  );
}

function HospitalizationSectionRows({
  recordPhrases,
  onOpenRecord,
}: {
  recordPhrases: RecordLinkPhrase[];
  onOpenRecord: (recordId: string) => void;
}) {
  const items = uniqueRecordLinksByTypes(recordPhrases, ["admission", "discharge"]);
  if (items.length === 0) {
    return <p className="text-sm text-med-muted">Sin internaciones registradas.</p>;
  }
  return (
    <div className="space-y-2">
      {items.map((p) => {
        const theme = eventTypeStyle(p.eventType);
        return (
          <button
            key={p.recordId}
            type="button"
            onClick={() => onOpenRecord(p.recordId)}
            className={`flex w-full flex-wrap items-center gap-2 rounded-xl border px-3 py-2.5 text-left transition hover:shadow-sm ${theme.sectionBorder} ${theme.sectionBg} hover:opacity-95`}
            title={p.label}
          >
            <span
              className={`inline-flex shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${theme.chip}`}
            >
              {p.shortLabel}
            </span>
            {p.meta && <span className="text-sm text-med-ink-soft">{p.meta}</span>}
          </button>
        );
      })}
    </div>
  );
}

function MedicationSectionRows({
  recordPhrases,
  onOpenRecord,
}: {
  recordPhrases: RecordLinkPhrase[];
  onOpenRecord: (recordId: string) => void;
}) {
  const items = uniqueRecordLinksById(recordPhrases, "note").filter((p) =>
    /medic|losart|habitual|fármaco|farmaco/i.test(p.label),
  );
  if (items.length === 0) {
    return <p className="text-sm text-med-muted">Sin medicación registrada en el historial.</p>;
  }
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((p) => (
        <RecordLinkChip
          key={p.recordId}
          shortLabel="Medicación"
          label={p.label}
          recordId={p.recordId}
          eventType="note"
          onOpenRecord={onOpenRecord}
        />
      ))}
    </div>
  );
}

function NoteSectionRows({
  recordPhrases,
  onOpenRecord,
}: {
  recordPhrases: RecordLinkPhrase[];
  onOpenRecord: (recordId: string) => void;
}) {
  const items = uniqueRecordLinksById(recordPhrases, "note").filter(
    (p) => !/medic|losart|habitual|fármaco|farmaco/i.test(p.label),
  );
  if (items.length === 0) {
    return <p className="text-sm text-med-muted">Sin notas administrativas.</p>;
  }
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((p) => (
        <RecordLinkChip
          key={p.recordId}
          shortLabel={p.shortLabel}
          label={p.label}
          recordId={p.recordId}
          eventType="note"
          onOpenRecord={onOpenRecord}
        />
      ))}
    </div>
  );
}

function LabSectionRows({
  recordPhrases,
  onOpenRecord,
}: {
  recordPhrases: RecordLinkPhrase[];
  onOpenRecord: (recordId: string) => void;
}) {
  const items = uniqueRecordLinksById(recordPhrases, "lab");
  if (items.length === 0) {
    return <p className="text-sm text-med-muted">Sin estudios de laboratorio.</p>;
  }
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((p) => (
        <RecordLinkChip
          key={p.recordId}
          shortLabel={p.shortLabel}
          label={p.label}
          recordId={p.recordId}
          eventType="lab"
          onOpenRecord={onOpenRecord}
        />
      ))}
    </div>
  );
}

function PlainSectionLines({ lines }: { lines: string[] }) {
  const text = lines.map(stripMarkdownNoise).filter(Boolean).join(" ");
  if (!text) return null;
  return <p className="text-sm leading-relaxed text-med-ink-soft">{renderBoldParts(text, "plain")}</p>;
}

type SectionRenderKind =
  | "allergy"
  | "hospitalization"
  | "lab"
  | "medication"
  | "note"
  | "plain";

function normalizeSectionLabel(label: string) {
  return label
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

function sectionRenderKind(label: string): SectionRenderKind {
  const l = normalizeSectionLabel(label);
  if (l.includes("alergia")) return "allergy";
  if (l.includes("internacion") || l.includes("ingreso") || l.includes("hospitaliz")) {
    return "hospitalization";
  }
  if (l.includes("laboratorio") || l.includes("estudio") || l.includes(" lab")) return "lab";
  if (l.includes("medicacion")) return "medication";
  if (l.includes("nota")) return "note";
  return "plain";
}

function sectionTheme(kind: SectionRenderKind) {
  if (kind === "allergy") return EVENT_TYPE_STYLE.allergy;
  if (kind === "hospitalization") return EVENT_TYPE_STYLE.admission;
  if (kind === "lab") return EVENT_TYPE_STYLE.lab;
  if (kind === "medication" || kind === "note") return EVENT_TYPE_STYLE.note;
  return {
    sectionAccent: "text-med-muted",
    sectionBorder: "border-med-line/50",
    sectionBg: "bg-white/60",
  };
}

function isListLine(line: string) {
  return /^[\*\-•]\s+/.test(line) || /^>\s*[\*\-•]?\s*/.test(line);
}

function listContent(line: string) {
  return stripMarkdownNoise(line);
}

type Block =
  | { type: "title"; text: string }
  | { type: "heading"; text: string }
  | { type: "section"; label: string; body: string[] }
  | { type: "list"; items: string[] }
  | { type: "paragraph"; text: string };

function parseBlocks(content: string): Block[] {
  const lines = content.trim().split("\n");
  const blocks: Block[] = [];
  let listBuf: string[] = [];
  let sectionLabel: string | null = null;
  let sectionBody: string[] = [];

  const flushList = () => {
    if (listBuf.length === 0) return;
    if (sectionLabel) {
      sectionBody.push(...listBuf);
      listBuf = [];
      return;
    }
    blocks.push({ type: "list", items: [...listBuf] });
    listBuf = [];
  };

  const flushSection = () => {
    if (sectionLabel) {
      blocks.push({ type: "section", label: sectionLabel, body: [...sectionBody] });
      sectionLabel = null;
      sectionBody = [];
    }
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flushList();
      continue;
    }

    const mdHeading = line.match(/^#{1,6}\s+(.+)$/);
    if (mdHeading) {
      flushList();
      flushSection();
      const text = mdHeading[1].replace(/\*\*/g, "").trim();
      if (blocks.length === 0) blocks.push({ type: "title", text });
      else blocks.push({ type: "heading", text });
      continue;
    }

    const titleOnly = line.match(/^\*\*(.+)\*\*$/);
    if (titleOnly && !titleOnly[1].includes(":")) {
      flushList();
      flushSection();
      const text = titleOnly[1].trim();
      if (blocks.length === 0) blocks.push({ type: "title", text });
      else blocks.push({ type: "heading", text });
      continue;
    }

    const section = line.match(/^[\*\-•>]?\s*\*\*([^*]+)\*\*:?\s*(.*)$/);
    if (section) {
      flushList();
      flushSection();
      sectionLabel = section[1].trim();
      const rest = section[2].trim();
      if (rest) sectionBody.push(rest);
      continue;
    }

    const labelOnly = line.match(/^\*\*([^*]+)\*\*:?\s*$/);
    if (labelOnly) {
      flushList();
      flushSection();
      sectionLabel = labelOnly[1].trim();
      continue;
    }

    if (isListLine(line)) {
      listBuf.push(listContent(line));
      continue;
    }

    flushList();
    if (sectionLabel) {
      sectionBody.push(stripMarkdownNoise(line));
    } else {
      blocks.push({ type: "paragraph", text: stripMarkdownNoise(line) });
    }
  }

  flushList();
  flushSection();
  return blocks;
}

/** Brief con chips por color de tipo de evento (misma paleta que el historial). */
export function MediBotMessageContent({
  content,
  recordPhrases = [],
  onOpenRecord,
  showLegend = true,
}: {
  content: string;
  recordPhrases?: RecordLinkPhrase[];
  onOpenRecord?: (recordId: string) => void;
  showLegend?: boolean;
}) {
  const blocks = parseBlocks(content);
  let key = 0;
  const presentTypes = new Set(recordPhrases.map((p) => p.eventType));

  return (
    <div className="medibot-message min-w-0 space-y-2.5">
      {showLegend && onOpenRecord && presentTypes.size > 0 && (
        <EventTypeLegend presentTypes={presentTypes} />
      )}

      {blocks.map((block) => {
        if (block.type === "title") {
          return (
            <h3
              key={`t-${key++}`}
              className="border-b border-med-secondary/20 pb-2 font-display text-[15px] font-semibold leading-snug text-med-secondary"
            >
              {block.text}
            </h3>
          );
        }

        if (block.type === "heading") {
          return (
            <p
              key={`hd-${key++}`}
              className="text-[11px] font-bold uppercase tracking-wide text-med-muted"
            >
              {block.text}
            </p>
          );
        }

        if (block.type === "section") {
          const kind = sectionRenderKind(block.label);
          const theme = sectionTheme(kind);

          return (
            <div
              key={`sec-${key++}`}
              className={`rounded-xl border-l-[3px] px-3 py-2.5 ${theme.sectionBorder} ${theme.sectionBg}`}
            >
              <p className={`text-[11px] font-bold uppercase tracking-wide ${theme.sectionAccent}`}>
                {block.label}
              </p>
              <div className="mt-2">
                {kind === "allergy" && onOpenRecord ? (
                  <AllergySectionRows recordPhrases={recordPhrases} onOpenRecord={onOpenRecord} />
                ) : kind === "hospitalization" && onOpenRecord ? (
                  <HospitalizationSectionRows
                    recordPhrases={recordPhrases}
                    onOpenRecord={onOpenRecord}
                  />
                ) : kind === "lab" && onOpenRecord ? (
                  <LabSectionRows recordPhrases={recordPhrases} onOpenRecord={onOpenRecord} />
                ) : kind === "medication" && onOpenRecord ? (
                  <MedicationSectionRows
                    recordPhrases={recordPhrases}
                    onOpenRecord={onOpenRecord}
                  />
                ) : kind === "note" && onOpenRecord ? (
                  <NoteSectionRows recordPhrases={recordPhrases} onOpenRecord={onOpenRecord} />
                ) : (
                  <PlainSectionLines lines={block.body} />
                )}
              </div>
            </div>
          );
        }

        if (block.type === "list") {
          return (
            <ul key={`ul-${key++}`} className="space-y-1 text-sm text-med-ink-soft">
              {block.items.map((item, i) => (
                <li key={i} className="leading-relaxed">
                  {renderBoldParts(stripMarkdownNoise(item), `li-${key}-${i}`)}
                </li>
              ))}
            </ul>
          );
        }

        return (
          <p key={`p-${key++}`} className="text-sm leading-relaxed text-med-ink-soft">
            {renderBoldParts(block.text, `p-${key}`)}
          </p>
        );
      })}
    </div>
  );
}
