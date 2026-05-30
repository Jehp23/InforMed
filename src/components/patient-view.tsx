"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

import { useClinicalEvents } from "@/hooks/use-clinical-events";
import { useExternalEventNotifications } from "@/hooks/use-external-event-notifications";
import { PatientHowItWorks } from "@/components/patient/patient-how-it-works";
import { resolvePatientIdForEmail } from "@/lib/constants";
import { shortClinicalHeadline } from "@/lib/clinical-event-text";
import {
  collectAllergiesFromEvents,
  deriveClinicalSummaryFromEvents,
} from "@/lib/derive-patient-summary";
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

const EMPTY_FICHA: ArkivPatientData = {
  admissionDate: "",
  admissionType: "",
  doctor: "",
  allergies: [],
  diagnosis: "",
  status: "",
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
  const [ficha, setFicha] = useState<ArkivPatientData>(EMPTY_FICHA);
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
    () =>
      filteredEvents
        .map((ev) => eventToTimelineRecord(ev, pinnedRecords))
        .filter((r): r is TimelineDisplayRecord => r != null),
    [filteredEvents, pinnedRecords],
  );

  const derivedSummary = useMemo(
    () => deriveClinicalSummaryFromEvents(events),
    [events],
  );

  const verifiedAllergies = useMemo(
    () => collectAllergiesFromEvents(events),
    [events],
  );

  const patientSummary = useMemo(() => {
    const alerts: string[] = [];
    if (verifiedAllergies.length > 0) {
      alerts.push("Tené presente tus alergias al consultar con un médico");
    }
    const hospitalIds = new Set(
      events.filter((e) => {
        try {
          return (JSON.parse(e.summary) as { type?: string }).type !== "patient_data";
        } catch {
          return true;
        }
      }).map((e) => e.hospitalId),
    );
    if (hospitalIds.size > 1) {
      alerts.push("Tu historial incluye registros de varios hospitales");
    }

    return {
      allergies: verifiedAllergies,
      currentMedication: derivedSummary.currentMedication,
      relevantHistory: ficha.diagnosis.trim() ? [ficha.diagnosis.trim()] : [],
      lastHospitalizations: derivedSummary.lastHospitalizations,
      importantSurgeries: derivedSummary.importantSurgeries,
      pendingDocuments: documents.filter((d) => d.status === "pendiente").map((d) => d.name),
      clinicalAlerts: alerts,
    };
  }, [derivedSummary, verifiedAllergies, events, ficha.diagnosis, documents]);

  const bannerItems = useMemo(() => {
    const items: { label: string; value: ReactNode }[] = [];
    const lastHosp = derivedSummary.lastHospitalizations[0];
    if (lastHosp) {
      items.push({
        label: "Última atención",
        value: (
          <div className="space-y-0.5">
            <p className="text-sm font-medium leading-snug text-med-ink">
              {lastHosp.date} · {shortClinicalHeadline(lastHosp.reason)}
            </p>
            <p className="text-xs text-med-muted">{lastHosp.institution}</p>
          </div>
        ),
      });
    }
    if (ficha.doctor.trim()) {
      items.push({ label: "Médico tratante", value: ficha.doctor.trim() });
    }
    if (ficha.diagnosis.trim()) {
      items.push({ label: "Diagnóstico", value: ficha.diagnosis.trim() });
    }
    items.push({
      label: "Alergias",
      value:
        verifiedAllergies.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {verifiedAllergies.map((a) => (
              <span
                key={a}
                className="rounded-full bg-[rgba(224,101,76,.12)] px-2.5 py-0.5 text-xs font-semibold text-med-coral"
              >
                {a}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-med-muted">Sin alergias registradas</span>
        ),
    });
    return items;
  }, [derivedSummary.lastHospitalizations, ficha, verifiedAllergies]);

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
      if (parsed.data) setFicha(parsed.data);
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
            doctor: ficha.doctor || "—",
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
        subtitle={UI_COPY.patientBannerSubtitle}
      >
        {bannerItems.length > 0 && <PatientInfoGrid items={bannerItems} />}
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

          <PatientHowItWorks />
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
            if (record) {
              const row = eventToTimelineRecord(record, pinnedRecords);
              if (row) setSelectedRecord(row);
            }
          }}
          emptyMessage="Aún no hay eventos en tu historial"
          emptyHint="Cuando un médico registre algo, aparecerá acá automáticamente."
          summaryData={patientSummary}
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
