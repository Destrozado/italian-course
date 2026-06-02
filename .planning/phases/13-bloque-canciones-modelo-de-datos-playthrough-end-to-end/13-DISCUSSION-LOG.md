# Phase 13: Bloque Canciones + modelo de datos + playthrough end-to-end - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-02
**Phase:** 13-Bloque Canciones + modelo de datos + playthrough end-to-end
**Areas discussed:** Acceso desde el home, Estado pasada/fallada + redención, Resumen post-canción, Banco de palabras español

---

## Acceso desde el home

| Option | Description | Selected |
|--------|-------------|----------|
| Botón secundario junto a Backup | 'Canciones' muted, no compite con Repaso/Test | |
| Botón protagonista | 4º botón al nivel de Repaso 20 / Test completo | ✓ |
| Sección propia bajo la tabla | Bloque con encabezado + listado bajo la tabla de categorías | |

**User's choice:** Botón protagonista
**Notes:** Le da peso de feature principal. Abre pantalla nueva (`currentScreen='canciones'`).

---

## Estado pasada/fallada + redención

| Option | Description | Selected |
|--------|-------------|----------|
| Refleja el último intento (redimible) | no hecha / pasada (último limpio) / fallada (último con ≥1 fallo); bidireccional | ✓ |
| Mejor marca (pasada sticky) | Una vez pasada, queda pasada para siempre (como dominada) | |
| Binario no hecha / hecha | Solo si la completaste alguna vez; sin distinguir fallada | |

**User's choice:** Refleja el último intento (redimible)
**Notes:** Sin racha 21d, sin dominada. Re-jugar limpio redime; fallar baja. Estado persiste write-once al terminar; los fallos de cascada persisten inmediatamente (D-54 intacto).

---

## Resumen post-canción

| Option | Description | Selected |
|--------|-------------|----------|
| Errores + impacto en categorías | Frases falladas + bloque de categorías que bajaron por cascada (concepto summaryDelta) | ✓ |
| Solo errores de la canción | Solo frases falladas; el impacto se ve en la tabla del home | |
| Errores + marcador X/N | Frases falladas + contador de aciertos, sin detalle de cascada | |

**User's choice:** Errores + impacto en categorías
**Notes:** Reusa el concepto summaryDelta adaptado (solo categorías cascadeadas por esta canción). Cierra el loop pedagógico. Frases sin categoría: en lista de errores pero no en el bloque de impacto.

---

## Banco de palabras español

| Option | Description | Selected |
|--------|-------------|----------|
| Opcional por frase (reusa distractors) | Campo distractors? opcional; por defecto sin distractoras salvo donde aporten | ✓ |
| Siempre solo palabras exactas | Banco = palabras exactas barajadas; reto = orden | |
| Siempre con distractoras | Cada frase con señuelos; exige curarlos frase a frase | |

**User's choice:** Opcional por frase (reusa distractors)
**Notes:** Dirección inversa it→es (prompt italiano, answer español). grade() agnóstico al idioma se reusa tal cual. Puntuación/mayúsculas ignoradas (arrastrado de word-buttons), confirmado por el autor.

---

## Claude's Discretion

El autor delegó explícitamente al builder/researcher (siguiendo patrones del codebase): layout del JSON de canciones, reuso de pantalla session/summary vs dedicada, tipo de ejercicio (word-buttons inverso vs tipo nuevo que reusa grade()), forma del state + migración `migrate4to5`, extensión del schema-validator, atajos de teclado, enforcement de standalone (fuera del sampler).

## Deferred Ideas

- Proceso de propuesta de categorías para frases sin categoría (CATPROC) — milestone futuro
- Más canciones (MUSIC-X1) — contenido posterior
- Audio / karaoke / sync — fuera de scope
- Reanudar canción a mitad — descartado (PLAY-05)
- Mezclar canciones en Repaso/Test — fuera por LINK-04
