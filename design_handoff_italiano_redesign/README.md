# Handoff: Rediseño visual — App de italiano A1/A2 (dirección "Editoriale")

## Overview
Rediseño visual de una app de práctica de italiano para hispanohablantes adultos (autodidactas), nivel A1/A2. La app actual funciona pero se ve sosa (tabla azul/blanca). Este paquete define una nueva dirección visual llamada **Editoriale**: papel cálido, tipografía serif, acento tricolore (verde/blanco/rojo) sutil y mucho aire. El foco es **móvil**.

Cubre 5 pantallas:
1. **Home / Categorías** (pantalla principal)
2. **Ejercicio · opción múltiple** (completar la frase eligiendo una palabra) — *interactiva*
3. **Ejercicio · emparejar** (dos columnas: persona ↔ forma verbal)
4. **Canciones** (lista de canciones para rellenar huecos)
5. **Resultados del examen** (puntuación, cascada de categorías, errores)

## About the Design Files
Los archivos de este bundle (`Italiano-Home.dc.html` + `support.js`) son **referencias de diseño hechas en HTML** — prototipos que muestran el aspecto y el comportamiento previstos, **no código de producción para copiar tal cual**. El HTML usa un pequeño runtime propio (`support.js`) solo para previsualizar; **no lo lleves a producción**.

La tarea es **recrear estos diseños en el entorno del codebase real** (la app actual parece ser una SPA cliente: probablemente React/Vite o similar). Usa los patrones, librerías y convenciones ya establecidos en ese proyecto. Si no hubiera un entorno definido, elige el framework más adecuado (recomendado: React + Vite) e impleméntalos ahí.

Para **ver** el diseño: abre `Italiano-Home.dc.html` en un navegador (necesita conexión para las fuentes de Google). La página muestra dos "turnos": arriba el flujo completo (pantallas 2a–2d) y abajo el Home con dos variantes (1a "Editoriale" = la elegida; 1b "Soft/Moderno" = descartada, ignórala).

## Fidelity
**Alta fidelidad (hifi).** Colores, tipografía, espaciado e interacciones son finales. Recrea la UI con precisión usando las librerías y patrones del codebase. Mantén las medidas y los valores de color exactos que aparecen abajo.

---

## Design Tokens

### Colores
| Token | Hex | Uso |
|---|---|---|
| `paper` (fondo app) | `#f4f0e8` | Fondo de pantalla |
| `paper-elevated` | `#fbf8f1` | Tarjetas destacadas, cajas de error/score |
| `surface` | `#fbfaf6` | Botones-opción, superficies claras |
| `ink` (texto principal) | `#2b2722` | Títulos y texto principal |
| `muted` | `#8c8576` | Texto secundario / labels |
| `faint` | `#a39a88` | Subtítulos en cursiva, meta |
| `faint-2` | `#a89f8c` | Overlines |
| `placeholder` | `#b3ab99` | Texto muy tenue |
| `hairline` | `rgba(43,39,34,0.09)` | Separadores de lista |
| `border-soft` | `rgba(43,39,34,0.16)` | Bordes de botones ghost/opción |
| **`green`** (primario/éxito) | `#2f7d56` | CTA principal, aciertos, progreso, tricolore |
| `green-dark` | `#296c4a` | Rayas de placeholder de portada |
| `green-on-tint` | `#23603f` | Texto sobre tinte verde |
| `green-tint` | `#e8f1ea` | Fondo de acierto / píldora emparejada |
| `green-tint-border` | `#cfe3d6` | Borde sobre tinte verde |
| `green-selection` | `#eaf2ec` | Fondo de opción seleccionada (sin comprobar) |
| **`red`** (error/acento) | `#b5412e` | Errores, tricolore, etiqueta "Falló" |
| `red-text` | `#8f3322` | Texto sobre tinte rojo |
| `red-tint` | `#f6e9e6` | Fondo de error |
| `red-tint-border` | `#ecd3cc` | Borde sobre tinte rojo |
| **`amber`** (en progreso) | `#b9852f` | Punto de estado "en progreso" |
| `neutral-dot` (sin empezar) | `#c4bcab` | Punto de estado "nuevo" |
| `cta-disabled-bg` | `#dcd7cb` | Botón deshabilitado |
| `cta-disabled-text` | `#a89f8c` | Texto de botón deshabilitado |
| `island` | `#15110c` | Dynamic island del frame (solo mockup) |

**Tintes por categoría/tema** (par fondo / texto, misma luminosidad y croma):
- verde `#e8f1ea` / `#2f7d56`
- rojo `#f6e9e6` / `#b5412e`
- azul `#e9eef7` / `#3a5a8a`
- ámbar `#f5ecdb` / `#9a6b1f`
- morado `#efeaf4` / `#6a4a86`
- teal `#e4f0ef` / `#2f6f6b`

