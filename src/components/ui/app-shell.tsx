import { Logo } from "@/components/ui/logo";
import { ArkivIdBadge } from "@/components/ui/arkiv-id-badge";
import { UI_COPY } from "@/lib/ui-copy";
import type { UserRole } from "@/lib/types";

const ROLE_CONFIG = {
  doctor: {
    headerClass: "border-b border-med-line bg-white/95",
    mainClass: "bg-med-primary",
  },
  patient: {
    headerClass: "border-b border-med-secondary/25 bg-gradient-to-r from-med-secondary-soft/50 via-white to-white",
    mainClass: "bg-med-primary",
  },
} as const;

export function AppShell({
  children,
  toolbar,
  onLogout,
  session,
  role = "doctor",
}: {
  children: React.ReactNode;
  toolbar?: React.ReactNode;
  onLogout?: () => void;
  session?: {
    arkivId: string;
    displayName?: string;
    isNewIdentity?: boolean;
  };
  role?: UserRole;
}) {
  const cfg = ROLE_CONFIG[role];

  return (
    <div className="min-h-screen text-med-text">
      <header
        className={`sticky top-0 z-40 backdrop-blur-md ${cfg.headerClass}`}
        style={{
          ["--app-header-h" as string]: toolbar
            ? role === "doctor"
              ? "5.5rem"
              : "7.75rem"
            : "4.25rem",
        }}
      >
        <div className="mx-auto max-w-[90rem] px-4">
          <div className="flex items-center justify-between gap-3 py-2.5">
            <div className="flex min-w-0 items-center gap-2.5">
              <Logo size="sm" />
              {session?.arkivId && (
                <ArkivIdBadge
                  arkivId={session.arkivId}
                  displayName={session.displayName}
                  isNew={session.isNewIdentity}
                  compact
                />
              )}
            </div>
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="shrink-0 rounded-lg border border-med-line bg-white px-3 py-2 text-sm font-medium text-med-ink-soft transition hover:border-med-secondary/40 hover:text-med-ink"
              >
                Cerrar sesión
              </button>
            )}
          </div>

          {toolbar && (
            <div className="border-t border-med-line/50 py-2.5">{toolbar}</div>
          )}
        </div>
      </header>

      <main
        className={`mx-auto max-w-[90rem] px-4 ${role === "doctor" ? "py-0" : "py-6"} ${cfg.mainClass}`}
      >
        {children}
      </main>
      <footer className="border-t border-med-line bg-white/80 px-4 py-5 text-center text-xs leading-relaxed text-med-muted">
        {role === "patient" ? UI_COPY.appFooterPatient : UI_COPY.appFooterDoctor}
      </footer>
    </div>
  );
}
