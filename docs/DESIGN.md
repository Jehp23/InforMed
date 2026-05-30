# Sistema de diseño — InforMed

Paleta y tokens definidos en [`src/app/globals.css`](../src/app/globals.css).

## Identidad visual

InforMed usa un look **clínico cálido**: fondos crema, verde bosque como acción principal, coral y ámbar para categorías y alertas. La UI evita estética “crypto”; el respaldo Arkiv se muestra como **verificación**, no como billetera.

## Paleta de color

### Marca y acción

| Muestra | Token | HEX | Uso |
|:------:|-------|-----|-----|
| 🟢 | `med-secondary` | `#0E8C6B` | Botones primarios, links, acentos |
| 🟢 | `med-secondary-hover` | `#16B886` | Hover |
| 🟢 | `med-secondary-soft` | `#C8E9D8` | Badges, fondos suaves |

### Superficies

| Muestra | Token | HEX | Uso |
|:------:|-------|-----|-----|
| ⬜ | `med-primary` | `#F4F1E9` | Fondo de página |
| ⬜ | `med-primary-2` | `#EDE8DC` | Tabs, hover secundario |
| ⬜ | `#FFFFFF` | — | Paneles, cards, inputs |

### Texto

| Token | HEX | Uso |
|-------|-----|-----|
| `med-ink` | `#0E2E29` | Títulos |
| `med-ink-soft` | `#2C4A45` | Texto secundario |
| `med-muted` | `#5C6F6A` | Labels, metadata |

### Semántica

| Token | HEX | Uso |
|-------|-----|-----|
| `med-coral` | `#E0654C` | Alergias, errores |
| `med-amber` | `#D69A2E` | Ingresos / internaciones |
| `sky-500` | `~#0EA5E9` | Solo tipo **Laboratorio** en timeline/MediBot |

### Bordes y elevación

| Token | Valor |
|-------|--------|
| `med-line` | `rgba(14, 46, 41, 0.12)` |
| `med-line-strong` | `rgba(14, 46, 41, 0.22)` |
| `med-shadow` | Sombra fuerte (cards) |
| `med-shadow-soft` | Sombra suave (paneles) |

## Tipografías

| Rol | Fuente | Clase Tailwind |
|-----|--------|----------------|
| Títulos | Plus Jakarta Sans | `font-display`, `font-fraunces` |
| Cuerpo | Inter | `font-body` |
| Mono | Geist Mono | `font-mono` |

## Componentes UI (utilidades CSS)

| Clase | Descripción |
|-------|-------------|
| `med-panel` | Panel blanco con borde y sombra suave |
| `med-card` | Card con sombra más marcada |
| `med-btn-primary` | Botón pill verde |
| `med-btn-secondary` | Botón pill outline |
| `med-input` | Input con focus ring verde |
| `med-toolbar-btn` | Botón compacto toolbar |

## Para presentaciones (Gamma / Figma)

Copiar hex principales:

```
#0E8C6B  #16B886  #C8E9D8
#F4F1E9  #EDE8DC  #FFFFFF
#0E2E29  #2C4A45  #5C6F6A
#E0654C  #D69A2E
```

Assets en raíz del repo: `logo.png`, `medibot.png`, `logo-icon.png`.
