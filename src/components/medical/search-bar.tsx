"use client";

import { useState } from "react";

export function SearchBar({ onSearch }: { onSearch: (query: string) => void }) {
  const [query, setQuery] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
  };

  return (
    <div className="relative">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-med-muted"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder="Buscar en historia médica…"
        className="w-full pl-10 pr-4 py-2.5 border border-med-line rounded-lg text-sm text-med-ink placeholder:text-med-muted focus:outline-none focus:border-med-secondary focus:ring-1 focus:ring-med-secondary"
      />
    </div>
  );
}
