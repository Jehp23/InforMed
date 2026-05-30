export function ClinicalSummary({
  data,
  audience = "doctor",
}: {
  data: {
    allergies: string[];
    currentMedication: string[];
    relevantHistory: string[];
    lastHospitalizations: Array<{ date: string; reason: string; institution: string }>;
    importantSurgeries: Array<{ date: string; procedure: string; institution: string }>;
    pendingDocuments: string[];
    clinicalAlerts: string[];
  };
  audience?: "doctor" | "patient";
}) {
  const isPatient = audience === "patient";

  return (
    <div className={isPatient ? "rounded-2xl border border-med-secondary/25 bg-white p-5 shadow-[var(--med-shadow-soft)]" : "med-panel p-5"}>
      <h2 className="font-display text-lg font-semibold text-med-ink">
        {isPatient ? "Mi resumen de salud" : "Resumen clínico"}
      </h2>
      {!isPatient && (
        <p className="mt-1 text-sm text-med-muted">
          Datos del historial verificado · el asistente ayuda con traslados y borradores
        </p>
      )}

      {isPatient && data.allergies.length > 0 && (
        <div className="mt-4 rounded-xl border border-med-coral/25 bg-[rgba(224,101,76,.08)] p-4">
          <h3 className="text-sm font-semibold text-med-coral">Alergias registradas</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {data.allergies.map((allergy, i) => (
              <span
                key={`${allergy}-${i}`}
                className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-med-coral"
              >
                {allergy}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-5 space-y-5">
        {data.clinicalAlerts.length > 0 && (
          <div className="rounded-xl border border-med-coral/20 bg-[rgba(224,101,76,.06)] p-4">
            <h3 className="mb-2 text-sm font-semibold text-med-coral">A tener en cuenta</h3>
            <ul className="space-y-1 text-sm text-med-ink">
              {data.clinicalAlerts.map((alert, i) => (
                <li key={`${alert}-${i}`}>{alert}</li>
              ))}
            </ul>
          </div>
        )}

        {!isPatient && (
          <div>
            <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-med-muted">
              Alergias
            </h3>
            {data.allergies.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {data.allergies.map((allergy, i) => (
                  <span
                    key={`${allergy}-${i}`}
                    className="rounded-full bg-[rgba(224,101,76,.13)] px-2.5 py-0.5 text-xs font-semibold text-med-coral"
                  >
                    {allergy}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-med-muted">Sin alergias registradas</p>
            )}
          </div>
        )}

        {data.relevantHistory.length > 0 && (
          <div>
            <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-med-muted">
              Antecedentes
            </h3>
            <ul className="space-y-1 text-sm text-med-ink">
              {data.relevantHistory.map((h, i) => (
                <li key={`${h}-${i}`}>{h}</li>
              ))}
            </ul>
          </div>
        )}

        {data.lastHospitalizations.length > 0 && (
          <div>
            <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-med-muted">
              Últimas internaciones
            </h3>
            <div className="space-y-2 text-sm text-med-ink">
              {data.lastHospitalizations.map((hosp, i) => (
                <p key={`${hosp.date}-${hosp.institution}-${i}`}>
                  <span className="font-medium">{hosp.reason}</span>
                  <span className="text-med-muted"> — {hosp.date} · {hosp.institution}</span>
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
