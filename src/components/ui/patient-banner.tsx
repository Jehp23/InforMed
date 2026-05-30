import { DEMO_PATIENTS } from "@/lib/constants";

function patientInitials(patientId: string) {
  const label = DEMO_PATIENTS.find((p) => p.id === patientId)?.label ?? "";
  const parts = label.replace(/[()]/g, "").split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return label.slice(0, 2).toUpperCase() || "PA";
}

export function PatientBanner({
  patientId,
  subtitle,
  greeting,
  variant = "neutral",
  actions,
  children,
}: {
  patientId: string;
  subtitle?: string;
  greeting?: string;
  variant?: "neutral" | "patient";
  actions?: React.ReactNode;
  children?: React.ReactNode;
}) {
  const currentPatient = DEMO_PATIENTS.find((p) => p.id === patientId);
  const accent =
    variant === "patient"
      ? "border-l-4 border-med-secondary bg-gradient-to-br from-white to-med-secondary-soft/30"
      : "";

  return (
    <section className={`med-card mb-6 overflow-hidden p-0 ${variant === "patient" ? "border-med-secondary/20" : ""}`}>
      <div className={`p-5 md:p-6 ${accent}`}>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex gap-4">
          <div
            className={`grid h-12 w-12 flex-shrink-0 place-items-center rounded-full font-fraunces text-lg font-semibold text-white ${
              variant === "patient"
                ? "bg-gradient-to-br from-med-secondary to-med-secondary-hover"
                : "bg-gradient-to-br from-med-ink to-med-secondary"
            }`}
          >
            {patientInitials(patientId)}
          </div>
          <div>
            {greeting && (
              <p className="text-sm font-medium text-med-secondary">{greeting}</p>
            )}
            <h1 className="font-fraunces text-xl font-semibold text-med-ink">
              {currentPatient?.label ?? patientId}
            </h1>
            <p className="mt-0.5 text-sm text-med-muted">
              {subtitle ?? "Historia clínica compartida entre hospitales"}
            </p>
            {variant !== "patient" && (
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-med-secondary-soft px-2.5 py-1 text-[11px] font-semibold text-med-secondary">
                <span className="h-1.5 w-1.5 rounded-full bg-med-secondary-hover" />
                Historial verificado
              </div>
            )}
          </div>
        </div>
        {actions}
      </div>
      {children && <div className="mt-5 border-t border-med-line/80 pt-5">{children}</div>}
      </div>
    </section>
  );
}

export function PatientInfoGrid({
  items,
}: {
  items: { label: string; value: React.ReactNode }[];
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <div key={item.label}>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-med-muted">
            {item.label}
          </p>
          <div className="mt-1 text-sm text-med-ink">{item.value}</div>
        </div>
      ))}
    </div>
  );
}
