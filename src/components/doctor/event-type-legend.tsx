"use client";

import {
  EVENT_TYPE_LEGEND_ORDER,
  EVENT_TYPE_STYLE,
} from "@/lib/event-type-colors";
import type { EventType } from "@/lib/types";

export function EventTypeLegend({
  presentTypes,
  compact = true,
}: {
  presentTypes?: Set<EventType>;
  compact?: boolean;
}) {
  const types = EVENT_TYPE_LEGEND_ORDER.filter(
    (t) => !presentTypes || presentTypes.has(t),
  );

  if (types.length === 0) return null;

  return (
    <div
      className={`flex flex-wrap gap-x-3 gap-y-1 rounded-lg border border-med-line/60 bg-white/80 ${
        compact ? "px-2.5 py-1.5" : "px-3 py-2"
      }`}
      aria-label="Colores por tipo de registro"
    >
      {types.map((type) => {
        const style = EVENT_TYPE_STYLE[type];
        return (
          <span
            key={type}
            className="inline-flex items-center gap-1.5 text-[10px] font-medium text-med-muted"
          >
            <span className={`size-2 shrink-0 rounded-full ${style.dot}`} aria-hidden />
            {style.label}
          </span>
        );
      })}
    </div>
  );
}
