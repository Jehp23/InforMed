import { ValidationBadge } from "./validation-badge";
import { eventTypeDisplayLabel } from "@/lib/event-display-labels";

export function MedicalRecordCard({
  record,
  onPin,
  onViewDetails,
}: {
  record: {
    id: string;
    title: string;
    type: string;
    typeLabel?: string;
    date: string;
    institution?: string;
    doctor?: string;
    status: "declared" | "document_attached" | "ai_extracted" | "pending_review" | "verified" | "institution_issued" | "corrected" | "discarded";
    isPinned?: boolean;
  };
  onPin?: (id: string) => void;
  onViewDetails?: (id: string) => void;
}) {
  return (
    <article className="rounded-xl border border-med-line bg-white p-4 transition hover:border-med-secondary/40 hover:shadow-[var(--med-shadow-soft)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-[15px] text-med-ink">{record.title}</h3>
            <ValidationBadge status={record.status} />
          </div>
          <p className="mt-1 text-xs text-med-muted">
            {record.typeLabel ?? eventTypeDisplayLabel(record.type)}
          </p>
        </div>
        {onPin && (
          <button
            type="button"
            onClick={() => onPin(record.id)}
            className={`rounded-lg p-1.5 ${record.isPinned ? "text-med-secondary bg-med-secondary-soft" : "text-med-muted hover:bg-med-primary-2"}`}
            title={record.isPinned ? "Desfijar" : "Fijar"}
          >
            ★
          </button>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-med-ink-soft">
        <span>{record.date}</span>
        {record.institution && <span>{record.institution}</span>}
        {record.doctor && (
          <span className="text-med-muted">
            Registrado por {record.doctor}
          </span>
        )}
      </div>

      {onViewDetails && (
        <button
          type="button"
          onClick={() => onViewDetails(record.id)}
          className="mt-3 text-xs font-semibold text-med-secondary hover:underline"
        >
          Ver detalles →
        </button>
      )}
    </article>
  );
}
