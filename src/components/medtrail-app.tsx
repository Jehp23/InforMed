"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { useClinicalEvents } from "@/hooks/use-clinical-events";
import { useExternalEventNotifications } from "@/hooks/use-external-event-notifications";
import { fetchJson } from "@/lib/api-client";

import {
  DEMO_PATIENTS,
  DEMO_PRIMARY_PATIENT_ID,
  FAUCET_URL,
  HOSPITALS,
} from "@/lib/constants";
import { deriveClinicalSummaryFromEvents } from "@/lib/derive-patient-summary";
import { collectRecordLinkPhrases } from "@/lib/medibot-record-links";
import { UI_COPY } from "@/lib/ui-copy";
import {
  eventToTimelineRecord,
  filterTimelineEvents,
} from "@/lib/timeline-utils";
import type { EventType, StructuredRecordFormData, TimelineDisplayRecord } from "@/lib/types";
import { MediBotWidget } from "@/components/doctor/historial-assist-panel";
import { MedOverlay } from "@/components/ui/med-overlay";
import { HistoryTabsPanel } from "@/components/medical/history-tabs-panel";
import { CreateRecordForm } from "@/components/medical/create-record-form";
import { RecordDetailsModal } from "@/components/medical/record-details-modal";
import { AppShell } from "@/components/ui/app-shell";
import { AppToast, type ToastPayload } from "@/components/ui/app-toast";
import { DemoTour, type DemoTourStep } from "@/components/ui/demo-tour";
import { PatientLoadingOverlay } from "@/components/ui/patient-loading-overlay";
import {
  SessionWelcomeBanner,
  type WelcomeNotice,
} from "@/components/ui/session-welcome-banner";
import type { LoginSession } from "@/lib/types";

type PatientData = {
  admissionDate: string;
  admissionType: string;
  doctor: string;
  allergies: string[];
  diagnosis: string;
  status: string;
};

/** Ficha vacía hasta cargar eventos verificados o `patient_data` en Arkiv. */
const EMPTY_PATIENT: PatientData = {
  admissionDate: "—",
  admissionType: "—",
  doctor: "—",
  allergies: [],
  diagnosis: "",
  status: "—",
};

const DOCTOR_TOUR_STEPS: DemoTourStep[] = [
  {
    target: "register-event",
    title: "Registrá un evento",
    body: "Abrí la ventana de registro cuando lo necesites; el historial queda al centro sin apretar todo.",
  },
  {
    target: "patient-history",
    title: "Historial unificado",
    body: "Todos los hospitales comparten el mismo timeline para este paciente, sin duplicar datos.",
  },
  {
    target: "historial-assist",
    title: "MediBot",
    body: "Tocá el botón con el logo abajo a la derecha para consultar el historial sin salir de la ficha.",
  },
  {
    target: "hospital-select",
    title: "Multi-hospital",
    body: "Cambiá de hospital y el historial sigue disponible. Ideal para urgencias y derivaciones.",
  },
];

function patientInitials(patientId: string) {
  const label = DEMO_PATIENTS.find((p) => p.id === patientId)?.label ?? "";
  const parts = label.replace(/[()]/g, "").split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return label.slice(0, 2).toUpperCase() || "PA";
}

function selectClassName() {
  return "med-input mt-1.5 text-sm";
}

