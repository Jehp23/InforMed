"use client";

import { useCallback, useState } from "react";

import { DEMO_ACCOUNTS, getDemoAccount } from "@/lib/constants";
import { fetchJson } from "@/lib/api-client";
import { UI_COPY } from "@/lib/ui-copy";
import type { LoginSession, UserRole } from "@/lib/types";

type Props = {
  onSuccess: (session: LoginSession, remember: boolean) => void;
};

export function ArkivLoginForm({ onSuccess }: Props) {
  const defaultDoctor = getDemoAccount("doctor")!;
  const [email, setEmail] = useState<string>(defaultDoctor.email);
  const [displayName, setDisplayName] = useState<string>(defaultDoctor.displayName);
  const [role, setRole] = useState<UserRole>("doctor");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const emailValid = email.trim().includes("@");

  const loginWith = useCallback(
    async (input: {
      email: string;
      displayName: string;
      role: UserRole;
      remember: boolean;
    }) => {
      setError("");
      const normalizedEmail = input.email.trim().toLowerCase();

      if (!normalizedEmail.includes("@")) {
        setError("Ingresá un correo válido.");
        return;
      }

      setSubmitting(true);
      try {
        const { ok, data, error: apiError } = await fetchJson<{
          arkivId?: string;
          userKey?: string;
          displayName?: string;
          role?: UserRole;
          isNew?: boolean;
          txHash?: string;
          error?: string;
        }>("/api/identity", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: normalizedEmail,
            role: input.role,
            displayName: input.displayName.trim() || undefined,
          }),
        });

        if (!ok || !data?.arkivId || !data.userKey) {
          throw new Error(apiError ?? data?.error ?? "No se pudo activar tu cuenta");
        }

        onSuccess(
          {
            role: data.role ?? input.role,
            email: normalizedEmail,
            arkivId: data.arkivId,
            userKey: data.userKey,
            displayName:
              data.displayName ??
              (input.displayName.trim() || normalizedEmail.split("@")[0] || "Usuario"),
            txHash: data.txHash,
            isNewIdentity: data.isNew ?? false,
          },
          input.remember,
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al acceder");
      } finally {
        setSubmitting(false);
      }
    },
    [onSuccess],
  );

  const applyDemoAccount = (account: (typeof DEMO_ACCOUNTS)[number]) => {
    setRole(account.role);
    setEmail(account.email);
    setDisplayName(account.displayName);
  };

  const handleRoleChange = (nextRole: UserRole) => {
    setRole(nextRole);
    const demo = getDemoAccount(nextRole);
    if (demo) {
      setEmail(demo.email);
      setDisplayName(demo.displayName);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void loginWith({ email, displayName, role, remember });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-xl border border-med-coral/30 bg-[rgba(224,101,76,.08)] px-4 py-3 text-sm text-med-coral">
          {error}
        </div>
      )}

      <div className="flex gap-2">
        {(["doctor", "patient"] as const).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => handleRoleChange(r)}
            className={`flex flex-1 items-center justify-center rounded-xl border px-2 py-3 text-center text-[13px] font-semibold leading-snug transition sm:px-3 sm:text-sm ${
              role === r
                ? "border-med-secondary bg-med-secondary text-white shadow-[0_6px_18px_-8px_var(--med-secondary)]"
                : "border-med-line-strong bg-white text-med-muted hover:border-med-secondary/35 hover:text-med-ink"
            }`}
          >
            {r === "doctor" ? UI_COPY.roleDoctor : UI_COPY.rolePatient}
          </button>
        ))}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-med-ink-soft">Correo</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="med-input"
          placeholder="tu@correo.com"
          autoComplete="email"
          required
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-med-ink-soft">
          Nombre completo
        </label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="med-input"
          placeholder="María González"
          autoComplete="name"
        />
      </div>

      <label className="flex cursor-pointer items-center gap-2.5 text-sm text-med-ink-soft">
        <input
          type="checkbox"
          checked={remember}
          onChange={(e) => setRemember(e.target.checked)}
          className="accent-med-secondary"
        />
        Recordarme en este dispositivo
      </label>

      <button
        type="submit"
        disabled={!emailValid || submitting}
        className={`med-btn-primary flex w-full justify-center py-3.5 text-[15px] ${
          !emailValid || submitting ? "cursor-not-allowed opacity-50" : ""
        }`}
        aria-busy={submitting}
      >
        {submitting ? UI_COPY.loginCreatingId : UI_COPY.loginContinue}
      </button>

      <details className="rounded-xl border border-med-line bg-white/80">
        <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-med-ink marker:content-none [&::-webkit-details-marker]:hidden">
          Cuentas demo
        </summary>
        <div className="space-y-3 border-t border-med-line px-4 pb-4 pt-3">
          <p className="text-xs leading-relaxed text-med-muted">
            <span className="font-semibold text-med-secondary">1.</span> Profesional de la salud
            registra evento ·{" "}
            <span className="font-semibold text-med-secondary">2.</span> Paciente ve el mismo
            historial
          </p>
          <div className="flex flex-col gap-2">
            {DEMO_ACCOUNTS.map((account) => (
              <button
                key={account.email}
                type="button"
                disabled={submitting}
                onClick={() => {
                  applyDemoAccount(account);
                  void loginWith({
                    email: account.email,
                    displayName: account.displayName,
                    role: account.role,
                    remember,
                  });
                }}
                className="flex flex-col items-start rounded-lg border border-med-secondary/20 bg-med-secondary-soft/40 px-3 py-2.5 text-left transition hover:border-med-secondary/45 disabled:opacity-50"
              >
                <span className="text-sm font-semibold text-med-ink">{account.label}</span>
                <span className="mt-0.5 text-[11px] text-med-secondary">{account.email}</span>
              </button>
            ))}
          </div>
        </div>
      </details>
    </form>
  );
}
