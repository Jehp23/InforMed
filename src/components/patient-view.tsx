"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { useClinicalEvents } from "@/hooks/use-clinical-events";
import { useExternalEventNotifications } from "@/hooks/use-external-event-notifications";
import { resolvePatientIdForEmail } from "@/lib/constants";
import { UI_COPY } from "@/lib/ui-copy";
import { eventToTimelineRecord, filterTimelineEvents } from "@/lib/timeline-utils";
import type { TimelineDisplayRecord } from "@/lib/types";
import { HistoryTabsPanel } from "@/components/medical/history-tabs-panel";
import { RecordDetailsModal } from "@/components/medical/record-details-modal";
import {
  PatientDocumentsPanel,
  type PatientDocument,
} from "@/components/patient/patient-documents-panel";
import { AppShell } from "@/components/ui/app-shell";
import { AppToast, type ToastPayload } from "@/components/ui/app-toast";
import { DemoTour, type DemoTourStep } from "@/components/ui/demo-tour";
import { PatientLoadingOverlay } from "@/components/ui/patient-loading-overlay";
import {
  SessionWelcomeBanner,
  type WelcomeNotice,
} from "@/components/ui/session-welcome-banner";
import { PatientBanner, PatientInfoGrid } from "@/components/ui/patient-banner";
import type { LoginSession } from "@/lib/types";

type ArkivPatientData = {
  admissionDate: string;
  admissionType: string;
  doctor: string;
  allergies: string[];
  diagnosis: string;
  status: string;
};

const DEFAULT_ARKIV_DATA: ArkivPatientData = {
  admissionDate: "29/05/2026",
  admissionType: "Guardia",
  doctor: "Dr. Pérez",
  allergies: ["Penicilina", "AINes"],
  diagnosis: "Hipertensión · seguimiento",
  status: "Estable",
};

const PATIENT_TOUR_STEPS: DemoTourStep[] = [
  {
    target: "health-summary",
    title: "Mi resumen de salud",
    body: "Alergias, diagnósticos y alertas importantes en un vistazo, sin navegar el historial completo.",
  },
  {
    target: "patient-history",
    title: "Mis eventos clínicos",
    body: "Cada registro fue emitido por un hospital y queda respaldado de forma verificable.",
  },
  {
    target: "patient-documents",
    title: "Documentos personales",
    body: "Adjuntá estudios o informes complementarios para tu próxima consulta.",
  },
];

