# Requirements — Milestone v1.8: Rediseño visual "Editoriale"

> Brownfield **UI puro**. Fuente de verdad de diseño: `design_handoff_italiano_redesign/README.md` (tokens, pantallas, interacciones) + `Italiano-Home.dc.html` (referencia visual; `support.js` NO va a producción). Recrear con **fidelidad alta** en el stack real (vanilla + Alpine + Pico, sin build), NO en React. **Cero cambios de motor/lógica/dominio/persistencia.**

## v1.8 Requirements

### Cimientos visuales (FND)
- [ ] **FND-01**: Existe una capa de **tokens Editoriale** como custom properties CSS (todos los colores hex, familias tipográficas, escala de tamaños/pesos, radios y sombras del README) consumida por el resto de estilos.
- [ ] **FND-02**: Las 3 familias (**Spectral**, **Hanken Grotesk**, **Space Grotesk**) están **auto-hospedadas en `vendor/fonts/`** vía `@font-face` y la app las usa **sin ninguna petición a Google Fonts en runtime** (funciona offline).
- [ ] **FND-03**: Una capa **`app.css` Editoriale** se aplica **sobre Pico** (Pico permanece como reset/base): fondo papel cálido, tipografía serif y espaciado/aire editoriales globales, sin romper la app existente.
- [ ] **FND-04**: El **motivo tricolore** (barra de 3 segmentos verde/crema/rojo, 4px, radio 999) existe como elemento reutilizable disponible en las pantallas.

### Home / Categorías (HOME)
- [ ] **HOME-01**: La Home muestra cabecera editorial: overline `ITALIANO · A1 / A2` + título serif **Categorías** (Spectral 38).
- [ ] **HOME-02**: CTA primario **Repaso 20** (verde, ancho completo, título + subtítulo + flecha, sombra verde) lanza el repaso aleatorio existente.
- [ ] **HOME-03**: Fila de 3 botones **ghost** (Test completo · Canciones · Backup) con borde `border-soft`, equiespaciados.
- [ ] **HOME-04**: Cada **fila de categoría** se muestra en estilo editorial: punto de estado (verde dominado / ámbar en progreso / neutro sin empezar), nombre serif + tema en cursiva, barra de racha (`streak/21`) + meta "N/21 d · M ejercicios", y píldora **Examen** a la derecha.
- [ ] **HOME-05**: El toggle **Contrarreloj** aparece como **switch** Editoriale en la fila de sección de Categorías y conserva su comportamiento actual.
- [ ] **HOME-06**: En **desktop** la Home se presenta como **tabla editorial** (mismas columnas: Estado · Categoría · Racha · Ejercicios · Examen) con papel/serif/hairlines, sin perder funcionalidad.

### Pantallas de ejercicio (EX)
- [ ] **EX-01**: La pantalla de ejercicio tiene **barra superior** Editoriale: botón atrás circular · barra de progreso verde (% del set) · contador `NN/NN` (Space Grotesk) · **chip de cronómetro** cuando Contrarreloj está activo.
- [ ] **EX-02**: El **bloque de pregunta** muestra overline de categoría + frase serif (30) con el hueco + sugerencia en cursiva.
- [ ] **EX-03**: **Opción múltiple** recrea los estados del handoff: selección (borde verde + `green-selection` + hueco rellenado), comprobado (correcta `green-tint` ✓ / elegida-incorrecta `red-tint` ✗ / resto opacadas), **caja de feedback** verde/rojo con título serif + explicación, y CTA **Comprobar → Continuar**.
- [ ] **EX-04**: **Emparejar** recrea las píldoras en 2 columnas con **badge numérico** por par y estados activa / candidata (borde discontinuo) / emparejada (`green-tint`), nota "N de M emparejadas" y CTA deshabilitado hasta completar.
- [ ] **EX-05**: **Word-buttons** (no especificado en el handoff) se rediseña **extrapolando el lenguaje Editoriale** (banco de palabras, huecos estables, feedback verde/rojo consistente con EX-03).

### Canciones · Resultados · Picker (SRP)
- [ ] **SRP-01**: La pantalla **Canciones** muestra tarjeta destacada **Continuar** (portada + overline verde + progreso) y lista de canciones con **tiles tintados** (inicial serif), título serif, meta en cursiva y punto de estado.
- [ ] **SRP-02**: La pantalla de **reproducción de canción** (rellenar huecos; no especificada en el handoff) se rediseña **extrapolando el lenguaje Editoriale** y la barra superior de EX-01.
- [ ] **SRP-03**: La pantalla de **Resultados de examen** muestra **anillo de score** (`conic-gradient`) + "X/Y correctos", sección **categorías afectadas** (cascada, etiqueta `FALLÓ`) y **errores** (frase resuelta, "Tu: ~~x~~ / Correcta: y", explicación), con datos reales de la sesión.
- [ ] **SRP-04**: El **picker** de Repaso/Examen (selección de categorías; no especificado en el handoff) se rediseña **extrapolando el lenguaje Editoriale** (checkboxes/selección, Seleccionar/Quitar todo, contador) conservando su comportamiento.

## Future Requirements (deferred)
- Arte de portada de canción **real** (este milestone usa tiles tintados con inicial).
- Animaciones/transiciones avanzadas más allá de las transiciones cortas de color/posición del handoff.
- Modo claro/oscuro manual (el handoff define una sola paleta papel).

## Out of Scope (exclusiones explícitas)
- **Cualquier cambio de motor/lógica/dominio/persistencia/validación** — cascada D-54, sampler, slot-engine, `localStorage`, schema y migraciones quedan **intactos** (brownfield UI puro).
- **Integrar `support.js`** — es runtime de previsualización del mock; no va a producción.
- **React/Vite** — el README lo asume, pero se recrea en el stack real (vanilla + Alpine + Pico).
- **Nuevas categorías, canciones o contenido** de ejercicios.
- **Reescritura de la estructura JS** no presentacional (los componentes Alpine y getters existentes se conservan; solo cambia markup/CSS y, si acaso, bindings de presentación).

## Traceability
<!-- Rellenado por el roadmapper: REQ-ID → Phase. -->
