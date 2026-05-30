"use client";

import { useMemo } from "react";
import { MedicalHistoryTable } from "./medical-history-table";
import { MedicalRecordCard } from "./medical-record-card";

export type TimelineRecord = {
  id: string;
  title: string;
  type: string;
  date: string;
  institution?: string;
  doctor?: string;
  status: "declared" | "document_attached" | "ai_extracted" | "pending_review" | "verified" | "institution_issued" | "corrected" | "discarded";
  hasDocument?: boolean;
  importance?: "critical" | "important" | "routine";
  isPinned?: boolean;
};

function parseDateMs(dateStr: string): number {
  const parts = dateStr.split("/");
  if (parts.length === 3) {
    return new Date(
      parseInt(parts[2], 10),
      parseInt(parts[1], 10) - 1,
      parseInt(parts[0], 10),
    ).getTime();
  }
  const t = new Date(dateStr).getTime();
  return Number.isNaN(t) ? 0 : t;
}

function sortRecords(records: TimelineRecord[]) {
  return [...records].sort((a, b) => parseDateMs(b.date) - parseDateMs(a.date));
}

function groupByYear(records: TimelineRecord[]) {
  const grouped: Record<number, TimelineRecord[]> = {};
  for (const record of records) {
    const parts = record.date.split("/");
    const year =
      parts.length === 3 ? parseInt(parts[2], 10) : new Date(record.date).getFullYear();
    const y = Number.isNaN(year) ? new Date().getFullYear() : year;
    if (!grouped[y]) grouped[y] = [];
    grouped[y].push(record);
  }
  for (const year of Object.keys(grouped)) {
    grouped[Number(year)].sort((a, b) => parseDateMs(b.date) - parseDateMs(a.date));
  }
  return grouped;
}

export function MedicalTimeline({
  records,
  onPin,
  onViewDetails,
  variant = "table",
}: {
  records: TimelineRecord[];
  onPin?: (id: string) => void;
  onViewDetails?: (id: string) => void;
  variant?: "table" | "cards";
}) {
  const sorted = useMemo(() => sortRecords(records), [records]);
  const groupedByYear = useMemo(() => groupByYear(records), [records]);
  const sortedYears = useMemo(
    () => Object.keys(groupedByYear).map(Number).sort((a, b) => b - a),
    [groupedByYear],
  );

  if (records.length === 0) return null;

  if (variant === "cards") {
    return (
      <div className="space-y-6">
        {sortedYears.map((year) => (
          <div key={year}>
            <h3 className="mb-3 font-fraunces text-lg font-semibold text-med-ink">{year}</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {groupedByYear[year].map((record) => (
                <MedicalRecordCard
                  key={record.id}
                  record={record}
                  onPin={onPin}
                  onViewDetails={onViewDetails}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return <MedicalHistoryTable records={sorted} onViewDetails={onViewDetails} />;
}
