---
name: relaunch-status
description: Muestra el estado del relanzamiento: fase activa, tickets por estado y prioridad, último reporte de iteración y bloqueos humanos pendientes. Solo lectura.
model: haiku
allowed-tools: Read, Grep, Glob, Bash(git *), Bash(ls *), Bash(cat *)
---

Lee `docs/relaunch/PLAN.md`, `docs/relaunch/BACKLOG.md` y el reporte más reciente en `docs/relaunch/reports/`. Devuelve, en español y en ≤25 líneas:
1. Fase activa y su objetivo (de PLAN.md).
2. Tabla de tickets por estado (`todo`, `in_progress`, `done`, `proposed`, `blocked`) y por prioridad (P0-P3) para la fase activa; lista los ids `todo` desbloqueados en orden de prioridad.
3. Resumen del último reporte de iteración (fecha/etiqueta, aprobados, rechazados, humanGate).
4. Rama actual, si hay commits sin push (`git log @{u}..HEAD --oneline` si hay upstream) y si el árbol está limpio.
No modifiques archivos.
