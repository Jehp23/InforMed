export async function fetchJson<T>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<{ ok: boolean; status: number; data: T | null; error: string | null }> {
  try {
    const res = await fetch(input, init);
    const text = await res.text();

    let data: T | null = null;
    if (text) {
      try {
        data = JSON.parse(text) as T;
      } catch {
        const snippet = text.slice(0, 120).replace(/\s+/g, " ");
        return {
          ok: false,
          status: res.status,
          data: null,
          error:
            res.status >= 500
              ? `El servidor respondió con error (${res.status}). Detené npm run dev, borrá la carpeta .next (rm -rf .next) y volvé a iniciar.`
              : `Respuesta inválida del servidor: ${snippet}`,
        };
      }
    }

    if (!res.ok) {
      const errBody = data as { error?: string } | null;
      return {
        ok: false,
        status: res.status,
        data,
        error: errBody?.error ?? `Error HTTP ${res.status}`,
      };
    }

    return { ok: true, status: res.status, data, error: null };
  } catch (e) {
    return {
      ok: false,
      status: 0,
      data: null,
      error: e instanceof Error ? e.message : "Error de red",
    };
  }
}
