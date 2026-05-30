"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import { MediBotMessageContent } from "@/components/doctor/medibot-message-content";
import { fetchJson } from "@/lib/api-client";
import { llmSourceLabel } from "@/lib/llm-chat";
import type { RecordLinkPhrase } from "@/lib/medibot-record-links";
import { UI_COPY } from "@/lib/ui-copy";
import type { EventType } from "@/lib/types";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  source?: string;
};

const QUICK_PROMPTS = [
  "Brief de traslado",
  "¿Qué alergias hay?",
  "Últimas internaciones",
  "Estudios de laboratorio",
] as const;

const MEDIBOT_LOGO = "/medibot.png";

function newId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Avatar fijo: evita que flex estire la imagen en vertical. */
function MediBotAvatar({ size = 36, className = "" }: { size?: number; className?: string }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center self-start overflow-hidden rounded-full bg-gradient-to-b from-med-secondary-soft to-white ring-2 ring-white ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src={MEDIBOT_LOGO}
        alt=""
        width={size}
        height={size}
        className="size-[88%] object-contain object-center"
        aria-hidden
      />
    </span>
  );
}

function ChatBody({
  patientLabel,
  messages,
  loading,
  error,
  input,
  disabled,
  onInputChange,
  onSend,
  onApplyDraft,
  lastAssistant,
  scrollRef,
  recordPhrases,
  onOpenRecord,
}: {
  patientLabel: string;
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  input: string;
  disabled: boolean;
  onInputChange: (v: string) => void;
  onSend: (text: string) => void;
  onApplyDraft?: (draft: string, eventType: EventType) => void;
  lastAssistant?: ChatMessage;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  recordPhrases: RecordLinkPhrase[];
  onOpenRecord?: (recordId: string) => void;
}) {
  return (
    <>
      <div
        ref={scrollRef}
        className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-gradient-to-b from-[#f8faf8] to-[#f4f6f4] px-4 py-4 scrollbar-thin"
        role="log"
        aria-live="polite"
      >
        {messages.length === 0 && (
          <div className="space-y-3">
            <div className="rounded-2xl border border-med-secondary/15 bg-white/90 px-4 py-3.5 shadow-sm">
              <p className="text-sm leading-relaxed text-med-ink">
                Hola, soy <span className="font-semibold text-med-secondary">MediBot</span>. Consultá el
                historial verificado de <strong>{patientLabel}</strong>.
              </p>
              <p className="mt-2 text-xs leading-relaxed text-med-muted">{UI_COPY.historialAssistHint}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  disabled={disabled || loading}
                  onClick={() => onSend(prompt)}
                  className="rounded-full border border-med-secondary/20 bg-white px-3 py-1.5 text-xs font-medium text-med-ink-soft shadow-sm transition hover:border-med-secondary/45 hover:bg-med-secondary-soft/40 hover:text-med-secondary disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-2 ${m.role === "user" ? "ml-6 justify-end" : "mr-2"}`}
          >
            {m.role === "assistant" && <MediBotAvatar size={30} />}
            <div className={`min-w-0 max-w-[88%] ${m.role === "user" ? "text-right" : ""}`}>
              <div
                className={
                  m.role === "user"
                    ? "inline-block rounded-2xl rounded-br-sm bg-med-secondary px-3.5 py-2.5 text-left text-sm leading-relaxed text-white shadow-sm"
                    : "inline-block max-w-full rounded-2xl rounded-tl-sm border border-med-secondary/15 bg-gradient-to-br from-white via-white to-med-secondary-soft/30 px-3.5 py-3 shadow-sm"
                }
              >
                {m.role === "user" ? (
                  <p className="whitespace-pre-wrap">{m.content}</p>
                ) : (
                  <MediBotMessageContent
                    content={m.content}
                    recordPhrases={recordPhrases}
                    onOpenRecord={onOpenRecord}
                  />
                )}
              </div>
              {m.role === "assistant" && m.source && (
                <p className="mt-1 text-[10px] text-med-muted">{llmSourceLabel(m.source)}</p>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2.5 text-sm text-med-muted" role="status">
            <MediBotAvatar size={28} />
            <span className="rounded-full bg-white/80 px-3 py-1.5 text-xs shadow-sm">Pensando…</span>
          </div>
        )}

        {messages.some((m) => m.role === "assistant") && onOpenRecord && recordPhrases.length > 0 && (
          <p className="text-center text-[10px] leading-snug text-med-muted">
            Tocá un chip para ver el registro completo en Arkiv.
          </p>
        )}
      </div>

      {error && (
        <p className="mx-4 shrink-0 rounded-xl border border-med-coral/20 bg-[rgba(224,101,76,.06)] px-3 py-2 text-sm text-med-coral">
          {error}
        </p>
      )}

      {lastAssistant && onApplyDraft && lastAssistant.content.length > 20 && (
        <div className="shrink-0 border-t border-med-line/80 bg-white/95 px-4 py-2.5">
          <button
            type="button"
            className="w-full rounded-full border border-med-secondary/25 py-2 text-sm font-medium text-med-secondary transition hover:bg-med-secondary-soft/50"
            onClick={() => onApplyDraft(lastAssistant.content, "note")}
          >
            Usar en registro
          </button>
        </div>
      )}

      <form
        className="shrink-0 border-t border-med-line/80 bg-white px-3 py-3"
        onSubmit={(e) => {
          e.preventDefault();
          onSend(input);
        }}
      >
        <label htmlFor="medibot-chat-input" className="sr-only">
          Mensaje para MediBot
        </label>
        <div className="flex items-end gap-2 rounded-2xl border border-med-line bg-[#fafaf7] p-1.5 focus-within:border-med-secondary/35 focus-within:ring-2 focus-within:ring-med-secondary/10">
          <textarea
            id="medibot-chat-input"
            className="min-h-[2.5rem] flex-1 resize-none border-0 bg-transparent px-2 py-1.5 text-sm text-med-ink outline-none placeholder:text-med-muted"
            placeholder="Escribí tu consulta…"
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            disabled={disabled || loading}
            rows={1}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSend(input);
              }
            }}
          />
          <button
            type="submit"
            disabled={disabled || loading || !input.trim()}
            className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-med-secondary text-white transition hover:bg-med-secondary-hover disabled:opacity-40"
            aria-label="Enviar"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M5 12h12m0 0l-5-5m5 5l-5 5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </form>
    </>
  );
}

