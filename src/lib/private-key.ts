/** Normaliza PRIVATE_KEY: acepta con o sin prefijo 0x (64 hex). */
export function normalizePrivateKey(raw: string | undefined): `0x${string}` | null {
  if (!raw?.trim()) return null;

  let key = raw.trim().replace(/^["']|["']$/g, "");
  if (!key.startsWith("0x")) {
    if (!/^[0-9a-fA-F]{64}$/.test(key)) return null;
    key = `0x${key}`;
  }

  const hex = key.slice(2);
  if (!/^[0-9a-fA-F]{64}$/.test(hex)) return null;

  return key as `0x${string}`;
}