export function MedtrailApp({
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
  const [hospitalId, setHospitalId] = useState<string>(HOSPITALS[0].id);
  const [patientId, setPatientId] = useState<string>(DEMO_PRIMARY_PATIENT_ID);
  const { events, loading, refreshing, error, reload } = useClinicalEvents(patientId);
  const [submitting, setSubmitting] = useState(false);
  const [recordDraftSeed, setRecordDraftSeed] = useState<{
    summary: string;
    eventType: EventType;
  } | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [patientData, setPatientData] = useState<PatientData>(EMPTY_PATIENT);
  const [isEditingPatient, setIsEditingPatient] = useState(false);
  const [editPatientData, setEditPatientData] = useState<PatientData>(EMPTY_PATIENT);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"quick" | "complete">("quick");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<TimelineDisplayRecord | null>(null);
  const [pinnedRecords] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<ToastPayload | null>(null);
  const [tourOpen, setTourOpen] = useState(false);

  const currentHospital = HOSPITALS.find((h) => h.id === hospitalId);
  const currentPatient = DEMO_PATIENTS.find((p) => p.id === patientId);
  const patientLabel = currentPatient?.label ?? "paciente";
  const isPatientLoading = loading;

  const filteredEvents = useMemo(
    () => filterTimelineEvents(events, searchQuery, activeFilter),
    [events, searchQuery, activeFilter],
  );

  const timelineRecords = useMemo(
    () => filteredEvents.map((ev) => eventToTimelineRecord(ev, pinnedRecords)),
    [filteredEvents, pinnedRecords],
  );

  const derivedSummary = useMemo(
    () => deriveClinicalSummaryFromEvents(events),
    [events],
  );

  const summaryData = useMemo(() => {
    const d = derivedSummary;
    return {
      allergies: d.allergies,
      currentMedication: d.currentMedication,
      relevantHistory: patientData.diagnosis ? [patientData.diagnosis] : d.relevantHistory,
      lastHospitalizations:
        d.lastHospitalizations.length > 0
          ? d.lastHospitalizations
          : [
              {
                date: patientData.admissionDate,
                reason: patientData.admissionType,
                institution: currentHospital?.name ?? "",
              },
            ],
      importantSurgeries: d.importantSurgeries,
      pendingDocuments: d.pendingDocuments,
      clinicalAlerts: d.clinicalAlerts,
    };
  }, [derivedSummary, patientData, currentHospital?.name]);

  const fichaAllergies = summaryData.allergies;

  const recordLinkPhrases = useMemo(
    () => collectRecordLinkPhrases(events),
    [events],
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
      const parsed = JSON.parse(patientDataEvent.summary) as { data?: PatientData };
      if (parsed.data) {
        setPatientData(parsed.data);
        setEditPatientData(parsed.data);
      }
    } catch {
      // ignore
    }
  }, [events]);

  const handlePatientChange = (pid: string) => {
    setPatientId(pid);
    setPatientData(EMPTY_PATIENT);
    setEditPatientData(EMPTY_PATIENT);
    setIsEditingPatient(false);
    setRecordDraftSeed(null);
    setSearchQuery("");
    setActiveFilter("all");
    setShowCreateForm(false);
    setChatOpen(false);
  };

  const notifyExternalEvent = useCallback((payload: ToastPayload) => {
    setToast(payload);
  }, []);

  useExternalEventNotifications({
    events,
    loading,
    patientId,
    viewerHospitalId: hospitalId,
    patientLabel,
    onNotify: notifyExternalEvent,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      if ((e.key === "n" || e.key === "N") && !isPatientLoading && !submitting) {
        e.preventDefault();
        setShowCreateForm(true);
      }
      if (e.key === "Escape") {
        if (showCreateForm) setShowCreateForm(false);
        else if (chatOpen) setChatOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [chatOpen, isPatientLoading, showCreateForm, submitting]);

  const handleSavePatientData = async () => {
    setPatientData(editPatientData);
    setIsEditingPatient(false);
    try {
      const { ok, error } = await fetchJson("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          hospitalId,
          eventType: "note" as EventType,
          summary: JSON.stringify({ type: "patient_data", data: editPatientData }),
          authorIdentityId: session.arkivId,
        }),
      });
      if (!ok) throw new Error(error ?? "No se pudo guardar la ficha");
      setToast({
        title: "Ficha actualizada",
        message: `Datos de ${patientLabel} guardados correctamente.`,
        verified: true,
      });
      await reload(patientId);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Error al guardar la ficha");
    }
  };

  const handleQuickRecord = async (eventType: EventType, summary: string) => {
    setSubmitting(true);
    setActionError(null);
    try {
      const { ok, data: apiData, error } = await fetchJson<{ error?: string }>("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          hospitalId,
          eventType,
          summary,
          authorIdentityId: session.arkivId,
        }),
      });
      if (!ok) throw new Error(error ?? apiData?.error ?? "Error al registrar");
      setToast({
        title: UI_COPY.recordSaved,
        message: UI_COPY.recordSavedDetail,
        verified: true,
      });
      await reload(patientId);
      setShowCreateForm(false);
      setRecordDraftSeed(null);
      setViewMode("complete");
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateRecord = async (data: StructuredRecordFormData) => {
    setSubmitting(true);
    setActionError(null);
    try {
      const { ok, data: apiData, error } = await fetchJson<{ error?: string }>("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          hospitalId,
          eventType: "note" as EventType,
          summary: JSON.stringify({ type: "structured_record", ...data }),
          authorIdentityId: session.arkivId,
        }),
      });
      if (!ok) throw new Error(error ?? apiData?.error ?? "Error al registrar");
      setToast({
        title: UI_COPY.recordSaved,
        message: UI_COPY.recordSavedDetail,
        verified: true,
      });
      await reload(patientId);
      setShowCreateForm(false);
      setRecordDraftSeed(null);
      setViewMode("complete");
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setSubmitting(false);
    }
  };

  const displayError = actionError ?? error;

  const handleApplyDraft = (draft: string, eventType: EventType) => {
    setRecordDraftSeed({ summary: draft, eventType });
    setShowCreateForm(true);
    setToast({
      title: "Borrador listo",
      message: "Revisá el texto en la ventana de registro y publicá cuando esté correcto.",
      verified: false,
    });
  };

  const handleViewRecordDetails = (recordId: string) => {
    const record = events.find((e) => e.entityKey === recordId);
    if (record) setSelectedRecord(eventToTimelineRecord(record, pinnedRecords));
  };

  const toolbar = (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <div
          className="flex h-9 items-center gap-1.5 rounded-full border border-med-line bg-white pl-3 pr-1"
          data-tour="hospital-select"
        >
          <span className="text-xs font-medium text-med-muted">Hospital</span>
          <select
            className="med-toolbar-select max-w-[9.5rem] border-0 bg-transparent py-0 shadow-none disabled:opacity-50"
            value={hospitalId}
            onChange={(e) => setHospitalId(e.target.value)}
            disabled={isPatientLoading}
            aria-label="Hospital"
          >
            {HOSPITALS.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex h-9 items-center gap-1.5 rounded-full border border-med-line bg-white pl-3 pr-1">
          <span className="text-xs font-medium text-med-muted">Paciente</span>
          <select
            className="med-toolbar-select max-w-[10.5rem] border-0 bg-transparent py-0 shadow-none disabled:opacity-50"
            value={patientId}
            onChange={(e) => handlePatientChange(e.target.value)}
            disabled={isPatientLoading}
            aria-label="Paciente"
          >
            {DEMO_PATIENTS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => setTourOpen(true)} className="med-toolbar-btn">
          Guía
        </button>
        <button
          type="button"
          onClick={() => void reload(patientId)}
          disabled={loading || refreshing}
          className="med-toolbar-btn"
        >
          {loading ? UI_COPY.loadingHistory : refreshing ? UI_COPY.syncing : "Actualizar"}
        </button>
      </div>
    </div>
  );

  return (
    <AppShell
      role="doctor"
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

      <div className="relative py-5 lg:py-6">
        {isPatientLoading && (
          <PatientLoadingOverlay
            label={`Cargando historial de ${patientLabel}…`}
            sublabel={UI_COPY.loadingHistory}
          />
        )}

        <div
          className={isPatientLoading ? "pointer-events-none select-none opacity-50" : ""}
          aria-busy={isPatientLoading}
        >
          {displayError && (
            <div className="mb-4 rounded-2xl border border-med-coral/25 bg-[rgba(224,101,76,.06)] px-4 py-3 text-sm text-med-coral">
              {displayError}
              {events.length > 0 && !actionError && (
                <span className="mt-1 block text-med-ink-soft">
                  Mostrando el último historial cargado. Podés reintentar con Actualizar.
                </span>
              )}
              {displayError.includes("PRIVATE_KEY") && (
                <a href={FAUCET_URL} target="_blank" rel="noreferrer" className="ml-2 underline">
                  Faucet Braga
                </a>
              )}
            </div>
          )}

          <section className="med-panel mb-5 px-4 py-4 sm:px-5 sm:py-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-3.5">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-med-secondary font-display text-sm font-semibold text-white">
                  {patientInitials(patientId)}
                </div>
                <div className="min-w-0">
                  <h1 className="truncate font-display text-lg font-semibold text-med-ink sm:text-xl">
                    {currentPatient?.label ?? patientId}
                  </h1>
                  <p className="mt-0.5 text-sm text-med-muted">
                    {currentHospital?.name} · {session.displayName}
                  </p>
                  <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-med-secondary-soft px-2.5 py-0.5 text-xs font-medium text-med-secondary">
                    {UI_COPY.verifiedHistory}
                  </span>
                </div>
              </div>
              {!isEditingPatient && !isPatientLoading && (
                <button
                  type="button"
                  onClick={() => {
                    setEditPatientData(patientData);
                    setIsEditingPatient(true);
                  }}
                  className="med-btn-secondary shrink-0 justify-center py-2.5 text-sm"
                >
                  Editar ficha
                </button>
              )}
            </div>

            {isEditingPatient ? (
              <div className="mt-5 grid gap-3 border-t border-med-line pt-5 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wide text-med-muted">Ingreso</label>
                    <input
                      type="text"
                      className={selectClassName()}
                      value={editPatientData.admissionDate}
                      onChange={(e) => setEditPatientData({ ...editPatientData, admissionDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wide text-med-muted">Tipo</label>
                    <select
                      className={selectClassName()}
                      value={editPatientData.admissionType}
                      onChange={(e) => setEditPatientData({ ...editPatientData, admissionType: e.target.value })}
                    >
                      <option>Guardia</option>
                      <option>Programado</option>
                      <option>Urgencia</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-med-muted">Diagnóstico</label>
                    <input
                      type="text"
                      className={selectClassName()}
                      value={editPatientData.diagnosis}
                      onChange={(e) => setEditPatientData({ ...editPatientData, diagnosis: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-2 sm:col-span-2">
                    <button type="button" onClick={() => void handleSavePatientData()} className="med-btn-primary flex-1 justify-center">
                      Guardar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditPatientData(patientData);
                        setIsEditingPatient(false);
                      }}
                      className="med-btn-secondary flex-1 justify-center"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-5 grid gap-4 border-t border-med-line pt-5 text-sm sm:grid-cols-2 lg:grid-cols-4">
                  <InfoCell label="Ingreso" value={`${patientData.admissionDate} · ${patientData.admissionType}`} />
                  <InfoCell label="Médico" value={patientData.doctor} />
                  <InfoCell label="Diagnóstico" value={patientData.diagnosis} />
                  <AllergyCell allergies={fichaAllergies} />
                </div>
              )}
          </section>

          <div className="mb-5 flex flex-wrap items-center gap-3" data-tour="doctor-actions">
            <button
              type="button"
              data-tour="register-event"
              onClick={() => setShowCreateForm(true)}
              disabled={isPatientLoading}
              className="med-btn-primary justify-center px-6 py-3 text-[15px] disabled:opacity-50"
            >
              + Registrar evento
            </button>
          </div>

          <div className="med-panel p-5 sm:p-6 lg:p-8" data-tour="patient-history">
            <HistoryTabsPanel
              audience="doctor"
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
              onViewDetails={handleViewRecordDetails}
              emptyMessage="Sin eventos para este paciente"
              emptyHint="Usá «Registrar evento» para publicar el primero en Arkiv."
              emptyActionLabel="+ Registrar evento"
              onEmptyAction={() => setShowCreateForm(true)}
              summaryData={summaryData}
            />
          </div>
        </div>
      </div>

      <MedOverlay open={showCreateForm} onClose={() => {
        setShowCreateForm(false);
        setRecordDraftSeed(null);
      }}>
        <CreateRecordForm
          embedded
          key={
            recordDraftSeed
              ? `draft-${recordDraftSeed.eventType}-${recordDraftSeed.summary.slice(0, 24)}`
              : "new"
          }
          initialSummary={recordDraftSeed?.summary}
          initialEventType={recordDraftSeed?.eventType}
          onQuickSubmit={(type, text) => void handleQuickRecord(type, text)}
          onSubmit={(data) => void handleCreateRecord(data)}
          onCancel={() => {
            setShowCreateForm(false);
            setRecordDraftSeed(null);
          }}
          submitting={submitting}
        />
      </MedOverlay>

      <MediBotWidget
        open={chatOpen}
        onOpen={() => setChatOpen(true)}
        onClose={() => setChatOpen(false)}
        patientId={patientId}
        patientLabel={patientLabel}
        disabled={isPatientLoading}
        onApplyDraft={handleApplyDraft}
        recordPhrases={recordLinkPhrases}
        onOpenRecord={handleViewRecordDetails}
      />

      {selectedRecord && (
        <RecordDetailsModal
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
        />
      )}

      <AppToast toast={toast} onDismiss={() => setToast(null)} />

      <DemoTour
        steps={DOCTOR_TOUR_STEPS}
        storageKey="medtrail_demo_tour_doctor_v1"
        forceOpen={tourOpen}
        onClose={() => setTourOpen(false)}
      />
    </AppShell>
  );
}

function AllergyCell({ allergies }: { allergies: string[] }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-med-muted">Alergias</p>
      {allergies.length > 0 ? (
        <>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {allergies.map((a, i) => (
              <span
                key={`${a}-${i}`}
                className="rounded-full bg-[rgba(224,101,76,.12)] px-2.5 py-0.5 text-xs font-semibold text-med-coral"
              >
                {a}
              </span>
            ))}
          </div>
        </>
      ) : (
        <p className="mt-1 text-sm text-med-muted">Sin alergias registradas</p>
      )}
    </div>
  );
}

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-med-muted">{label}</p>
      <p className="mt-1 text-sm text-med-ink">{value}</p>
    </div>
  );
}
