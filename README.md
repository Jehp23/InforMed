# MedTrail

Timeline de **eventos clínicos verificables** entre hospitales locales, usando [Arkiv](https://arkiv.network) en la red de prueba **Braga** (Puna Tech 2026 — track Arkiv).

## Problema

Los historiales están fragmentados por hospital y un registro central puede alterarse sin dejar rastro. MedTrail publica cada evento como **entidad inmutable** en Arkiv: consultable por `patientId`, verificable en el explorer.

## Stack

- Next.js 15 + React
- `@arkiv-network/sdk` (Braga)
- IA opcional: **Groq** gratis (`GROQ_API_KEY`) u OpenAI; sin clave → reglas locales

## Setup rápido

```bash
cd InforMed
cp .env.example .env
# Editá PRIVATE_KEY (0x + 64 hex). Faucet: https://braga.hoodi.arkiv.network/faucet

npm install
npm run hello-arkiv   # probar escritura
npm run seed          # datos demo
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000).

## Deploy en Vercel

**Producción:** [https://infor-med.vercel.app](https://infor-med.vercel.app)

El proyecto está enlazado a `Jehp23/InforMed` en GitHub: cada push a `main` dispara un deploy automático.

### Variables de entorno (obligatorias en Vercel)

| Variable | Uso |
|----------|-----|
| `PRIVATE_KEY` | Wallet Arkiv (solo servidor) |
| `GROQ_API_KEY` | MediBot / asistente (recomendado) |

Configuralas en [Vercel → infor-med → Settings → Environment Variables](https://vercel.com/jehp23s-projects/infor-med/settings/environment-variables), o desde local:

```bash
cp .env.example .env   # completar claves
./scripts/sync-vercel-env.sh
vercel deploy --prod --yes
```

### MCP de Vercel en Cursor

Si el plugin Vercel MCP aparece como *Not connected*, activalo en **Cursor Settings → MCP** para inspeccionar deploys y logs desde el chat. El deploy también funciona con `vercel` CLI (`vercel whoami`).

## Demo (2 min)

1. **Hospital Norte**: registrar alergia para `demo-001` → mostrar tx en explorer.
2. Cambiar a **Hospital Sur** → actualizar timeline → ver el mismo evento.
3. **Asistente de historial** (Groq/OpenAI) → brief de traslado y borrador de registro.
4. Abrir link **Verificar entidad** en `data.arkiv.network`.

## Modelo de datos

| Dónde | Qué |
|-------|-----|
| **attributes** (indexables) | `entityType`, `patientId`, `hospitalId`, `eventType`, `status` |
| **payload** (JSON) | `summary`, `timestamp`, ids |

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | App local |
| `npm run hello-arkiv` | Tutorial 1 del track |
| `npm run seed` | Eventos demo (5 tipos × pacientes) |

## Equipo (sugerencia)

| Rol | Tarea |
|-----|--------|
| Arkiv | `.env`, seed, queries, deploy API |
| Front A/B | UI hospitales (mismo componente, distinto `hospitalId`) |
| IA | `GROQ_API_KEY` (gratis en console.groq.com) + prompts en `historial-ai.ts` |
| Pitch | Guion + Loom + formulario entrega |

## Entrega track

- Formulario: https://forms.arkiv.network/punatech26
- Guía: https://www.punatech.ar/guia/tracks/arkiv/

## Privacidad

Solo **pacientes demo** y datos sintéticos. En producción: consentimiento, cifrado y cumplimiento normativo — fuera del scope de 48h.