export function PatientView({
  session,
  onLogout,
  welcomeNotice,
  onDismissWelcome,
}: {
  session: LoginSession;
  onLogout?: () => void;
  welcomeNotice?: WelcomeNotice | null;
  onDismissWelcome?: () => void;
}) {
  const patientId = resolvePatientIdForEmail(session.email);
  const [arkivData, setArkivData] = useState<ArkivPatientData>(DEFAULT_ARKIV_DATA);
  const [documents, setDocuments] = useState<PatientDocument[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { events, loading, refreshing, error, reload } = useClinicalEvents(patientId);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"quick" | "complete">("quick");
  const [selectedRecord, setSelectedRecord] = useState<TimelineDisplayRecord | null>(null);
  const [pinnedRecords] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<ToastPayload | null>(null);
  const [tourOpen, setTourOpen] = useState(false);

  const patientLabel = session.displayName || "tu historial";

  const notifyExternalEvent = useCallback((payload: ToastPayload) => {
    setToast(payload);
  }, []);

  useExternalEventNotifications({
    events,
    loading,
    patientId,
    patientLabel,
    onNotify: notifyExternalEvent,
  });

  const filteredEvents = useMemo(
    () => filterTimelineEvents(events, searchQuery, activeFilter),
    [events, searchQuery, activeFilter],
  );

  const timelineRecords = useMemo(
    () => filteredEvents.map((ev) => eventToTimelineRecord(ev, pinnedRecords)),
    [filteredEvents, pinnedRecords],
  );

  useEffect(() => {
    const patientDataEvent = events.find((ev) => {
      try {
        return (JSON.parse(ev.summary) as { type?: string }).type === "patient_data";
      } catch {
        return false;
      }
    });
    if (!patientDataEvent) return;
    try {
      const parsed = JSON.parse(patientDataEvent.summary) as { data?: ArkivPatientData };
      if (parsed.data) setArkivData(parsed.data);
    } catch {
      // ignore
    }
  }, [events]);

  const handleUploadDocument = () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".pdf";
    fileInput.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      setIsUploading(true);
      setTimeout(() => {
        setDocuments((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            name: file.name,
            date: new Date().toLocaleDateString("es-AR"),
            location: "Documento personal",
            doctor: arkivData.doctor,
            status: "cargado",
            pdfUrl: URL.createObjectURL(file),
          },
        ]);
        setIsUploading(false);
      }, 800);
    };
    fileInput.click();
  };

  const handleSignDocument = (docId: string) => {
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === docId
          ? { ...doc, signature: "Firmado", status: "prestado" as const }
          : doc,
      ),
    );
  };

  const toolbar = (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <span className="hidden text-sm text-med-muted md:inline">
        Hola, <strong className="font-semibold text-med-ink">{session.displayName}</strong>
      </span>
      <button type="button" onClick={() => setTourOpen(true)} className="med-toolbar-btn">
        Guía
      </button>
      <button
        type="button"
        onClick={() => void reload(patientId)}
        disabled={loading || refreshing}
        className="med-toolbar-btn border-med-secondary/30 text-med-secondary"
      >
        {loading ? UI_COPY.loadingHistory : refreshing ? UI_COPY.syncing : "Actualizar historial"}
      </button>
    </div>
  );

  return (
    <AppShell
      role="patient"
      toolbar={toolbar}
      onLogout={onLogout}
      session={{
        arkivId: session.arkivId,
        displayName: session.displayName,
        isNewIdentity: session.isNewIdentity,
      }}
    >
      {welcomeNotice && onDismissWelcome && (
        <SessionWelcomeBanner notice={welcomeNotice} onDismiss={onDismissWelcome} />
      )}

      {error && (
        <div className="mb-4 rounded-xl border border-med-coral/30 bg-[rgba(224,101,76,.08)] px-4 py-3 text-sm text-med-coral">
          {error}
          {events.length > 0 && (
            <span className="mt-1 block text-med-ink-soft">
              Mostrando el último historial cargado. Podés reintentar con Actualizar.
            </span>
          )}
        </div>
      )}

      <div className="relative">
        {loading && (
          <PatientLoadingOverlay
            label={`Cargando tu historial…`}
            sublabel={UI_COPY.loadingHistory}
          />
        )}

        <div
          className={loading ? "pointer-events-none select-none opacity-50" : undefined}
          aria-busy={loading}
        >
      <PatientBanner
        patientId={patientId}
        variant="patient"
        greeting={`Hola, ${session.displayName.split(" ")[0] ?? "bienvenido/a"}`}
        subtitle="Tu historial compartido entre hospitales · respaldo verificable"
        actions={
          <span className="rounded-full bg-med-secondary-soft px-3 py-1.5 text-xs font-semibold text-med-secondary">
            Solo lectura
          </span>
        }
      >
        <PatientInfoGrid
          items={[
            {
              label: "Ingreso",
              value: `${arkivData.admissionDate} · ${arkivData.admissionType}`,
            },
            { label: "Médico tratante", value: arkivData.doctor },
            { label: "Diagnóstico", value: arkivData.diagnosis },
            {
              label: "Alergias",
              value: (
                <div className="flex flex-wrap gap-1.5">
                  {arkivData.allergies.map((a) => (
                    <span
                      key={a}
                      className="rounded-full bg-[rgba(224,101,76,.12)] px-2.5 py-0.5 text-xs font-semibold text-med-coral"
                    >
                      {a}
                    </span>
                  ))}
                </div>
              ),
            },
          ]}
        />
      </PatientBanner>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,300px)_1fr]">
        <aside className="space-y-4 med-sticky-below-header">
          <div data-tour="patient-documents">
            <PatientDocumentsPanel
              documents={documents}
              isUploading={isUploading}
              onUpload={handleUploadDocument}
              onSign={handleSignDocument}
            />
          </div>

          <div className="rounded-2xl border border-med-line bg-white p-4 text-sm shadow-[var(--med-shadow-soft)]">
            <h3 className="font-semibold text-med-ink">¿Cómo funciona?</h3>
            <p className="mt-2 text-med-muted">
              Los registros médicos los crean los hospitales y quedan protegidos contra alteraciones. Podés
              consultarlos y adjuntar documentación complementaria.
            </p>
          </div>
        </aside>

        <div data-tour="patient-history">
          <div data-tour="health-summary">
            <HistoryTabsPanel
          audience="patient"
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          recordCount={timelineRecords.length}
          loading={loading}
          refreshing={refreshing}
          searchQuery={searchQuery}
          onSearch={setSearchQuery}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          timelineRecords={timelineRecords}
          onViewDetails={(id) => {
            const record = events.find((e) => e.entityKey === id);
            if (record) setSelectedRecord(eventToTimelineRecord(record, pinnedRecords));
          }}
          emptyMessage="Aún no hay eventos en tu historial"
          emptyHint="Cuando un médico registre algo, aparecerá acá automáticamente."
          summaryData={{
            allergies: arkivData.allergies,
            currentMedication: [],
            relevantHistory: [arkivData.diagnosis],
            lastHospitalizations: [
              {
                date: arkivData.admissionDate,
                reason: arkivData.admissionType,
                institution: "Varios hospitales",
              },
            ],
            importantSurgeries: [],
            pendingDocuments: documents.filter((d) => d.status === "pendiente").map((d) => d.name),
            clinicalAlerts:
              arkivData.allergies.length > 0
                ? ["Tené presente tus alergias al consultar con un médico"]
                : [],
          }}
            />
          </div>
        </div>
      </div>
        </div>
      </div>

      {selectedRecord && (
        <RecordDetailsModal
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
        />
      )}

      <AppToast toast={toast} onDismiss={() => setToast(null)} />

      <DemoTour
        steps={PATIENT_TOUR_STEPS}
        storageKey="medtrail_demo_tour_patient_v1"
        forceOpen={tourOpen}
        onClose={() => setTourOpen(false)}
      />
    </AppShell>
  );
}
