import { ENTITY_EXPLORER_BASE, EXPLORER_TX_BASE } from "./constants";

export function entityExplorerUrl(entityKey: string): string {
  return `${ENTITY_EXPLORER_BASE}${entityKey}`;
}

export function txExplorerUrl(txHash: string): string {
  const hash = txHash.startsWith("0x") ? txHash : `0x${txHash}`;
  return `${EXPLORER_TX_BASE}${hash}`;
}
