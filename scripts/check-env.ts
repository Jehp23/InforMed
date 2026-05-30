import { readFileSync, existsSync } from "fs";

const path = ".env";
if (!existsSync(path)) {
  console.log("❌ No existe .env — copiá: copy .env.example .env");
  process.exit(1);
}

const line = readFileSync(path, "utf8")
  .split(/\r?\n/)
  .find((l) => l.trim().startsWith("PRIVATE_KEY"));

if (!line) {
  console.log("❌ No hay línea PRIVATE_KEY= en .env");
  process.exit(1);
}

import { normalizePrivateKey } from "../src/lib/private-key";

const raw = line.slice(line.indexOf("=") + 1);
const normalized = normalizePrivateKey(raw);

const issues: string[] = [];
const key = raw.trim().replace(/^["']|["']$/g, "");

if (/TU_CLAVE|example|your_|aqui/i.test(key)) {
  issues.push("Parece el texto de ejemplo, no una clave real.");
}
if (key.split(/\s+/).length >= 12) {
  issues.push(
    "Parece una frase semilla (12+ palabras). Necesitás la CLAVE PRIVADA hex, no el mnemonic.",
  );
}
if (!normalized) {
  const hex = key.startsWith("0x") ? key.slice(2) : key;
  if (!/^[0-9a-fA-F]*$/.test(hex)) {
    issues.push("Solo caracteres 0-9 y a-f (sin espacios ni ñ).");
  }
  if (hex.length !== 64) {
    issues.push(`Longitud: ${hex.length} hex (deben ser 64). ¿Pegaste la address pública?`);
  }
}
if (/\s/.test(raw)) {
  issues.push("Hay espacios en el valor — quitálos.");
}

if (issues.length === 0 && normalized) {
  console.log("✅ Formato OK (64 caracteres hex).");
  if (!key.startsWith("0x")) {
    console.log('   Tip: podés agregar "0x" al inicio; el proyecto lo acepta igual.');
  }
  console.log(
    "   Si hello-arkiv falla con insufficient funds → faucet Braga con tu address pública.",
  );
} else {
  console.log("❌ La PRIVATE_KEY en .env no es válida:\n");
  for (const i of issues) console.log("   •", i);
  console.log(
    "\nFormato:\n   PRIVATE_KEY=0x + 64 hex\n   o PRIVATE_KEY= + 64 hex (sin 0x)",
  );
}
