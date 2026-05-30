"use client";

export type PatientDocument = {
  id: string;
  name: string;
  date: string;
  location: string;
  doctor: string;
  status: "prestado" | "pendiente" | "cargado";
  signature?: string;
  pdfUrl?: string;
};

const STATUS_STYLES = {
  prestado: "bg-[rgba(14,140,107,.12)] text-med-secondary",
  pendiente: "bg-[rgba(214,154,46,.13)] text-med-amber",
  cargado: "bg-med-primary-2 text-med-muted",
} as const;

export function PatientDocumentsPanel({
  documents,
  isUploading,
  onUpload,
  onSign,
}: {
  documents: PatientDocument[];
  isUploading: boolean;
  onUpload: () => void;
  onSign: (docId: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-med-line bg-white p-4 shadow-[var(--med-shadow-soft)]">
      <div className="mb-1 flex items-start justify-between gap-2">
        <div>
          <h2 className="font-fraunces text-lg font-semibold text-med-ink">Mis documentos</h2>
          <p className="mt-1 text-xs text-med-muted">Documentos personales adjuntos</p>
        </div>
        <button
          type="button"
          onClick={onUpload}
          disabled={isUploading}
          className="shrink-0 rounded-lg bg-med-secondary px-3 py-2 text-xs font-semibold text-white hover:bg-med-secondary-hover disabled:opacity-50"
        >
          {isUploading ? "Subiendo…" : "+ PDF"}
        </button>
      </div>

      {documents.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-sm font-medium text-med-ink">Sin documentos cargados</p>
          <p className="mt-1 text-xs text-med-muted">
            Adjuntá estudios, informes u otros PDFs de tu historial
          </p>
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {documents.map((doc) => (
            <li
              key={doc.id}
              className="rounded-xl border border-med-line p-3 transition hover:border-med-secondary/30"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-med-ink">{doc.name}</p>
                  <p className="mt-0.5 text-xs text-med-muted">
                    {doc.date} · {doc.location}
                  </p>
                  <span
                    className={`mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_STYLES[doc.status]}`}
                  >
                    {doc.status}
                  </span>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  {doc.pdfUrl && (
                    <a
                      href={doc.pdfUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-semibold text-med-secondary hover:underline"
                    >
                      Ver
                    </a>
                  )}
                  {!doc.signature && (
                    <button
                      type="button"
                      onClick={() => onSign(doc.id)}
                      className="text-xs text-med-muted hover:text-med-secondary"
                    >
                      Firmar
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