### Tipografía
Tres familias (Google Fonts):
- **Spectral** (serif) — pesos 400/500/600/700 + itálicas. Títulos, nombres de categoría, frases de ejercicio, títulos de canción, números de puntuación grandes.
- **Hanken Grotesk** (sans) — 400/500/600/700/800. Overlines, meta, botones, labels, feedback.
- **Space Grotesk** (mono/numérico) — 500/700. Contadores de progreso (07/20), estadísticas, porcentaje de puntuación, badges de ID.

Import:
```
https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700;800&family=Spectral:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Space+Grotesk:wght@500;700&display=swap
```

Escala (familia · tamaño px · peso · notas):
| Rol | Valor |
|---|---|
| Título grande Home ("Categorías") | Spectral · 38 · 600 · letter-spacing −0.6px |
| Título de pantalla (Canciones/Resultados) | Spectral · 24–30 · 600 |
| Frase del ejercicio (prompt) | Spectral · 30 · 500 · line-height 1.3 |
| Nombre de categoría (fila) | Spectral · 18 · 600 |
| Texto de opción / píldora | Spectral · 17–18 · 500 |
| Título de canción | Spectral · 17–19 · 600 |
| Subtítulo en cursiva (artista, tema, "tip") | Spectral italic · 12.5–14 · color `faint` |
| Overline (secciones) | Hanken · 11 · 700 · letter-spacing 2–2.5px · color `faint-2` · MAYÚSCULAS |
| Meta / cuerpo / feedback | Hanken · 12.5–13 · line-height 1.5 · color `muted` |
| Botón primario | Hanken · 16 · 700 |
| Botón ghost / píldora "Examen" | Hanken · 12.5 · 600–700 |
| Contador / score / stats | Space Grotesk · 13–22 · 700 |
| Hora status bar | (system) · 15 · 700 |

