"use client";

import { useEffect, useState } from "react";
import { MedtrailApp } from "@/components/medtrail-app";
import { LandingPage } from "@/components/landing-page";
import { PatientView } from "@/components/patient-view";
import { fetchJson } from "@/lib/api-client";
import { clearSession, loadSession, saveSession } from "@/lib/session-storage";
import { UI_COPY } from "@/lib/ui-copy";
import type { LoginSession } from "@/lib/types";
import type { WelcomeNotice } from "@/components/ui/session-welcome-banner";

export default function Home() {
  const [session, setSession] = useState<LoginSession | null>(null);
  const [welcomeNotice, setWelcomeNotice] = useState<WelcomeNotice | null>(null);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    const saved = loadSession();
    if (!saved?.arkivId) {
      setBooting(false);
      return;
    }

    void (async () => {
      const { ok, data } = await fetchJson<{
        arkivId?: string;
        userKey?: string;
        displayName?: string;
        role?: LoginSession["role"];
      }>(`/api/identity?arkivId=${encodeURIComponent(saved.arkivId)}`);

      if (ok && data?.arkivId) {
        setSession({
          ...saved,
          arkivId: data.arkivId,
          userKey: data.userKey ?? saved.userKey,
          displayName: data.displayName ?? saved.displayName,
          role: data.role ?? saved.role,
          isNewIdentity: false,
        });
      } else {
        clearSession();
      }
      setBooting(false);
    })();
  }, []);

  const handleLogin = (next: LoginSession, remember: boolean) => {
    if (remember) saveSession(next);
    else clearSession();
    setWelcomeNotice({
      isNewIdentity: next.isNewIdentity,
      displayName: next.displayName,
      arkivId: next.arkivId,
    });
    setSession(next);
  };

  const handleLogout = () => {
    clearSession();
    setSession(null);
    setWelcomeNotice(null);
  };

  if (booting) {
    return (
      <div
        className="grid min-h-screen place-items-center bg-med-primary text-sm text-med-muted"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        {UI_COPY.sessionCheck}
      </div>
    );
  }

  if (session) {
    if (session.role === "doctor") {
      return (
        <MedtrailApp
          session={session}
          onLogout={handleLogout}
          welcomeNotice={welcomeNotice}
          onDismissWelcome={() => setWelcomeNotice(null)}
        />
      );
    }
    return (
      <PatientView
        session={session}
        onLogout={handleLogout}
        welcomeNotice={welcomeNotice}
        onDismissWelcome={() => setWelcomeNotice(null)}
      />
    );
  }

  return <LandingPage onLoginSuccess={handleLogin} />;
}
