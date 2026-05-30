"use client";

import { useState } from "react";
import { Logo } from "@/components/ui/logo";
import { ArkivLoginForm } from "@/components/auth/arkiv-login-form";
import { JUDGE_COPY } from "@/lib/ui-copy";
import type { LoginSession } from "@/lib/types";

export function LandingPage({
  onLoginSuccess,
}: {
  onLoginSuccess?: (session: LoginSession, remember: boolean) => void;
}) {
  const [view, setView] = useState<"home" | "login">("home");

  const goToLogin = () => setView("login");

  const goToHome = () => {
    setView("home");
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  const scrollToSection = (id: string) => {
    setView("home");
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    });
  };

  return (
    <div className="min-h-screen">
      {view === "home" ? (
        <>
          <nav className="sticky top-0 z-50 border-b border-med-line bg-[rgba(244,241,233,0.88)] backdrop-blur-md">
            <div className="mx-auto flex h-[72px] max-w-[1180px] items-center justify-between gap-4 px-5 md:px-7">
              <button type="button" onClick={goToHome} className="cursor-pointer">
                <Logo />
              </button>

              <div className="hidden items-center gap-7 lg:flex">
                {[
                  { label: "Inicio", action: goToHome },
                  { label: "Funciones", action: () => scrollToSection("features") },
                  { label: "Cómo funciona", action: () => scrollToSection("como") },
                  { label: "Para jurado", action: () => scrollToSection("arkiv") },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={item.action}
                    className="cursor-pointer text-[14.5px] font-medium text-med-ink-soft transition-colors hover:text-med-ink"
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={goToLogin}
                className="inline-flex rounded-[999px] bg-med-secondary px-4 py-2 text-[13.5px] font-semibold text-white shadow-[0_8px_22px_-10px_var(--med-secondary)] transition hover:-translate-y-0.5"
              >
                Ingresar
              </button>
            </div>
          </nav>

          <HomeView onStart={goToLogin} onScrollTo={scrollToSection} />
        </>
      ) : (
        <LoginView onLoginSuccess={onLoginSuccess} onBack={goToHome} />
      )}
    </div>
  );
}

function HomeView({
  onStart,
  onScrollTo,
}: {
  onStart: () => void;
  onScrollTo: (id: string) => void;
}) {
  return (
    <div>
      <header className="relative overflow-hidden py-16 pb-14 md:py-[84px] md:pb-[70px] med-dot-grid">
        <div className="absolute inset-0 z-0 bg-[radial-gradient(120%_90%_at_80%_-10%,rgba(22,184,134,.16),transparent_55%),radial-gradient(90%_70%_at_0%_100%,rgba(14,46,41,.06),transparent_60%)]" />
        <div className="relative z-10 mx-auto grid max-w-[1180px] items-center gap-10 px-5 md:gap-[54px] md:px-7 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="animate-fade-up">
            <span className="mb-[22px] inline-flex items-center gap-2 rounded-[999px] bg-med-secondary-soft px-3 py-1.5 text-[12.5px] font-semibold tracking-[0.04em] text-med-secondary">
              <span className="w-[7px] h-[7px] rounded-full bg-med-secondary-hover shadow-[0_0_0_4px_rgba(22,184,134,.25)]"></span>
              Fácil acceso a tu historial clínico
            </span>
            <h1 className="font-fraunces text-[clamp(38px,5.4vw,58px)] font-semibold leading-[1.08] tracking-[-0.02em]">
              Tu historia clínica,{" "}
              <span className="font-semibold text-med-secondary">siempre accesible</span> y
              verificable.
            </h1>
            <p className="text-[19px] text-med-ink-soft max-w-[30em] my-6">
              InforMed conecta médicos y pacientes en una plataforma segura donde registrar y acceder a historiales clínicos con respaldo verificable e imborrable. Sin perder el archivo, sin depender de un solo servidor.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" onClick={onStart} className="med-btn-primary">
                Empezar ahora
                <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 6l6 6-6 6"/>
                </svg>
              </button>
              <button type="button" onClick={() => onScrollTo("como")} className="med-btn-secondary">
                Ver cómo funciona
              </button>
            </div>
            <div className="flex gap-2 items-center mt-[26px] text-[13.5px] text-med-muted">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-med-secondary">
                <path d="M9 12l2 2 4-4"/>
                <circle cx="12" cy="12" r="9"/>
              </svg>
              Cada registro queda firmado, fechado y trazable — con la experiencia de una app clínica común.
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:max-w-none animate-fade-up [animation-delay:120ms]">
            <div className="absolute top-[-22px] left-[-30px] bg-white border border-med-line rounded-[14px] px-3.5 py-2.5 shadow-[0_24px_60px_-28px_rgba(14,46,41,.45)] flex items-center gap-2.5 text-[13px] font-semibold animate-[bob_5s_ease-in-out_infinite]">
              <span className="w-[30px] h-[30px] rounded-[9px] grid place-items-center text-white" style={{ background: "var(--med-coral)" }}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M12 9v4M12 17h.01"/>
                  <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/>
                </svg>
              </span>
              Alerta de alergia
            </div>
            <div className="absolute bottom-[-26px] right-[-22px] bg-white border border-med-line rounded-[14px] px-3.5 py-2.5 shadow-[0_24px_60px_-28px_rgba(14,46,41,.45)] flex items-center gap-2.5 text-[13px] font-semibold animate-[bob_5s_ease-in-out_infinite]" style={{ animationDelay: "1.2s" }}>
              <span className="w-[30px] h-[30px] rounded-[9px] grid place-items-center text-white bg-med-secondary">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5"/>
                </svg>
              </span>
              Historial verificado
            </div>

            <div className="med-card relative p-6">
              <div className="flex items-center gap-3 pb-4 border-b border-dashed border-med-line">
                <div className="w-[46px] h-[46px] rounded-[13px] bg-gradient-to-br from-med-ink to-med-secondary text-white grid place-items-center font-fraunces text-[18px] flex-shrink-0">MG</div>
                <div>
                  <b className="text-[15.5px] block">María González</b>
                  <span className="text-[12.5px] text-med-muted">HC 04821 · 47 años · F</span>
                </div>
                <div className="ml-auto flex items-center gap-1.5 text-[11px] font-semibold text-med-secondary bg-med-secondary-soft px-2.5 py-1 rounded-[999px] whitespace-nowrap">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
                    <path d="M20 6 9 17l-5-5"/>
                  </svg>
                  Verificado
                </div>
              </div>
              <div className="flex justify-between items-start py-3 border-b border-med-line">
                <span className="text-[11.5px] uppercase tracking-[0.08em] text-med-muted font-semibold">Ingreso</span>
                <span className="text-[14.5px] text-right max-w-[62%]">29/05/2026 · Guardia · Dr. Pérez</span>
              </div>
              <div className="flex justify-between items-start py-3 border-b border-med-line">
                <span className="text-[11.5px] uppercase tracking-[0.08em] text-med-muted font-semibold">Alergias</span>
                <span className="text-[14.5px] text-right max-w-[62%]">
                  <div className="flex gap-1.5 flex-wrap justify-end">
                    <span className="text-[11.5px] font-semibold px-2.5 py-0.5 rounded-[999px] bg-[rgba(224,101,76,.13)] text-med-coral">Penicilina</span>
                    <span className="text-[11.5px] font-semibold px-2.5 py-0.5 rounded-[999px] bg-[rgba(224,101,76,.13)] text-med-coral">AINEs</span>
                  </div>
                </span>
              </div>
              <div className="flex justify-between items-start py-3 border-b border-med-line">
                <span className="text-[11.5px] uppercase tracking-[0.08em] text-med-muted font-semibold">Diagnóstico</span>
                <span className="text-[14.5px] text-right max-w-[62%]">Hipertensión · seguimiento</span>
              </div>
              <div className="flex justify-between items-start py-3">
                <span className="text-[11.5px] uppercase tracking-[0.08em] text-med-muted font-semibold">Estado</span>
                <span className="text-[14.5px] text-right max-w-[62%]">
                  <div className="flex gap-1.5 flex-wrap justify-end">
                    <span className="text-[11.5px] font-semibold px-2.5 py-0.5 rounded-[999px] bg-[rgba(14,140,107,.12)] text-med-secondary">Estable</span>
                  </div>
                </span>
              </div>
              <div className="mt-4 flex items-center gap-2 rounded-[10px] border border-med-line bg-med-primary px-3 py-2 text-[11px] text-med-muted">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3 flex-shrink-0 text-med-secondary">
                  <path d="M20 6 9 17l-5-5"/>
                </svg>
                Respaldo verificable · inmutable · compartido entre hospitales
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Trust Strip */}
      <div className="border-y border-med-line bg-med-primary-2">
        <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-center gap-x-8 gap-y-4 px-5 py-5 md:justify-between md:px-7">
          <span className="flex items-center gap-2 text-[13.5px] font-medium text-med-ink-soft">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px] text-med-secondary">
              <rect x="3" y="11" width="18" height="11" rx="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            Registros con respaldo verificable
          </span>
          <span className="text-[13.5px] text-med-ink-soft font-medium flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px] text-med-secondary">
              <path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0z"/>
              <path d="M12 7v5l3 2"/>
            </svg>
            Historial imborrable
          </span>
          <span className="text-[13.5px] text-med-ink-soft font-medium flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px] text-med-secondary">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            Disponible siempre, sin un único servidor
          </span>
          <span className="text-[13.5px] text-med-ink-soft font-medium flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px] text-med-secondary">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
            </svg>
            Portable entre instituciones
          </span>
        </div>
      </div>

      {/* Features Section - Both Roles */}
      <section className="relative overflow-hidden py-16 md:py-[100px] med-dot-grid" id="features">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-med-primary-2/30 to-transparent" />
        <div className="relative z-10 mx-auto max-w-[1180px] px-5 md:px-7">
          <div className="text-center mb-[70px]">
            <div className="inline-flex items-center gap-2 text-[12.5px] font-semibold tracking-[0.14em] uppercase text-med-secondary bg-med-secondary-soft px-4 py-2 rounded-[999px] mb-[20px]">
              <span className="w-[8px] h-[8px] rounded-full bg-med-secondary-hover shadow-[0_0_0_4px_rgba(22,184,134,.25)]"></span>
              Para médicos y pacientes
            </div>
            <h2 className="mb-6 font-fraunces text-[clamp(32px,4vw,46px)] font-semibold leading-[1.08] tracking-[-0.02em]">
              Una plataforma para{" "}
              <span className="font-semibold text-med-secondary">todos</span>.
            </h2>
            <p className="text-[18px] text-med-ink-soft max-w-[600px] mx-auto">
              InforMed conecta médicos y pacientes en una sola plataforma segura donde registrar y acceder a historiales clínicos con respaldo verificable.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Doctors Column */}
            <div className="relative">
              <div className="absolute -top-8 -left-8 w-32 h-32 bg-med-secondary/10 rounded-full blur-3xl"></div>
              <div className="relative">
                <div className="mb-8 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-med-secondary to-med-secondary-hover flex items-center justify-center shadow-lg">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-fraunces text-[26px] font-medium">Para el equipo médico</h3>
                    <p className="text-[15px] text-med-ink-soft">Todo el registro clínico, en un solo flujo simple.</p>
                  </div>
                </div>
                <div className="space-y-5">
                  <div className="group bg-white border border-med-line rounded-[20px] p-7 transition-all duration-300 relative overflow-hidden hover:shadow-[0_20px_50px_-20px_rgba(14,46,41,.3)] hover:border-med-secondary/30 hover:-translate-y-1">
                    <div className="absolute inset-0 bg-gradient-to-br from-med-secondary/0 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="flex items-start gap-5 relative z-1">
                      <div className="w-[52px] h-[52px] rounded-[14px] bg-gradient-to-br from-med-secondary to-med-secondary-hover grid place-items-center text-white flex-shrink-0 shadow-lg">
                        <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                          <path d="M14 2v6h6M12 18v-6M9 15h6"/>
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-fraunces text-[20px] font-medium mb-2 text-med-ink">Crear registros</h4>
                        <p className="text-[15px] text-med-ink-soft leading-relaxed">Ingresos, consultas y evolución del paciente con campos claros. Un caso nuevo se carga en pocos toques.</p>
                      </div>
                    </div>
                  </div>
                  <div className="group bg-white border border-med-line rounded-[20px] p-7 transition-all duration-300 relative overflow-hidden hover:shadow-[0_20px_50px_-20px_rgba(14,46,41,.3)] hover:border-med-secondary/30 hover:-translate-y-1">
                    <div className="absolute inset-0 bg-gradient-to-br from-med-secondary/0 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="flex items-start gap-5 relative z-1">
                      <div className="w-[52px] h-[52px] rounded-[14px] bg-gradient-to-br from-med-coral to-[#e05a4a] grid place-items-center text-white flex-shrink-0 shadow-lg">
                        <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                          <path d="M12 9v4M12 17h.01"/>
                          <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/>
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-fraunces text-[20px] font-medium mb-2 text-med-ink">Alergias y alertas</h4>
                        <p className="text-[15px] text-med-ink-soft leading-relaxed">Marcá alergias y contraindicaciones que saltan visibles para cualquier médico antes de medicar.</p>
                      </div>
                    </div>
                  </div>
                  <div className="group bg-white border border-med-line rounded-[20px] p-7 transition-all duration-300 relative overflow-hidden hover:shadow-[0_20px_50px_-20px_rgba(14,46,41,.3)] hover:border-med-secondary/30 hover:-translate-y-1">
                    <div className="absolute inset-0 bg-gradient-to-br from-med-secondary/0 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="flex items-start gap-5 relative z-1">
                      <div className="w-[52px] h-[52px] rounded-[14px] bg-gradient-to-br from-med-ink to-[#1a3a2e] grid place-items-center text-white flex-shrink-0 shadow-lg">
                        <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                          <path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0z"/>
                          <path d="M12 7v5l3 2"/>
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-fraunces text-[20px] font-medium mb-2 text-med-ink">Historial completo</h4>
                        <p className="text-[15px] text-med-ink-soft leading-relaxed">Lo que existe hoy y todo lo que venga después, ordenado en una línea de tiempo que no se puede manipular.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Patients Column */}
            <div className="relative">
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-med-secondary/10 rounded-full blur-3xl"></div>
              <div className="relative">
                <div className="mb-8 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-med-coral to-[#e05a4a] flex items-center justify-center shadow-lg">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-fraunces text-[26px] font-medium">Para pacientes</h3>
                    <p className="text-[15px] text-med-ink-soft">Tu historial clínico, siempre a tu alcance.</p>
                  </div>
                </div>
                <div className="space-y-5">
                  <div className="group bg-white border border-med-line rounded-[20px] p-7 transition-all duration-300 relative overflow-hidden hover:shadow-[0_20px_50px_-20px_rgba(14,46,41,.3)] hover:border-med-secondary/30 hover:-translate-y-1">
                    <div className="absolute inset-0 bg-gradient-to-br from-med-secondary/0 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="flex items-start gap-5 relative z-1">
                      <div className="w-[52px] h-[52px] rounded-[14px] bg-gradient-to-br from-med-secondary to-med-secondary-hover grid place-items-center text-white flex-shrink-0 shadow-lg">
                        <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                          <circle cx="12" cy="7" r="4"/>
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-fraunces text-[20px] font-medium mb-2 text-med-ink">Acceso total</h4>
                        <p className="text-[15px] text-med-ink-soft leading-relaxed">Consultá todos tus registros médicos, desde consultas hasta internaciones, en una sola plataforma segura.</p>
                      </div>
                    </div>
                  </div>
                  <div className="group bg-white border border-med-line rounded-[20px] p-7 transition-all duration-300 relative overflow-hidden hover:shadow-[0_20px_50px_-20px_rgba(14,46,41,.3)] hover:border-med-secondary/30 hover:-translate-y-1">
                    <div className="absolute inset-0 bg-gradient-to-br from-med-secondary/0 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="flex items-start gap-5 relative z-1">
                      <div className="w-[52px] h-[52px] rounded-[14px] bg-gradient-to-br from-med-coral to-[#e05a4a] grid place-items-center text-white flex-shrink-0 shadow-lg">
                        <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                          <circle cx="9" cy="7" r="4"/>
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-fraunces text-[20px] font-medium mb-2 text-med-ink">Compartir con médicos</h4>
                        <p className="text-[15px] text-med-ink-soft leading-relaxed">Autorizá a profesionales de confianza para que accedan a tu historial cuando te atiendan.</p>
                      </div>
                    </div>
                  </div>
                  <div className="group bg-white border border-med-line rounded-[20px] p-7 transition-all duration-300 relative overflow-hidden hover:shadow-[0_20px_50px_-20px_rgba(14,46,41,.3)] hover:border-med-secondary/30 hover:-translate-y-1">
                    <div className="absolute inset-0 bg-gradient-to-br from-med-secondary/0 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="flex items-start gap-5 relative z-1">
                      <div className="w-[52px] h-[52px] rounded-[14px] bg-gradient-to-br from-med-ink to-[#1a3a2e] grid place-items-center text-white flex-shrink-0 shadow-lg">
                        <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-fraunces text-[20px] font-medium mb-2 text-med-ink">Datos seguros</h4>
                        <p className="text-[15px] text-med-ink-soft leading-relaxed">Tu información está protegida con respaldo verificable. Solo vos decidís quién puede verla.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-med-primary-2 py-16 md:py-[84px] med-dot-grid" id="como">
        <div className="mx-auto max-w-[1180px] px-5 md:px-7">
          <div className="max-w-[44em] mb-[50px]">
            <div className="text-[12.5px] font-semibold tracking-[0.14em] uppercase text-med-secondary mb-[14px]">Cómo funciona</div>
            <h2 className="font-fraunces text-[clamp(28px,3.6vw,42px)] font-medium leading-[1.04] tracking-[-0.015em]">De la consulta al respaldo verificable en tres pasos.</h2>
          </div>
          <div className="grid grid-cols-1 overflow-hidden rounded-[20px] border border-med-line bg-white md:grid-cols-3">
            <div className="relative border-b border-med-line p-8 md:border-r md:border-b-0">
              <div className="font-fraunces text-[14px] text-med-secondary font-semibold border-[1.5px] border-med-secondary w-[34px] h-[34px] rounded-full grid place-items-center mb-[18px]">1</div>
              <h3 className="font-fraunces text-[19px] font-medium mb-2">El médico carga</h3>
              <p className="text-[14px] text-med-ink-soft">Iniciás sesión y registrás el ingreso, las alergias o la evolución del paciente desde la web o el celular.</p>
            </div>
            <div className="relative border-b border-med-line p-8 md:border-r md:border-b-0">
              <div className="font-fraunces text-[14px] text-med-secondary font-semibold border-[1.5px] border-med-secondary w-[34px] h-[34px] rounded-full grid place-items-center mb-[18px]">2</div>
              <h3 className="font-fraunces text-[19px] font-medium mb-2">Se guarda de forma segura</h3>
              <p className="text-[14px] text-med-ink-soft">El registro queda firmado, fechado y disponible para cualquier hospital autorizado, sin depender de un solo servidor.</p>
            </div>
            <div className="relative p-8">
              <div className="font-fraunces text-[14px] text-med-secondary font-semibold border-[1.5px] border-med-secondary w-[34px] h-[34px] rounded-full grid place-items-center mb-[18px]">3</div>
              <h3 className="font-fraunces text-[19px] font-medium mb-2">Todos lo ven igual</h3>
              <p className="text-[14px] text-med-ink-soft">El próximo profesional accede al mismo historial verificado, idéntico para todos y a prueba de manipulación.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Arkiv Band Section */}
      <section className="py-16 md:py-[84px]" id="arkiv">
        <div className="mx-auto max-w-[1180px] px-5 md:px-7">
          <div className="relative overflow-hidden rounded-[26px] bg-med-ink p-8 text-med-primary md:p-14">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(255,255,255,.06)_1px,transparent_1px)] bg-[size:26px_26px]" />
            <div className="relative z-10 grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
              <div>
                <span className="inline-flex items-center gap-2 text-[12px] tracking-[0.1em] uppercase text-med-secondary-hover mb-[18px] font-semibold">
                  <span className="w-[7px] h-[7px] rounded-full bg-med-secondary-hover inline-block"></span>
                  {JUDGE_COPY.sectionLabel} · {JUDGE_COPY.tagline}
                </span>
                <h2 className="font-fraunces text-[clamp(26px,3vw,36px)] font-medium leading-[1.04] tracking-[-0.015em] text-white">{JUDGE_COPY.sectionTitle}</h2>
                <p className="text-[rgba(244,241,233,.78)] text-[16.5px] mt-4">{JUDGE_COPY.sectionBody}</p>
              </div>
              <div className="flex flex-col gap-3">
                <div className="bg-[rgba(255,255,255,.06)] border border-[rgba(255,255,255,.13)] rounded-[14px] p-4">
                  <b className="flex items-center gap-2 font-fraunces text-[16px] text-white font-medium">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px] text-med-secondary-hover">
                      <path d="M20 6 9 17l-5-5"/>
                    </svg>
                    Verificable y determinístico
                  </b>
                  <span className="text-[13.5px] text-[rgba(244,241,233,.7)] block mt-1 ml-7">La misma consulta siempre da el mismo resultado. Nadie reescribe el pasado.</span>
                </div>
                <div className="bg-[rgba(255,255,255,.06)] border border-[rgba(255,255,255,.13)] rounded-[14px] p-4">
                  <b className="flex items-center gap-2 font-fraunces text-[16px] text-white font-medium">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px] text-med-secondary-hover">
                      <path d="M21 12a9 9 0 1 1-6.2-8.5"/>
                      <path d="M21 4v6h-6"/>
                    </svg>
                    Consultable como una BD
                  </b>
                  <span className="text-[13.5px] text-[rgba(244,241,233,.7)] block mt-1 ml-7">CRUD e índices reales: lo guardás y lo buscás como en cualquier base de datos.</span>
                </div>
                <div className="bg-[rgba(255,255,255,.06)] border border-[rgba(255,255,255,.13)] rounded-[14px] p-4">
                  <b className="flex items-center gap-2 font-fraunces text-[16px] text-white font-medium">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px] text-med-secondary-hover">
                      <path d="M12 2v20M2 12h20"/>
                    </svg>
                    Siempre disponible
                  </b>
                  <span className="text-[13.5px] text-[rgba(244,241,233,.7)] block mt-1 ml-7">Sin un único punto de falla — el historial no desaparece si se cae un servidor.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-8 border-t border-med-line py-10 md:mt-[30px] md:py-12">
        <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-4 px-5 md:px-7">
          <Logo size="sm" />
          <small className="text-[13px] text-med-muted">Hackathon Arkiv · Puna Tech 2026 · Salto, Argentina</small>
        </div>
      </footer>
    </div>
  );
}

