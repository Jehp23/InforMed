/** Código corto y legible para mostrar en UI (no es la clave on-chain completa). */
export function formatFriendlyArkivId(arkivId: string): string {
  const hex = arkivId.replace(/^0x/i, "");
  if (hex.length < 6) return `IM-${hex.toUpperCase()}`;
  return `IM-${hex.slice(0, 6).toUpperCase()}`;
}
