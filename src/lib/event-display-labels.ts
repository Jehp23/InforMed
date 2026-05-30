import { EVENT_TYPE_LABELS } from "./constants";
import { STRUCTURED_RECORD_TYPE_LABELS } from "./structured-record";

/** Etiqueta en español para chips, tarjetas y modal (no el `type` crudo on-chain). */
export function eventTypeDisplayLabel(typeKey: string): string {
  return (
    STRUCTURED_RECORD_TYPE_LABELS[typeKey] ??
    EVENT_TYPE_LABELS[typeKey] ??
    typeKey.replace(/_/g, " ")
  );
}