function LoginView({
  onLoginSuccess,
  onBack,
}: {
  onLoginSuccess?: (session: LoginSession, remember: boolean) => void;
  onBack: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-med-primary">
      <header className="sticky top-0 z-50 flex h-[60px] shrink-0 items-center gap-4 border-b border-med-line bg-white px-4 shadow-[0_1px_0_rgba(14,46,41,.06)] sm:px-6">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-med-line bg-white px-3.5 text-sm font-semibold text-med-ink shadow-[var(--med-shadow-soft)] transition hover:border-med-secondary/40 hover:bg-med-primary-2"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4 text-med-secondary"
            aria-hidden
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Volver
        </button>
        <div className="hidden h-6 w-px bg-med-line sm:block" aria-hidden />
        <Logo size="sm" />
      </header>

      <div className="grid flex-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        <aside className="relative order-2 hidden overflow-hidden bg-med-ink text-med-primary lg:order-1 lg:flex lg:flex-col lg:justify-between lg:p-12">
          <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,.05)_1px,transparent_1px)] bg-[size:24px_24px]" />
          <div className="relative z-10">
            <Logo light />
          </div>
          <div className="relative z-10 max-w-md">
            <h2 className="font-fraunces text-[clamp(26px,3vw,40px)] font-medium leading-[1.06] tracking-[-0.015em] text-white">
              Tu historial clínico,{" "}
              <span className="text-med-secondary-hover">en un solo paso</span>
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-[rgba(244,241,233,.78)]">
              Ingresá con tu correo. InforMed activa tu Arkiv ID automáticamente — sin contraseñas
              ni configuración técnica.
            </p>
            <ul className="mt-8 space-y-3 text-sm text-[rgba(244,241,233,.85)]">
              {[
                "Elegís si sos profesional de la salud o paciente",
                "Completás correo y nombre",
                "Accedés al historial compartido entre hospitales",
              ].map((step, i) => (
                <li key={step} className="flex gap-3">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-med-secondary/25 text-xs font-bold text-med-secondary-hover">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ul>
          </div>
          <p className="relative z-10 text-xs text-[rgba(244,241,233,.5)]">
            {JUDGE_COPY.tagline} · infraestructura Arkiv
          </p>
        </aside>

        <main className="order-1 flex flex-col justify-center px-5 py-8 sm:px-10 lg:order-2 lg:px-14 lg:py-12">
          <div className="mx-auto w-full max-w-[400px]">
            <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-med-secondary">
              Acceso
            </p>
            <h1 className="mt-1 font-fraunces text-[clamp(28px,4vw,34px)] font-medium text-med-ink">
              Ingresá a InforMed
            </h1>
            <p className="mt-2 text-sm text-med-ink-soft">
              Solo tu correo. Tu Arkiv ID se crea o recupera al continuar.
            </p>

            <div className="mt-8">
              <ArkivLoginForm
                onSuccess={(session, remember) => onLoginSuccess?.(session, remember)}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
