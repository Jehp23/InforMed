"use client";

import { entityExplorerUrl, txExplorerUrl } from "@/lib/arkiv-explorer";
import { UI_COPY } from "@/lib/ui-copy";

export function ArkivVerifyLinks({
  entityKey,
  txHash,
  layout = "stack",
}: {
  entityKey: string;
  txHash?: string;
  layout?: "stack" | "inline";
}) {
  if (!entityKey?.trim()) return null;

  const links = [
    {
      href: entityExplorerUrl(entityKey),
      label: UI_COPY.verifyEntityLink,
    },
    ...(txHash?.trim()
      ? [{ href: txExplorerUrl(txHash), label: UI_COPY.verifyTxLink }]
      : []),
  ];

  return (
    <div
      className={
        layout === "inline"
          ? "flex flex-wrap gap-2"
          : "flex flex-col gap-2 sm:flex-row sm:flex-wrap"
      }
    >
      {links.map((link) => (
        <a
          key={link.href}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg border border-med-secondary/35 bg-white px-3 py-2 text-xs font-semibold text-med-secondary transition hover:bg-med-secondary-soft"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-3.5 w-3.5 shrink-0"
            aria-hidden
          >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 20 9" />
          </svg>
          {link.label}
        </a>
      ))}
    </div>
  );
}

export function toastPayloadWithArkivVerify(
  base: { title: string; message?: string; verified?: boolean },
  verify?: { entityKey?: string; txHash?: string },
) {
  if (!verify?.entityKey) return base;
  return {
    ...base,
    verified: true,
    verify: { entityKey: verify.entityKey, txHash: verify.txHash },
  };
}
