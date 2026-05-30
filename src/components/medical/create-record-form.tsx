"use client";

import { useEffect, useState } from "react";

import {
  EVENT_DETAIL_MAX,
  EVENT_SUMMARY_MAX,
  validateEventDetail,
  validateEventSummary,
} from "@/lib/event-field-limits";
import { validateStructuredRecordPayload } from "@/lib/structured-record";
import { UI_COPY } from "@/lib/ui-copy";
import type { EventType, StructuredRecordFormData } from "@/lib/types";

const QUICK_TYPES: { id: EventType; label: string; placeholder: string }[] = [
  {
    id: "allergy",
    label: "Alergia",
    placeholder: "Ej: Penicilina — urticaria leve (2022)",
  },
  {
    id: "admission",
    label: "Ingreso",
    placeholder: "Ej: Ingreso urgencias — dolor torácico, observación 6 h",
  },
  {
    id: "lab",
    label: "Laboratorio",
    placeholder: "Ej: Hemograma dentro de rango normal",
  },
  {
    id: "note",
    label: "Nota clínica",
    placeholder: "Ej: Control de presión arterial — valores estables",
  },
];

const RECORD_TYPES = [
  { id: "consultation", label: "Consulta médica" },
  { id: "hospitalization", label: "Internación" },
  { id: "surgery", label: "Cirugía" },
  { id: "allergy", label: "Alergia o reacción" },
  { id: "medication", label: "Medicación" },
  { id: "study", label: "Estudio o análisis" },
  { id: "diagnosis", label: "Diagnóstico" },
  { id: "vaccine", label: "Vacuna" },
  { id: "document", label: "Documento médico" },
  { id: "other", label: "Otro" },
];

