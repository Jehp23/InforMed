import type { ValidationStatus } from "@/lib/types";

const VALIDATION_STYLES: Record<ValidationStatus, { bg: string; text: string; label: string }> = {
  declared: { bg: "bg-[rgba(92,111,106,.13)]", text: "text-med-muted", label: "Declarado por paciente" },
  document_attached: { bg: "bg-[rgba(14,140,107,.12)]", text: "text-med-secondary", label: "Documento adjunto" },
  ai_extracted: { bg: "bg-[rgba(214,154,46,.13)]", text: "text-med-amber", label: "Extraído por IA" },
  pending_review: { bg: "bg-[rgba(214,154,46,.13)]", text: "text-med-amber", label: "Pendiente de revisión" },
  verified: { bg: "bg-[rgba(14,140,107,.12)]", text: "text-med-secondary", label: "Verificado por profesional" },
  institution_issued: { bg: "bg-[rgba(14,140,107,.12)]", text: "text-med-secondary", label: "Emitido por institución" },
  corrected: { bg: "bg-[rgba(92,111,106,.13)]", text: "text-med-muted", label: "Corregido" },
  discarded: { bg: "bg-[rgba(224,101,76,.13)]", text: "text-med-coral", label: "Descartado" },
};

export function ValidationBadge({ status }: { status: ValidationStatus }) {
  const style = VALIDATION_STYLES[status] || VALIDATION_STYLES.declared;

  return (
    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-[999px] ${style.bg} ${style.text}`}>
      {style.label}
    </span>
  );
}
