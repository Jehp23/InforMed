# Guía de demo — Jurados y pitch

**Duración sugerida:** 2–3 minutos en vivo + slides.

## Enlaces rápidos

| Recurso | URL |
|---------|-----|
| App en producción | https://infor-med.vercel.app |
| Explorer entidades | https://data.arkiv.network/entity/ |
| Explorer transacciones Braga | https://explorer.braga.hoodi.arkiv.network/tx/ |
| Faucet GLM | https://braga.hoodi.arkiv.network/faucet |

## Cuentas demo (sin contraseña)

| Rol | Email | Qué mostrar |
|-----|-------|-------------|
| Médico | `medico@demo.com` | Registrar eventos, MediBot, cambio de hospital |
| Paciente | `maria@demo.com` | Historial compartido, solo lectura |

Pacientes en selector: **María González** (`demo-001`), Juan Pérez, Ana López.

Hospitales: **Norte**, **Sur**, **Centro** (mismo timeline, distinto contexto de registro).

## Guión sugerido (2 min)

| Paso | Acción | Qué decir |
|:----:|--------|-----------|
| 1 | Login `medico@demo.com` | «Entrada con correo; se crea o recupera la identidad en Arkiv — el Arkiv ID del profesional.» |
| 2 | Hospital Norte + María González | «Elegimos contexto; el historial es del paciente, no del hospital.» |
| 3 | **+ Registrar evento** (vacuna, alergia o estudio) → Publicar | «Cada registro es una entidad en Braga, con autor y hospital.» |
| 4 | Toast → **Ver entidad en Arkiv** | «Prueba on-chain: mismo dato consultable fuera de nuestra app.» |
| 5 | Cambiar a **Hospital Sur** → Historial | «Otro centro ve el mismo evento sin re cargar a mano.» |
| 6 | MediBot → «¿Qué alergias tiene?» → chip | «IA solo sobre registros verificados; abre el detalle.» |
| 7 | Logout → `maria@demo.com` | «El paciente ve lo que emitieron los profesionales.» |
| 8 | Cierre | «UI clínica; respaldo verificable Arkiv.» |

## Frase de cierre

> **Un paciente, muchos hospitales, un timeline verificable.**

## Si algo falla en vivo

- Mostrar un evento ya seedeado y abrir **Ver detalles** → link Arkiv.
- Ejecutar antes del pitch: `npm run seed` (con `PRIVATE_KEY` y saldo).
- Verificar variables en Vercel: `PRIVATE_KEY`, `GROQ_API_KEY`.

## Antes del pitch

- [ ] Prod responde y registra un evento de prueba
- [ ] Link del explorer abre en < 10 s
- [ ] Guía in-app cerrada (botón «Guía»)
- [ ] Formulario track enviado: https://forms.arkiv.network/punatech26