export function CreateRecordForm({
  embedded = false,
  onQuickSubmit,
  onSubmit,
  onCancel,
  submitting = false,
  initialSummary,
  initialEventType,
}: {
  embedded?: boolean;
  onQuickSubmit: (eventType: EventType, summary: string, detail?: string) => void;
  onSubmit: (data: StructuredRecordFormData) => void;
  onCancel: () => void;
  submitting?: boolean;
  initialSummary?: string;
  initialEventType?: EventType;
}) {
  const [eventType, setEventType] = useState<EventType>(initialEventType ?? "allergy");
  const [summary, setSummary] = useState(initialSummary ?? "");
  const [detail, setDetail] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [recordType, setRecordType] = useState("");
  const [formData, setFormData] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialEventType) setEventType(initialEventType);
    if (initialSummary) {
      setSummary(initialSummary);
      setShowAdvanced(false);
    }
  }, [initialEventType, initialSummary]);

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const err =
      validateEventSummary(summary) ?? validateEventDetail(detail);
    if (err) {
      setFieldError(err);
      return;
    }
    setFieldError(null);
    onQuickSubmit(eventType, summary.trim(), detail.trim() || undefined);
  };

  const clampSummary = (value: string) => value.slice(0, EVENT_SUMMARY_MAX);
  const clampDetail = (value: string) => value.slice(0, EVENT_DETAIL_MAX);

  const handleAdvancedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { recordType, ...formData };
    const err = validateStructuredRecordPayload(payload);
    if (err) {
      setFieldError(err);
      return;
    }
    setFieldError(null);
    onSubmit(payload);
  };

  const handleTypeChange = (type: string) => {
    setRecordType(type);
    setFormData({});
  };

  const handleFieldChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const renderAdvancedFields = () => {
    switch (recordType) {
      case "allergy":
        return (
          <>
            <div>
              <label className="mb-1 block text-xs text-med-muted">Sustancia</label>
              <input
                type="text"
                value={formData.substance || ""}
                onChange={(e) =>
                  handleFieldChange("substance", e.target.value.slice(0, EVENT_SUMMARY_MAX))
                }
                maxLength={EVENT_SUMMARY_MAX}
                className="med-input text-sm"
                placeholder="Penicilina"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-med-muted">Observaciones</label>
              <textarea
                value={formData.observations || ""}
                onChange={(e) =>
                  handleFieldChange("observations", e.target.value.slice(0, EVENT_DETAIL_MAX))
                }
                maxLength={EVENT_DETAIL_MAX}
                className="med-input text-sm"
                rows={3}
                placeholder="Reacción, severidad, fecha de diagnóstico…"
              />
            </div>
          </>
        );
      case "surgery":
        return (
          <>
            <div>
              <label className="mb-1 block text-xs text-med-muted">Procedimiento</label>
              <input
                type="text"
                value={formData.procedure || ""}
                onChange={(e) => handleFieldChange("procedure", e.target.value)}
                className="med-input text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-med-muted">Motivo</label>
              <textarea
                value={formData.reason || ""}
                onChange={(e) => handleFieldChange("reason", e.target.value)}
                className="med-input text-sm"
                rows={2}
              />
            </div>
          </>
        );
      default:
        return (
          <div>
            <label className="mb-1 block text-xs text-med-muted">Descripción</label>
            <textarea
              value={formData.description || ""}
              onChange={(e) =>
                handleFieldChange("description", e.target.value.slice(0, EVENT_DETAIL_MAX))
              }
              maxLength={EVENT_DETAIL_MAX}
              className="med-input text-sm"
              rows={3}
            />
          </div>
        );
    }
  };

  return (
    <div
      className={
        embedded
          ? "pt-1"
          : "rounded-2xl border border-med-line bg-white p-5 shadow-[var(--med-shadow-soft)]"
      }
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="font-fraunces text-lg font-semibold text-med-ink">Registrar evento</h2>
          <p className="mt-1 text-xs text-med-muted">Quedará en el historial compartido del paciente</p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="text-sm text-med-muted hover:text-med-ink"
        >
          Cerrar
        </button>
      </div>

      {!showAdvanced ? (
        <form onSubmit={handleQuickSubmit} className="mt-5 space-y-4" aria-busy={submitting}>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-med-muted">
              Tipo
            </label>
            <div className="grid grid-cols-2 gap-2">
              {QUICK_TYPES.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => {
                    setEventType(type.id);
                    setSummary("");
                    setDetail("");
                    setFieldError(null);
                  }}
                  className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                    eventType === type.id
                      ? "bg-med-secondary text-white"
                      : "border border-med-line bg-white text-med-muted hover:border-med-secondary/40"
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-1.5 flex items-baseline justify-between gap-2">
              <label className="text-sm font-semibold text-med-ink-soft">
                Resumen del evento
              </label>
              <span className="text-[11px] text-med-muted">
                {summary.length}/{EVENT_SUMMARY_MAX}
              </span>
            </div>
            <input
              type="text"
              value={summary}
              onChange={(e) => setSummary(clampSummary(e.target.value))}
              maxLength={EVENT_SUMMARY_MAX}
              className="med-input text-sm"
              placeholder={QUICK_TYPES.find((t) => t.id === eventType)?.placeholder}
              required
            />
            <p className="mt-1 text-[11px] text-med-muted">
              Título breve para el historial (sustancia, motivo o resultado).
            </p>
          </div>

          <div>
            <div className="mb-1.5 flex items-baseline justify-between gap-2">
              <label className="text-sm font-semibold text-med-ink-soft">
                Detalle <span className="font-normal text-med-muted">(opcional)</span>
              </label>
              <span className="text-[11px] text-med-muted">
                {detail.length}/{EVENT_DETAIL_MAX}
              </span>
            </div>
            <textarea
              value={detail}
              onChange={(e) => setDetail(clampDetail(e.target.value))}
              maxLength={EVENT_DETAIL_MAX}
              className="med-input min-h-[88px] text-sm"
              placeholder="Reacción, contexto, indicaciones…"
            />
          </div>

          {fieldError && (
            <p className="rounded-lg border border-med-coral/25 bg-[rgba(224,101,76,.06)] px-3 py-2 text-sm text-med-coral">
              {fieldError}
            </p>
          )}

          <button
            type="submit"
            disabled={!summary.trim() || submitting}
            className="med-btn-primary flex w-full justify-center py-3.5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? UI_COPY.publishingRecord : UI_COPY.publishRecord}
          </button>

          <button
            type="button"
            onClick={() => setShowAdvanced(true)}
            className="w-full text-center text-xs font-semibold text-med-secondary hover:underline"
          >
            Formulario avanzado →
          </button>
        </form>
      ) : (
        <form onSubmit={handleAdvancedSubmit} className="mt-5 space-y-4" aria-busy={submitting}>
          {fieldError && (
            <p className="rounded-lg border border-med-coral/25 bg-[rgba(224,101,76,.06)] px-3 py-2 text-sm text-med-coral">
              {fieldError}
            </p>
          )}
          <div>
            <label className="mb-2 block text-xs text-med-muted">Tipo de registro</label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {RECORD_TYPES.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => handleTypeChange(type.id)}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                    recordType === type.id
                      ? "bg-med-secondary text-white"
                      : "border border-med-line bg-white text-med-muted"
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {recordType && (
            <div className="space-y-4 border-t border-med-line pt-4">{renderAdvancedFields()}</div>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={!recordType || submitting}
              className="med-btn-primary flex flex-1 justify-center disabled:opacity-50"
            >
              {submitting ? UI_COPY.publishingRecord : UI_COPY.publishRecord}
            </button>
            <button
              type="button"
              onClick={() => setShowAdvanced(false)}
              className="med-btn-secondary flex-1 justify-center"
            >
              Modo rápido
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
