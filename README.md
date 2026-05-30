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
cd medtrail
cp .env.example .env
# Editá PRIVATE_KEY (0x + 64 hex). Faucet: https://braga.hoodi.arkiv.network/faucet

npm install
npm run hello-arkiv   # probar escritura
npm run seed          # datos demo
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000).

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
