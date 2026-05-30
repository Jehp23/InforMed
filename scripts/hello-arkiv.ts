import { config } from "dotenv";
import {
  createPublicClient,
  createWalletClient,
  http,
} from "@arkiv-network/sdk";
import { privateKeyToAccount } from "@arkiv-network/sdk/accounts";
import { braga } from "@arkiv-network/sdk/chains";
import { stringToPayload } from "@arkiv-network/sdk/utils";

import { normalizePrivateKey } from "../src/lib/private-key";

async function main() {
  config();

  const key = normalizePrivateKey(process.env.PRIVATE_KEY);
  if (!key) {
    console.error(
      "PRIVATE_KEY inválida en .env — necesitás 64 caracteres hex (opcional: prefijo 0x).",
    );
    console.error("Ejecutá: npx tsx scripts/check-env.ts");
    process.exit(1);
  }

  const account = privateKeyToAccount(key);

  const walletClient = createWalletClient({
    chain: braga,
    transport: http(),
    account,
  });

  const publicClient = createPublicClient({
    chain: braga,
    transport: http(),
  });

  const { entityKey, txHash } = await walletClient.createEntity({
    payload: stringToPayload("MedTrail — hello Braga"),
    contentType: "text/plain",
    attributes: [
      { key: "entityType", value: "clinical_event" },
      { key: "track", value: "puna-tech" },
      { key: "status", value: "active" },
    ],
    expiresIn: 86400,
  });

  console.log("✅ Entidad creada");
  console.log("   Key:", entityKey);
  console.log("   Tx: ", txHash);

  const entity = await publicClient.getEntity(entityKey);
  console.log("📄 Contenido:", entity.toText());
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