### Espaciado, radios y sombras
- Padding horizontal de pantalla: **22px** (Home, ejercicios, resultados).
- Radios: tarjeta 18 · CTA 16 · opción/feedback/error 14 · píldora-match 13 · tile pequeño 12 · portada 11 · pill/punto/anillo 999.
- Frame del dispositivo (solo mockup): **390×844**, radio 46. Dynamic island 108×30 (#15110c). No lo recrees como tal en la app real — es contexto de móvil.
- Sombras:
  - CTA verde primario: `0 10px 22px rgba(47,125,86,.26)`
  - Tarjeta elevada (papel): `0 8px 22px rgba(40,34,24,.07)`
  - Píldora seleccionada (emparejar): `0 6px 16px rgba(47,125,86,.18)`
- Separador de lista: borde inferior `1px solid rgba(43,39,34,.09)`.
- **Motivo tricolore**: barra de 3 segmentos iguales (verde `#2f7d56` / crema `#fbfaf6` / rojo `#b5412e`), alto 4px, radio 999, ancho ~56px. Decorativo, opcional.

---

## Screens / Views

### 1. Home / Categorías
**Propósito:** punto de entrada; el usuario ve sus categorías de gramática con su progreso y lanza prácticas, exámenes o acciones rápidas.

**Layout (móvil, columna):**
1. Barra tricolore opcional (arriba).
2. Cabecera: overline `ITALIANO · A1 / A2` + título serif `Categorías` (38px).
3. CTA primario **Repaso 20** (verde, ancho completo): título + subtítulo "20 ejercicios al azar · 5 min" + flecha →. Sombra verde.
4. Fila de 3 botones ghost: **Test completo · Canciones · Backup** (borde `border-soft`, transparentes, flex:1, gap 8).
5. Fila de sección: overline `CATEGORÍAS` a la izquierda; a la derecha label "Contrarreloj" + **switch** (toggle).
6. Lista de categorías (filas separadas por hairline).

**Fila de categoría (componente clave):**
- Punto de estado (9px, redondo): `green` = dominado · `amber` = en progreso · `neutral-dot` = sin empezar.
- Columna central: nombre (Spectral 18/600) · tema en cursiva (Spectral italic 12.5, `faint`) · barra de racha (alto 4, fondo `rgba(43,39,34,.08)`, relleno = `streak/21` en verde o ámbar, máx-ancho 110px) + etiqueta "X/21 d · N ejercicios" (o "Sin empezar · N ejercicios").
- Botón **Examen** a la derecha: píldora con borde `ink` 1px, transparente, texto `ink` 12.5/700.

**Modelo de datos de categoría:**
```ts
type Categoria = {
  name: string;        // "Avere"
  topic: string;       // "presente indicativo"  (subtítulo)
  ej: number;          // nº de ejercicios (ej. 23)
  streak: number;      // 0..21 (racha en días)
  state: 'dom' | 'prog' | 'new';
  // derivados:
  // dotColor   = {dom:green, prog:amber, new:neutral}
  // barPct     = streak/21*100
  // streakLine = streak===0 ? `Sin empezar · ${ej} ejercicios` : `${streak}/21 d · ${ej} ejercicios`
}
```
Datos de ejemplo usados: Avere (dom, 21/21, 23) · Essere (prog, 12/21, 28) · Preposizioni (prog, 6/21, 52) · Verbi di movimento (new, 0, 9) · Articoli (prog, 9/21, 18) · Plurale dei nomi (new, 0, 14).

**Responsive (desktop):** la app actual usa tabla en desktop. Mantén el estilo editorial pero puedes ensanchar a una rejilla/tabla con las mismas columnas (Estado · Categoría · Racha · Ejercicios · Última vez · Examen). Conserva tipografía serif, papel cálido y hairlines.

---

### 2. Ejercicio · opción múltiple  *(INTERACTIVO)*
**Propósito:** completar una frase eligiendo la palabra correcta entre 4.

**Layout (columna, altura completa con CTA al fondo):**
1. Barra superior: botón atrás circular (‹) + barra de progreso (relleno verde = % del set) + contador "07/20" (Space Grotesk).
2. Bloque de pregunta: overline `AVERE · PRESENTE INDICATIVO` + frase serif 30px con **hueco**: `Lui ___ ventidue anni.` + sugerencia en cursiva "Elige la forma correcta de *avere*."
3. 4 opciones apiladas (gap 10): botones serif 18, fondo `surface`, borde `border-soft` 1.5px, radio 14, padding 15×18, `justify-content: space-between` (texto a la izquierda, marca ✓/✗ a la derecha).
4. Caja de feedback (aparece tras comprobar).
5. Espaciador flexible.
6. CTA al fondo (ancho completo).

**Estados e interacción:**
- **Datos:** opciones `['ho','hai','ha','abbiamo']`, índice correcto = **2 ('ha')**.
- **Seleccionar** (antes de comprobar): la opción tocada pasa a borde verde 2px + fondo `green-selection`; el **hueco de la frase se rellena** con la palabra elegida, en verde con subrayado.
- **CTA "Comprobar":** deshabilitado (`cta-disabled-bg` / `cta-disabled-text`) mientras no haya selección; verde habilitado al seleccionar.
- **Al comprobar** (`checked = true`):
  - La opción **correcta** → fondo `green-tint`, borde verde 2px, texto `green-on-tint`, marca **✓** verde.
  - Si la elegida es **incorrecta** → fondo `red-tint`, borde rojo 2px, texto `red-text`, marca **✗** roja. (El hueco queda en rojo tachado.)
  - El resto de opciones → `opacity: 0.5`.
  - **Caja de feedback** (`marginTop:16`, radio 14): si acierto fondo `green-tint`/borde `green-tint-border`; si fallo fondo `red-tint`/borde `red-tint-border`. Título serif 17 ("¡Esatto!" / "Quasi…") + explicación Hanken 13/1.5 en `muted`.
  - CTA pasa a **"Continuar →"**.
- **Continuar:** resetea selección y `checked`, avanza a la siguiente pregunta.

---

### 3. Ejercicio · emparejar
**Propósito:** emparejar cada persona (io, tu, lui, noi, loro) con su forma de *avere*.

**Layout:**
1. Barra superior (igual que 2): atrás + progreso (60%) + "12/20".
2. Bloque pregunta: overline `AVERE · EMPAREJAR` + prompt serif 24 "Empareja cada persona con su forma de *avere*."
3. Dos columnas (flex, gap 14): izquierda personas, derecha formas. Píldoras: padding 14, radio 13, serif 17.
4. Nota en cursiva centrada "3 de 5 emparejadas" + CTA "Comprobar".

**Mecánica de emparejado (sin líneas SVG, por color/número):**
- Par **emparejado**: ambas píldoras con fondo `green-tint`, borde `green-tint-border` 1.5px, texto `green-on-tint`, y un **badge numérico** (círculo 20px verde, número blanco Hanken 12/800) idéntico en las dos. (Ej.: io↔ho = 1, tu↔hai = 2, loro↔hanno = 3.)
- Píldora **seleccionada/activa** (esperando pareja): borde verde 2.5px, fondo `surface`, sombra verde; muestra "eligiendo…".
- Píldora **candidata** en la otra columna: borde verde **discontinuo** (dashed) 2px + "?".
- Píldora **sin emparejar**: borde `border-soft`, fondo `surface`.
- CTA "Comprobar" deshabilitado hasta emparejar todo.

---

### 4. Canciones
**Propósito:** elegir una canción para practicar rellenando huecos en su letra.

**Layout:**
1. Barra: atrás + título serif `Canciones` (30).
2. **Tarjeta destacada "Continuar"** (fondo `paper-elevated`, radio 18, sombra de papel): portada 66px (rayas verdes) + overline verde `CONTINUAR` + título serif 19 + artista en cursiva + barra de progreso + "9/14 huecos".
3. Overline `TODAS LAS CANCIONES`.
4. Lista de filas (hairline entre ellas): portada tile 46 (rayas diagonales tintadas con inicial serif) + título serif 17 + meta en cursiva "Artista · Nivel · N huecos" + punto de estado (verde=hecha, ámbar=en curso, neutral=nueva).

**Portadas:** en el mock son **placeholders rayados** (`repeating-linear-gradient` diagonal con la inicial). En producción, sustitúyelas por arte de portada real o mantén los tiles tintados con inicial. Canciones de ejemplo: L'italiano (Toto Cutugno), Volare (Domenico Modugno), Con te partirò (Andrea Bocelli), Felicità (Al Bano & Romina), La solitudine (Laura Pausini).

---

### 5. Resultados del examen
**Propósito:** resumen tras terminar un examen: puntuación, categorías afectadas (cascada) y errores con explicación.

**Layout:**
1. Overline `EXAMEN` + título serif 24 "Avere — presente indicativo".
2. **Hero de puntuación** (tarjeta `paper-elevated`, radio 18): **anillo** 72px con `conic-gradient(green Ndeg, #e6ddcd 0)` (N = porcentaje·3.6; 78%→281deg) y centro con "78%" (Space Grotesk). Al lado: "18/23" serif 30 (la parte "/23" en `placeholder`), "correctos" + "Sesión terminada" en cursiva.
3. Sección **`CATEGORÍAS AFECTADAS`** (con contador "cascada · 8"): filas compactas (hairline): nombre serif 15 + etiqueta **`FALLÓ`** opcional (Hanken 10/700, texto rojo sobre `red-tint`, píldora) + "N ej." a la derecha (`faint`, ancho fijo 54px, alineado dcha.). Cierre en cursiva "+4 categorías más en cascada".
4. Sección **`ERRORES COMETIDOS · 5`**: tarjeta de error (`paper-elevated`, radio 14): frase serif 16 con el hueco resuelto en verde subrayado · línea "Tu: ~~abbiamo~~" (rojo, tachado) + "Correcta: ha" (verde) · explicación en cursiva 12.5/1.5 `muted` (palabras clave en redonda). Repite por cada error.

**Datos de resultados (del producto):** estado por categoría `no-hecha → no-hecha`, marca `falló (cascada multi: ...)`, y "N ejercicios para volver a hecha". Los errores incluyen frase, respuesta del usuario, respuesta correcta y explicación didáctica larga (ver `exercise_detail` del producto).

---

## Interactions & Behavior (resumen)
- **Toggle Contrarreloj** (Home): switch on/off; al activarlo, los ejercicios corren con cronómetro (mostrar un chip de tiempo en la barra superior del ejercicio).
- **Fila de categoría:** tap en la fila → práctica de esa categoría; tap en "Examen" → examen de esa categoría.
- **Opción múltiple:** seleccionar → comprobar → feedback → continuar (ver sección 2). Transiciones suaves de color/borde (~150–200ms).
- **Switch:** la pista cambia a verde y el knob se desplaza (transición ~200ms).
- No hay animaciones complejas; todo son transiciones de color/posición cortas.

## State Management
- Home: `categorias[]`, `contrarreloj: boolean`.
- Opción múltiple: `selectedIndex: number|null`, `checked: boolean`, índice de pregunta actual, set de preguntas, contador de aciertos.
- Emparejar: `pares: Map<personaId, formaId>`, `seleccionActual`, `comprobado`.
- Resultados: objeto de sesión { categoria, aciertos, total, cascada[], errores[] }.

## Design Tokens (ya listados arriba en su sección)

## Assets
- **Fuentes:** Spectral, Hanken Grotesk, Space Grotesk (Google Fonts) — o sus equivalentes en el codebase.
- **Iconos:** mínimos. Chevron atrás `‹`, flecha `→`, marcas `✓`/`✗` (glifos de texto; puedes usar los iconos del codebase). No hay SVGs ilustrativos.
- **Portadas de canciones:** placeholders rayados en el mock → reemplazar por arte real o tiles tintados con inicial.
- **Bandera/tricolore:** barra de 3 colores hecha con divs; no es imagen.

## Files
- `Italiano-Home.dc.html` — prototipo HTML con TODAS las pantallas (turno 2 = ejercicios/canciones/resultados; turno 1 = Home, variante **1a Editoriale** es la buena). Ábrelo en el navegador para ver estados e interacción real del ejercicio 2a.
- `support.js` — runtime solo para previsualizar el HTML. **No usar en producción.**
