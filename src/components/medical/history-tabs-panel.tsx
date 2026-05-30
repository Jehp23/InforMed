"use client";

import { UI_COPY } from "@/lib/ui-copy";
import { ClinicalSummary } from "./clinical-summary";
import { FilterChips } from "./filter-chips";
import { MedicalTimeline } from "./medical-timeline";
import type { TimelineRecord } from "./medical-timeline";
import { SearchBar } from "./search-bar";

type SummaryData = {
  allergies: string[];
  currentMedication: string[];
  relevantHistory: string[];
  lastHospitalizations: Array<{ date: string; reason: string; institution: string }>;
  importantSurgeries: Array<{ date: string; procedure: string; institution: string }>;
  pendingDocuments: string[];
  clinicalAlerts: string[];
};

export function HistoryTabsPanel({
  viewMode,
  onViewModeChange,
  recordCount,
  summaryData,
  timelineRecords,
  loading,
  refreshing,
  onSearch,
  activeFilter,
  onFilterChange,
  onViewDetails,
  emptyMessage,
  emptyHint,
  emptyActionLabel,
  onEmptyAction,
  audience = "doctor",
}: {
  viewMode: "quick" | "complete";
  onViewModeChange: (mode: "quick" | "complete") => void;
  recordCount: number;
  summaryData: SummaryData;
  timelineRecords: TimelineRecord[];
  loading: boolean;
  refreshing?: boolean;
  searchQuery?: string;
  onSearch: (q: string) => void;
  activeFilter: string;
  onFilterChange: (f: string) => void;
  onViewDetails?: (id: string) => void;
  emptyMessage?: string;
  emptyHint?: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  audience?: "doctor" | "patient";
}) {
  const isDoctor = audience === "doctor";
  const historyTitle = isDoctor ? "Historial del paciente" : "Mi historial clínico";
  const historySubtitle = isDoctor
    ? UI_COPY.multiHospitalHistory
    : UI_COPY.patientHistorySubtitle;
  const activeTabClass = "bg-med-secondary text-white";
  return (
    <section className="min-w-0 space-y-4" aria-busy={loading || refreshing}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-full border border-med-line bg-med-primary-2/60 p-1">
          {(["quick", "complete"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => onViewModeChange(mode)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                viewMode === mode ? activeTabClass : "text-med-muted hover:text-med-ink"
              }`}
            >
              {mode === "quick"
                ? isDoctor
                  ? "Resumen clínico"
                  : "Mi resumen"
                : isDoctor
                  ? `Historial (${recordCount})`
                  : `Mis eventos (${recordCount})`}
            </button>
          ))}
        </div>
        {refreshing && (
          <span
            role="status"
            aria-live="polite"
            className="inline-flex items-center gap-2 rounded-full border border-med-secondary/30 bg-med-secondary-soft px-3 py-1.5 text-xs font-semibold text-med-secondary"
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-med-secondary" />
            Sincronizando…
          </span>
        )}
      </div>

      {viewMode === "quick" ? (
        <ClinicalSummary data={summaryData} audience={audience} />
      ) : (
        <div className="med-panel p-4 md:p-5">
          <h2 className="font-fraunces text-lg font-semibold text-med-ink">{historyTitle}</h2>
          <p className="mt-1 text-sm text-med-muted">{historySubtitle}</p>

          <div className="mt-4 space-y-3">
            <SearchBar onSearch={onSearch} />
            <FilterChips activeFilter={activeFilter} onFilterChange={onFilterChange} />
          </div>

          {loading && timelineRecords.length === 0 ? (
            <div
              role="status"
              aria-live="polite"
              aria-busy="true"
              className="py-12 text-center text-sm text-med-muted"
            >
              {UI_COPY.loadingHistory}
            </div>
          ) : timelineRecords.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm font-medium text-med-ink">{emptyMessage ?? "Sin eventos"}</p>
              <p className="mt-1 text-sm text-med-muted">{emptyHint}</p>
              {emptyActionLabel && onEmptyAction && (
                <button
                  type="button"
                  onClick={onEmptyAction}
                  className="med-btn-primary mt-4 inline-flex justify-center px-5 py-2.5 text-sm"
                >
                  {emptyActionLabel}
                </button>
              )}
            </div>
          ) : (
            <div className="mt-4">
              <MedicalTimeline records={timelineRecords} onViewDetails={onViewDetails} />
            </div>
          )}
        </div>
      )}
    </section>
  );
}