/** MediBot: asistente flotante abajo a la derecha (estilo chat familiar). */
export function MediBotWidget({
  open,
  onOpen,
  onClose,
  patientId,
  patientLabel,
  disabled = false,
  onApplyDraft,
  recordPhrases = [],
  onOpenRecord,
}: {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  patientId: string;
  patientLabel: string;
  disabled?: boolean;
  onApplyDraft?: (draft: string, eventType: EventType) => void;
  recordPhrases?: RecordLinkPhrase[];
  onOpenRecord?: (recordId: string) => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [llmReady, setLlmReady] = useState<boolean | null>(null);
  const [expanded, setExpanded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([]);
    setInput("");
    setError(null);
  }, [patientId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (open) return;
    setExpanded(false);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    let cancelled = false;
    void fetchJson<{ configured?: boolean }>("/api/assist/status").then(({ ok, data }) => {
      if (!cancelled) setLlmReady(ok && data ? Boolean(data.configured) : null);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading || disabled) return;

      const userMsg: ChatMessage = { id: newId(), role: "user", content: trimmed };
      const history = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setLoading(true);
      setError(null);

      try {
        const { ok, data, error } = await fetchJson<{
          reply?: string;
          source?: string;
          llmConfigured?: boolean;
          error?: string;
        }>("/api/assist/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            patientId,
            patientLabel,
            message: trimmed,
            history: history.slice(0, -1),
          }),
        });
        const reply = data?.reply;
        if (!ok || !reply) {
          throw new Error(error ?? data?.error ?? "No se pudo obtener respuesta");
        }

        setMessages((prev) => [
          ...prev,
          {
            id: newId(),
            role: "assistant",
            content: reply,
            source: data.source,
          },
        ]);
        if (typeof data.llmConfigured === "boolean") setLlmReady(data.llmConfigured);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    },
    [disabled, loading, messages, patientId, patientLabel],
  );

  const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");

  return (
    <div
      className="pointer-events-none fixed bottom-4 right-4 z-40 flex flex-col items-end gap-3 sm:bottom-5 sm:right-5"
      data-tour="historial-assist"
    >
      {open && (
        <div
          role="dialog"
          aria-modal="false"
          aria-label="MediBot"
          className={`pointer-events-auto flex flex-col overflow-hidden rounded-[1.35rem] border border-med-line/80 bg-white shadow-[0_16px_48px_rgba(14,46,41,.16)] transition-[width,height] duration-200 ${
            expanded
              ? "h-[min(40rem,calc(100vh-5.5rem))] w-[min(calc(100vw-1.5rem),28rem)] sm:h-[calc(100vh-6rem)] sm:w-[min(32rem,calc(100vw-2rem))]"
              : "h-[min(26rem,calc(100vh-6.5rem))] w-[min(20rem,calc(100vw-1.5rem))] sm:w-[22rem]"
          }`}
        >
          <header className="flex shrink-0 items-center gap-3 bg-gradient-to-r from-med-secondary to-[#0a7a5c] px-4 py-3 text-white">
            <MediBotAvatar size={42} className="ring-2 ring-white/30" />
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-base font-semibold tracking-tight">MediBot</h2>
              <p className="truncate text-xs text-white/85">
                {patientLabel}
                {llmReady === true && (
                  <span className="ml-1.5 inline-flex items-center rounded-full bg-white/20 px-1.5 py-px text-[10px] font-medium">
                    IA activa
                  </span>
                )}
                {llmReady === false && (
                  <span className="ml-1.5 text-[10px] text-white/70">Modo básico</span>
                )}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="flex size-8 items-center justify-center rounded-full text-white/90 transition hover:bg-white/15"
                aria-label={expanded ? "Reducir chat" : "Ampliar chat"}
                title={expanded ? "Reducir" : "Ampliar"}
              >
                {expanded ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path
                      d="M9 4H4v5M4 15v5h5M15 4h5v5M20 15v5h-5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path
                      d="M15 3h6v6M9 21H3v-6M21 9V3h-6M3 15v6h6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex size-8 items-center justify-center rounded-full text-white/90 transition hover:bg-white/15"
                aria-label="Cerrar MediBot"
              >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M18 6L6 18M6 6l12 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              </button>
            </div>
          </header>

          <ChatBody
            patientLabel={patientLabel}
            messages={messages}
            loading={loading}
            error={error}
            input={input}
            disabled={disabled}
            onInputChange={setInput}
            onSend={(t) => void sendMessage(t)}
            onApplyDraft={onApplyDraft}
            lastAssistant={lastAssistant}
            scrollRef={scrollRef}
            recordPhrases={recordPhrases}
            onOpenRecord={onOpenRecord}
          />
        </div>
      )}

      <button
        type="button"
        onClick={() => (open ? onClose() : onOpen())}
        disabled={disabled}
        aria-expanded={open}
        aria-label={open ? "Cerrar MediBot" : "Abrir MediBot"}
        className={`pointer-events-auto relative flex size-14 items-center justify-center rounded-full bg-white shadow-[0_8px_28px_rgba(14,46,41,.2)] transition hover:scale-[1.03] disabled:opacity-50 sm:size-[3.75rem] ${
          open ? "ring-2 ring-med-secondary/30" : "ring-2 ring-med-secondary/15"
        }`}
      >
        <span className="flex size-12 items-center justify-center overflow-hidden rounded-full bg-gradient-to-b from-med-secondary-soft to-white sm:size-[3.25rem]">
          <Image
            src={MEDIBOT_LOGO}
            alt="MediBot"
            width={48}
            height={48}
            className="size-10 object-contain sm:size-11"
          />
        </span>
        {!open && llmReady === true && (
          <span
            className="absolute right-0.5 top-0.5 size-3 rounded-full border-2 border-white bg-med-secondary-hover"
            aria-hidden
          />
        )}
      </button>
    </div>
  );
}

/** @deprecated Usar MediBotWidget */
export const HistorialAssistPanel = MediBotWidget;
