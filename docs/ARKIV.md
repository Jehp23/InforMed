# Integración Arkiv — InforMed

InforMed usa el SDK oficial [`@arkiv-network/sdk`](https://arkiv.network) en la red de prueba **Braga** (`braga.hoodi.arkiv.network`).

## Dos tipos de entidades

### 1. Identidad (`medtrail_identity`)

- **Cuándo:** login con email (`POST /api/identity`).
- **Índice:** `userKey` = hash de `email:rol`.
- **Payload:** `displayName`, `role`, `registeredAt`, `app`.
- **UI:** el `entityKey` se expone como **Arkiv ID** (código corto `IM-XXXXXX`).

### 2. Evento clínico (`clinical_event`)

- **Cuándo:** médico publica un registro (`POST /api/events`).
- **Índices:** `patientId`, `hospitalId`, `eventType`, `entityType`.
- **Payload:** `summary`, `detail?`, `timestamp`, ids.
- **Atributo extra:** `authorIdentityId` = Arkiv ID del profesional que registró.

## Lectura y escritura en código

| Operación | Archivo | Método SDK |
|-----------|---------|------------|
| Query eventos | `src/lib/arkiv.ts` | `buildQuery().where(...).fetch()` |
| Crear evento | `src/lib/arkiv.ts` | `wallet.createEntity()` |
| Borrar evento | `src/lib/arkiv.ts` | `wallet.deleteEntity()` |
| Identidad | `src/lib/identity.ts` | `createEntity` / `queryIdentity` |

## Modelo de datos

```
┌─────────────────────────────────────┐
│  attributes (indexables en Arkiv)   │
│  entityType, patientId, hospitalId  │
│  eventType, status, authorIdentityId│
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│  payload JSON                       │
│  summary, detail?, timestamp        │
│  (+ recordTypeLabel en estructurados)│
└─────────────────────────────────────┘
```

Registros **estructurados** (formulario avanzado) guardan JSON con `type: "structured_record"` y `recordType` técnico (`vaccine`, `consultation`, …). La UI muestra etiquetas en español vía `recordTypeLabel` y `eventTypeDisplayLabel()`.

## Quién firma las transacciones

En esta demo, **una wallet del servidor** (`PRIVATE_KEY` en `.env`) firma todas las escrituras. El médico queda referenciado por `authorIdentityId`, no firma con MetaMask.

Flujo pensado para producción: custodia institucional o firma delegada; fuera del scope de 48h.

## Verificar que está on-chain

1. **En la app:** tras publicar → toast **Ver entidad en Arkiv** / **Ver transacción en Braga**. En detalle del evento → bloque *Verificar en Arkiv*.
2. **Explorers:**
   - Entidad: `https://data.arkiv.network/entity/{entityKey}`
   - Tx: `https://explorer.braga.hoodi.arkiv.network/tx/{txHash}`
3. **Scripts:** `npm run hello-arkiv` (escritura de prueba), `npm run seed` (datos demo).
4. **API:** `GET /api/events?patientId=demo-001` consulta Braga en vivo.

## Requisitos operativos

| Requisito | Detalle |
|-----------|---------|
| `PRIVATE_KEY` | 64 hex; wallet con **GLM** del [faucet Braga](https://braga.hoodi.arkiv.network/faucet) |
| TTL entidades | `DEFAULT_EXPIRES_IN_SECONDS` = 7 días (hackathon) |
| Límite query | 64 eventos por paciente |

## Enlaces útiles

- [Arkiv Network](https://arkiv.network)
- [Guía track Puna Tech — Arkiv](https://www.punatech.ar/guia/tracks/arkiv/)
- [Formulario entrega](https://forms.arkiv.network/punatech26)
