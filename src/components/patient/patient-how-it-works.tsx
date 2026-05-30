export function PatientHowItWorks() {
  const items = [
    {
      label: "Hospital",
      text: "Publica ingresos, altas, estudios de laboratorio y episodios de guardia.",
    },
    {
      label: "Institución",
      text: "Respalda cada registro de forma verificable para que no se pierda ni se altere.",
    },
    {
      label: "Profesional",
      text: "Carga alergias, notas y medicación durante tu atención.",
    },
  ] as const;

  return (
    <div className="rounded-2xl border border-med-line bg-white p-4 text-sm shadow-[var(--med-shadow-soft)]">
      <h3 className="font-semibold text-med-ink">¿Quién registra qué?</h3>
      <ul className="mt-3 space-y-3">
        {items.map((item) => (
          <li key={item.label}>
            <p className="text-xs font-semibold uppercase tracking-wide text-med-secondary">
              {item.label}
            </p>
            <p className="mt-0.5 text-med-muted">{item.text}</p>
          </li>
        ))}
      </ul>
      <p className="mt-3 border-t border-med-line/80 pt-3 text-xs text-med-muted">
        Vos podés consultar todo y adjuntar documentación personal complementaria.
      </p>
    </div>
  );
}
