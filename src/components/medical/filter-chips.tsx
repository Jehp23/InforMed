"use client";

const FILTERS = [
  { id: "all", label: "Todos" },
  { id: "allergies", label: "Alergias" },
  { id: "hospitalizations", label: "Internaciones" },
  { id: "consultations", label: "Consultas" },
  { id: "studies", label: "Estudios" },
  { id: "medications", label: "Medicamentos" },
  { id: "surgeries", label: "Cirugías" },
];

export function FilterChips({ activeFilter, onFilterChange }: { activeFilter: string; onFilterChange: (filter: string) => void }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
      {FILTERS.map((filter) => (
        <button
          key={filter.id}
          onClick={() => onFilterChange(filter.id)}
          className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            activeFilter === filter.id
              ? "bg-med-secondary text-white"
              : "bg-white border border-med-line text-med-muted hover:border-med-secondary"
          }`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
