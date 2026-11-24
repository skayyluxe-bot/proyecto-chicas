
# AGENTS.md — Beauty & Fashion Web

## 1. Descripción del proyecto

Beauty & Fashion es una aplicación web de moda y maquillaje que ayuda a las usuarias a elegir outfits y estilos de maquillaje según diferentes ocasiones.

La aplicación debe ejecutarse directamente en un navegador, tanto en computadoras como en dispositivos móviles.

El proyecto se desarrollará mediante Codex, dividido en fases, funcionalidades y ramas independientes de Git.

### Objetivo del MVP

Crear una primera versión funcional que permita:

- Acceder sin registro ni inicio de sesión.
- Seleccionar una ocasión.
- Elegir preferencias de vestimenta y maquillaje.
- Tomar o seleccionar fotografías como referencia.
- Recibir recomendaciones de outfits.
- Recibir recomendaciones de maquillaje.
- Consultar un catálogo de prendas y maquillajes.
- Visualizar resultados con imágenes y descripciones.

Las fotografías no serán analizadas automáticamente en el MVP. Las recomendaciones utilizarán reglas programadas basadas en las preferencias de la usuaria.

## 2. Tecnologías

Utilizar únicamente las tecnologías siguientes:

| Componente | Tecnología |
|---|---|
| Aplicación | React |
| Lenguaje | TypeScript |
| Desarrollo | Vite |
| Navegación | React Router con HashRouter |
| Diseño | CSS tradicional |
| Estado | React Context |
| Datos | Arreglos locales de TypeScript |
| Recomendaciones | Funciones de TypeScript |
| Fotografías | API nativa del navegador |
| Pruebas | Vitest y React Testing Library |
| Versiones | Git y GitHub |

Las fases 0 a 5 entregan el MVP estático. Durante esas fases las fotos se mantienen en el navegador y las recomendaciones se calculan localmente.

Las fases 6 y 7 amplían el MVP con un probador virtual opcional. Se conserva la aplicación React y se añade una función de servidor en TypeScript para editar una foto con la API de imágenes de OpenAI. El probador utiliza el outfit y el maquillaje que la usuaria elige entre las recomendaciones existentes. La primera entrega genera una imagen editada por solicitud y funciona sin cuentas de usuarias ni una base de datos de fotos.

## 3. Arquitectura de la aplicación

Utilizar una arquitectura sencilla de tres capas.

### Capa 1: Presentación

Contiene las pantallas y los componentes visuales.

Responsabilidades:

- Mostrar formularios.
- Recibir interacciones.
- Permitir navegar.
- Mostrar fotografías.
- Presentar recomendaciones.

### Capa 2: Dominio

Contiene las reglas principales de la aplicación.

Responsabilidades:

- Recibir preferencias.
- Filtrar outfits.
- Filtrar maquillajes.
- Ordenar recomendaciones.
- Devolver resultados.

Las funciones de dominio no deben depender de React.

### Capa 3: Datos

Contiene la información local utilizada para generar recomendaciones.

Responsabilidades:

- Almacenar outfits.
- Almacenar maquillajes.
- Relacionar prendas con ocasiones.
- Relacionar estilos de maquillaje con outfits.
- Referenciar imágenes locales.

## 4. Estructura de carpetas

```text
beauty-fashion/
├── AGENTS.md
├── README.md
├── package.json
├── public/
│   └── images/
├── src/
│   ├── main.tsx
│   ├── app/
│   │   ├── AppRoutes.tsx
│   │   └── AppShell.tsx
│   ├── components/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── PhotoPicker.tsx
│   │   └── ResultsView.tsx
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── OccasionPage.tsx
│   │   ├── PhotoPage.tsx
│   │   ├── ResultsPage.tsx
│   │   └── CatalogPage.tsx
│   ├── state/
│   │   └── ConsultationContext.tsx
│   ├── domain/
│   │   ├── types.ts
│   │   ├── options.ts
│   │   ├── recommendOutfits.ts
│   │   └── recommendMakeup.ts
│   ├── data/
│   │   ├── outfits.ts
│   │   └── makeups.ts
│   ├── styles/
│   │   ├── global.css
│   │   └── responsive.css
│   └── test/
│       └── setup.ts
└── vite.config.ts
```

Cada agente debe crear solamente los archivos correspondientes a su tarea.

## 5. Contratos de dominio

Los agentes deben utilizar los mismos tipos de datos.

Crear `src/domain/types.ts`:

```typescript
export type Occasion =
  | "cumpleanos"
  | "fiesta"
  | "cena_formal"
  | "salida_casual"
  | "graduacion";

export type StylePreference =
  | "casual"
  | "elegante"
  | "moderno"
  | "sin_preferencia";

export type MakeupPreference =
  | "natural"
  | "glam"
  | "sin_preferencia";

export interface ConsultationInput {
  occasion: Occasion;
  style: StylePreference;
  makeup: MakeupPreference;
}

export interface Outfit {
  id: string;
  nombre: string;
  descripcion: string;
  ocasiones: Occasion[];
  estilos: Exclude<
    StylePreference,
    "sin_preferencia"
  >[];
  prendas: string[];
  imagen: string;
  makeupIds: string[];
}

export interface Makeup {
  id: string;
  nombre: string;
  descripcion: string;
  ocasiones: Occasion[];
  intensidad: Exclude<
    MakeupPreference,
    "sin_preferencia"
  >;
  imagen: string;
}
```

Estos contratos deben definirse antes de implementar las funcionalidades dependientes.

No modificar los nombres ni tipos sin autorización.

## 6. API de dominio

La aplicación utilizará dos funciones principales.

### Recomendación de outfits

```typescript
export function recommendOutfits(
  criteria: ConsultationInput,
  catalog: Outfit[]
): Outfit[];
```

Reglas:

1. Filtrar outfits por ocasión.
2. Asignar 2 puntos cuando coincida el estilo solicitado.
3. Ordenar por puntuación descendente.
4. Resolver empates ordenando por ID ascendente.
5. Mostrar un máximo de tres outfits.
6. Devolver un arreglo vacío si no existen coincidencias.

### Recomendación de maquillaje

```typescript
export function recommendMakeup(
  criteria: ConsultationInput,
  catalog: Makeup[],
  selectedOutfit?: Outfit
): Makeup[];
```

Reglas:

1. Filtrar maquillajes según la ocasión.
2. Asignar 2 puntos cuando coincida la preferencia de maquillaje.
3. Asignar 3 puntos adicionales si el maquillaje está relacionado con el outfit seleccionado.
4. Ordenar por puntuación descendente.
5. Resolver empates mediante el ID.
6. Mostrar un máximo de tres opciones.

Estas funciones deben ser puras, sin peticiones HTTP, sin modificar los arreglos originales y sin depender de componentes React.

## 7. Fases de desarrollo

# FASE 0 — Preparación del proyecto

### Tarea F0-01: Configuración inicial

**Rama:** `chore/F0-01-bootstrap`

**Objetivo:** preparar el entorno de desarrollo web.

Implementación:

1. Crear el proyecto con React, TypeScript y Vite.
2. Configurar la estructura inicial.
3. Instalar React Router.
4. Instalar Vitest y React Testing Library.
5. Configurar ESLint.
6. Preparar los comandos de desarrollo.
7. Crear un README inicial.
8. Verificar que el proyecto se ejecuta en el navegador.

**Archivos permitidos:** archivos de configuración, `package.json`, `src/main.tsx`, `vite.config.ts`, `README.md` y configuración de pruebas.

**Criterios de aceptación:**

- El servidor de desarrollo inicia.
- La página aparece en el navegador.
- TypeScript compila correctamente.
- El build funciona.
- No aparecen errores de consola.

**Dependencias:** ninguna.

**Paralelismo:** esta tarea debe terminarse antes de iniciar las demás.

---

# FASE 1 — Fundamentos de la aplicación

### Tarea F1-01: Modelos de datos

**Rama:** `feature/F1-01-domain-contracts`

**Objetivo:** definir cómo se representa la información.

Implementación:

1. Crear `src/domain/types.ts`.
2. Implementar todos los tipos establecidos.
3. Crear `src/domain/options.ts`.
4. Definir las cinco ocasiones.
5. Definir los estilos de vestimenta.
6. Definir las preferencias de maquillaje.
7. Exportar las opciones con valores y etiquetas.

**Archivos permitidos:**

- `src/domain/types.ts`
- `src/domain/options.ts`

**Criterios de aceptación:**

- Todos los tipos son válidos.
- Las opciones se pueden importar.
- No existen valores duplicados.
- TypeScript compila.

**Dependencias:** F0-01.

**Paralelismo:** puede ejecutarse junto con F1-02.

### Tarea F1-02: Diseño visual

**Rama:** `feature/F1-02-design-system`

**Objetivo:** establecer el diseño general de la aplicación.

Implementación:

1. Crear los colores principales.
2. Configurar tipografías.
3. Definir espacios y tamaños.
4. Crear un botón reutilizable.
5. Crear un componente de tarjeta.
6. Crear estilos de formularios.
7. Añadir estados visuales para botones deshabilitados.
8. Mantener un diseño limpio y adaptable.

**Archivos permitidos:**

- `src/styles/global.css`
- `src/components/Button.tsx`
- `src/components/Card.tsx`

**Criterios de aceptación:**

- Componentes reutilizables.
- Estilos consistentes.
- Controles accesibles.
- Diseño visual apropiado para moda y belleza.

**Dependencias:** F0-01.

**Paralelismo:** puede ejecutarse junto con F1-01 y, posteriormente, F1-03.

### Tarea F1-03: Navegación y estado

**Rama:** `feature/F1-03-routing-state`

**Objetivo:** conectar las pantallas principales.

Implementación:

1. Configurar HashRouter.
2. Crear las rutas de navegación.
3. Crear el componente AppShell.
4. Crear la página principal.
5. Crear pantallas temporales para las funcionalidades restantes.
6. Implementar ConsultationContext.
7. Compartir las preferencias entre páginas.
8. Permitir reiniciar una consulta.

Rutas:

```text
/#/
/#/ocasion
/#/foto
/#/resultados
/#/catalogo
```

El contexto debe exponer:

```typescript
interface ConsultationState {
  criteria: Partial<ConsultationInput>;
  photo: File | null;
  updateCriteria: (
    patch: Partial<ConsultationInput>
  ) => void;
  setPhoto: (file: File | null) => void;
  reset: () => void;
}
```

**Archivos permitidos:** `src/main.tsx`, `src/app/`, `src/state/`, `HomePage.tsx` y versiones iniciales de las demás páginas.

**Criterios de aceptación:**

- Todas las rutas funcionan.
- La navegación no produce errores.
- Las preferencias se conservan al navegar.
- Se puede limpiar el estado.

**Dependencias:** F1-01.

**Paralelismo:** puede ejecutarse mientras F1-02 termina.

---

# FASE 2 — Funcionalidades principales

### Tarea F2-01: Catálogo local

**Rama:** `feature/F2-01-local-catalog`

**Objetivo:** crear los datos iniciales de moda y maquillaje.

Implementación:

1. Crear un catálogo con al menos 15 outfits.
2. Incluir al menos tres outfits por ocasión.
3. Crear al menos 10 estilos de maquillaje.
4. Incluir al menos dos maquillajes por ocasión.
5. Asignar IDs únicos.
6. Relacionar outfits con maquillajes mediante `makeupIds`.
7. Incorporar imágenes locales de referencia.
8. Crear cuatro ilustraciones SVG originales reutilizables.

**Archivos permitidos:**

- `src/data/outfits.ts`
- `src/data/makeups.ts`
- `public/images/`

**Criterios de aceptación:**

- Los datos respetan las interfaces.
- Cada ocasión tiene recomendaciones.
- Todos los IDs relacionados existen.
- Las imágenes cargan correctamente.

**Dependencias:** F1-01.

**Paralelismo:** F2-02, F2-05 y F2-07.

### Tarea F2-02: Selección de ocasiones

**Rama:** `feature/F2-02-occasion-form`

**Objetivo:** permitir seleccionar el evento y las preferencias.

Implementación:

1. Crear formulario de selección.
2. Mostrar las cinco ocasiones.
3. Permitir elegir el estilo de ropa.
4. Permitir elegir la preferencia de maquillaje.
5. Guardar elecciones en ConsultationContext.
6. Validar que exista una ocasión.
7. Añadir botón para continuar a fotografías.
8. Añadir botón para recomendar sin fotografía.

**Archivo permitido:**

- `src/pages/OccasionPage.tsx`

**Criterios de aceptación:**

- La ocasión es obligatoria.
- Las preferencias son opcionales.
- Se puede continuar con o sin foto.
- El estado se conserva correctamente.

**Dependencias:** F1-01 y F1-03.

**Paralelismo:** F2-01, F2-05 y F2-07.

### Tarea F2-03: Motor de outfits

**Rama:** `feature/F2-03-outfit-engine`

**Objetivo:** desarrollar las recomendaciones de vestimenta.

Implementación:

1. Recibir las preferencias.
2. Buscar outfits correspondientes a la ocasión.
3. Evaluar coincidencia de estilos.
4. Asignar puntuaciones.
5. Ordenar los resultados.
6. Devolver hasta tres outfits.
7. Manejar listas vacías.
8. Crear pruebas unitarias.

**Archivo principal:**

- `src/domain/recommendOutfits.ts`

**Criterios de aceptación:**

- Las recomendaciones son coherentes.
- La función es determinista.
- No modifica datos originales.
- Funciona con y sin preferencias de estilo.

**Dependencias:** F1-01 y F2-01.

**Paralelismo:** F2-04 y F2-06.

### Tarea F2-04: Motor de maquillaje

**Rama:** `feature/F2-04-makeup-engine`

**Objetivo:** recomendar maquillajes compatibles con la ocasión y el outfit.

Implementación:

1. Recibir las preferencias.
2. Filtrar maquillajes según la ocasión.
3. Evaluar coincidencias de intensidad.
4. Evaluar relación con el outfit.
5. Calcular puntuaciones.
6. Ordenar resultados.
7. Devolver hasta tres maquillajes.
8. Crear pruebas unitarias.

**Archivo principal:**

- `src/domain/recommendMakeup.ts`

**Criterios de aceptación:**

- Las recomendaciones corresponden a la ocasión.
- Se respeta el algoritmo definido.
- Funciona sin outfit seleccionado.
- No modifica los datos recibidos.

**Dependencias:** F1-01 y F2-01.

**Paralelismo:** F2-03 y F2-06.

### Tarea F2-05: Fotografías

**Rama:** `feature/F2-05-photo-picker`

**Objetivo:** permitir utilizar una fotografía como referencia.

Implementación:

1. Crear selector de galería.
2. Añadir acceso a cámara cuando el navegador lo permita.
3. Aceptar JPG, PNG y WebP.
4. Limitar archivos a 5 MB.
5. Validar formato y tamaño.
6. Mostrar vista previa.
7. Permitir reemplazar la imagen.
8. Permitir eliminar la imagen.
9. Permitir omitir la fotografía.
10. Liberar las URLs temporales utilizadas para la vista previa.

**Archivos permitidos:**

- `src/components/PhotoPicker.tsx`
- `src/pages/PhotoPage.tsx`

**Criterios de aceptación:**

- La galería funciona.
- La cámara se ofrece cuando es compatible.
- La fotografía puede visualizarse.
- Se rechazan archivos no permitidos.
- Ninguna imagen se envía a servidores.
- La consulta funciona sin fotografía.

Mostrar siempre la aclaración:

"La fotografía es solo una referencia visual; esta versión no analiza imágenes".

**Dependencias:** F1-03.

**Paralelismo:** F2-01, F2-02 y F2-07.

### Tarea F2-06: Catálogo visual

**Rama:** `feature/F2-06-catalog-page`

**Objetivo:** permitir explorar las opciones disponibles.

Implementación:

1. Crear la página de catálogo.
2. Mostrar outfits.
3. Mostrar maquillajes.
4. Incorporar un filtro por categoría.
5. Incorporar búsqueda por nombre y descripción.
6. Mostrar tarjetas con imágenes.
7. Mostrar descripciones.
8. Manejar búsquedas sin resultados.

**Archivos permitidos:**

- `src/pages/CatalogPage.tsx`
- Componentes locales en `src/pages/catalog/`

**Criterios de aceptación:**

- Se visualizan los elementos.
- Funcionan los filtros.
- Funciona la búsqueda.
- No aparecen errores con resultados vacíos.

**Dependencias:** F1-02, F1-03 y F2-01.

**Paralelismo:** F2-03 y F2-04.

### Tarea F2-07: Pantalla de resultados

**Rama:** `feature/F2-07-results-view`

**Objetivo:** desarrollar la presentación visual de las recomendaciones.

Implementación:

1. Crear componente ResultsView.
2. Recibir outfits y maquillajes mediante props.
3. Mostrar tarjetas.
4. Mostrar imágenes y descripciones.
5. Mostrar prendas que componen cada outfit.
6. Crear estados para resultados vacíos.
7. Preparar botones de navegación.
8. No duplicar algoritmos de recomendación.

Contrato:

```typescript
interface ResultsViewProps {
  outfits: Outfit[];
  makeups: Makeup[];
}
```

**Archivos permitidos:**

- `src/components/ResultsView.tsx`
- `src/pages/ResultsPage.tsx`

La integración con los motores se realizará en la Fase 3.

**Criterios de aceptación:**

- El componente recibe y muestra datos.
- Funciona con arreglos vacíos.
- El diseño es legible.
- No depende de motores que todavía no estén integrados.

**Dependencias:** F1-01, F1-02 y F1-03.

**Paralelismo:** F2-01, F2-02 y F2-05.

---

# FASE 3 — Integración

### Tarea F3-01: Conectar funcionalidades

**Rama:** `feature/F3-01-app-integration`

**Objetivo:** lograr que todas las funcionalidades trabajen juntas.

Implementación:

1. Verificar que las tareas anteriores estén integradas.
2. Conectar selección de ocasión.
3. Conectar preferencias.
4. Conectar fotografías.
5. Ejecutar el motor de outfits.
6. Ejecutar el motor de maquillaje.
7. Mostrar resultados mediante ResultsView.
8. Conectar botones de navegación.
9. Permitir cambiar preferencias.
10. Permitir comenzar una nueva consulta.
11. Validar el acceso directo a Resultados sin una ocasión seleccionada.

Flujo esperado:

```text
Inicio
  |
  v
Selección de ocasión
  |
  v
Preferencias
  |
  v
Fotografía opcional
  |
  v
Motor de outfits
  |
  v
Motor de maquillaje
  |
  v
Resultados personalizados
```

**Criterios de aceptación:**

- El recorrido completo funciona.
- Se puede utilizar sin foto.
- Las recomendaciones aparecen correctamente.
- No hay errores de navegación.
- No se requiere iniciar sesión.

**Dependencias:** todas las tareas F1 y F2.

**Paralelismo:** no iniciar hasta integrar todas sus dependencias.

---

# FASE 4 — Pruebas y calidad

### Tarea F4-01: Pruebas automáticas

**Rama:** `test/F4-01-automated-tests`

**Objetivo:** comprobar el funcionamiento de las funcionalidades principales.

Crear pruebas para:

- Filtrado de outfits.
- Filtrado de maquillaje.
- Coincidencia de preferencias.
- Resultados vacíos.
- Límite de recomendaciones.
- Validación de ocasión.
- Navegación.
- Consulta del catálogo.
- Búsqueda y filtros.

**Criterios de aceptación:**

- Todas las pruebas pasan.
- No hay errores de TypeScript.
- Los módulos funcionan de forma independiente.

**Dependencias:** F3-01.

**Paralelismo:** F4-02.

### Tarea F4-02: Diseño adaptable y accesibilidad

**Rama:** `style/F4-02-responsive-a11y`

**Objetivo:** asegurar el funcionamiento visual en diferentes dispositivos.

Implementación:

1. Adaptar pantallas a móviles.
2. Adaptar pantallas a tabletas.
3. Adaptar pantallas a computadoras.
4. Mejorar tamaño y separación de botones.
5. Comprobar contraste de colores.
6. Añadir textos alternativos a imágenes.
7. Añadir etiquetas a controles.
8. Verificar navegación con teclado.
9. Evitar desplazamientos horizontales innecesarios.

Verificar anchos aproximados de 360, 768 y 1280 píxeles.

**Criterios de aceptación:**

- La interfaz es legible en móviles.
- Los botones son accesibles.
- El contenido no se superpone.
- La navegación funciona con teclado.

**Dependencias:** F3-01.

**Paralelismo:** F4-01.

### Tarea F4-03: Correcciones finales

**Rama:** `fix/F4-03-stabilization`

**Objetivo:** entregar una versión estable.

Implementación:

1. Integrar las tareas de calidad.
2. Ejecutar todas las pruebas.
3. Revisar errores de consola.
4. Corregir problemas de navegación.
5. Corregir errores visuales.
6. Verificar la cámara y la galería.
7. Revisar los resultados.
8. Actualizar README.

**Criterios de aceptación:**

- No hay errores críticos.
- Todas las funcionalidades del MVP funcionan.
- El proyecto compila correctamente.
- La documentación corresponde al funcionamiento real.

**Dependencias:** F4-01 y F4-02.

---

# FASE 5 — Publicación

### Tarea F5-01: Construcción y despliegue

**Rama:** `chore/F5-01-release`

**Objetivo:** preparar Beauty & Fashion para utilizarse en un navegador.

Implementación:

1. Ejecutar el build de producción.
2. Verificar el directorio `dist/`.
3. Probar mediante `npm run preview`.
4. Comprobar rutas de navegación.
5. Documentar el despliegue en un hosting estático.
6. Verificar visualización en móvil.
7. Documentar limitaciones del MVP.
8. Preparar la versión final.

**Criterios de aceptación:**

- El build funciona.
- La versión de producción abre correctamente.
- Las rutas funcionan.
- La aplicación es utilizable desde un navegador.

Si no se ha realizado el despliegue, informar que la aplicación está lista para publicar, sin afirmar que ya está publicada.

**Dependencias:** F4-03.

---

# FASE 6 — Probador virtual con IA

### Tarea F6-01: Interfaz del probador virtual

**Rama:** `feature/F6-01-virtual-try-on-ui`

**Objetivo:** permitir que la usuaria elija un outfit y un maquillaje recomendados y vea cómo quedarían en su foto.

1. Reutilizar la fotografía de la consulta y ofrecer la opción de añadirla si falta. Para mostrar el look completo, pedir una foto de cuerpo entero, con el rostro visible y buena iluminación.
2. Mostrar la acción **Probar en mi foto** en Resultados. Antes de enviar la solicitud, pedir autorización expresa e indicar que la foto se enviará a OpenAI para editarla. Mantener la fotografía en el navegador durante el flujo normal del MVP.
3. Mostrar el estado de generación y el antes y después. Si la edición falla o el probador está deshabilitado, mantener disponibles las recomendaciones del catálogo.
4. Verificar el flujo con una respuesta simulada. La simulación se usa en desarrollo y pruebas y se identifica como tal.

**Archivos previstos:** páginas de fotografía y resultados, componentes del probador, cliente de la función y pruebas asociadas.

**Criterios de aceptación:** se puede completar una consulta sin foto ni IA. La edición requiere una foto válida, un outfit, un maquillaje y autorización. La comparación se puede usar en móvil y escritorio.

**Dependencias:** desarrollar sobre la rama verificada de F5-01. Integrar F5-01 en `main` antes de integrar F6-01.

### Tarea F6-02: Función de edición de imágenes

**Rama:** `feature/F6-02-image-edit-service`

**Objetivo:** preparar la integración en servidor con `gpt-image-2.6-flare` mediante la API de edición de imágenes.

1. Recibir la foto y los identificadores del outfit y el maquillaje elegidos. Validar en servidor el formato, el tamaño y los identificadores. Construir las instrucciones con datos del catálogo.
2. Solicitar una sola imagen vertical en calidad media como configuración inicial. Pedir que se aplique el look preservando los rasgos, el tono de piel y la pose. Presentar la imagen como una aproximación visual.
3. Preparar la lectura de `OPENAI_API_KEY` como secreto del servidor. Mantener el proveedor real deshabilitado durante esta fase. Probar el adaptador con un proveedor simulado, sin credenciales ni cargos.
4. Manejar tiempos de espera, archivos inválidos y errores del proveedor. Impedir solicitudes duplicadas mientras la edición está en curso y aplicar límites de uso en el servidor antes de habilitar el acceso público.
5. Procesar la fotografía sin guardarla de forma persistente ni incluirla en registros de la aplicación. Registrar únicamente datos operativos, como duración, estado y tokens reportados en `usage`, sin guardar la foto ni la clave.

**Archivos previstos:** función de servidor, adaptador del proveedor, contrato con el cliente, configuración del entorno y pruebas asociadas.

**Criterios de aceptación:** la función supera las pruebas con un proveedor simulado. Si falta la clave o la función está deshabilitada, el catálogo y las recomendaciones siguen operativos.

**Dependencias:** F6-01.

### Tarea F6-03: Validación y preparación del despliegue

**Rama:** `test/F6-03-virtual-try-on-verification`

**Objetivo:** dejar terminado y verificado todo el flujo antes de configurar la clave.

1. Probar la autorización, validación de archivos, carga, comparación, errores, límites de uso y consulta normal sin IA en móvil y escritorio. Ejecutar las verificaciones del proyecto.
2. Elegir y preparar un hosting que sirva React y ejecute la función de servidor. Verificar el despliegue de prueba con la edición real deshabilitada.
3. Revisar y documentar el uso y la retención de fotos por parte del proveedor. Reflejar esta información en el aviso que ve la usuaria antes de autorizar el envío.
4. Documentar el despliegue, la variable de entorno, cómo activar o desactivar el probador y cómo medir el costo por edición. El archivo de ejemplo, si se crea, contiene solo el nombre de la variable y un valor vacío.

**Criterios de aceptación:** la aplicación compila y el recorrido completo funciona con la simulación. La prueba con el proveedor real queda reservada para F7-01.

**Dependencias:** F6-02.

---

# FASE 7 — Activación del probador virtual

### Tarea F7-01: Configurar la clave y probar la edición real

**Rama:** `chore/F7-01-virtual-try-on-release`

**Objetivo:** activar el proveedor real como último paso, una vez terminadas las fases pendientes.

1. Confirmar que F5-01 y las tareas F6 están integradas y verificadas. Confirmar acceso al modelo y saldo de la API.
2. Configurar `OPENAI_API_KEY` en los secretos del servidor de pruebas. La clave no se incluye en el repositorio, el chat, una variable `VITE_` ni el código que recibe el navegador.
3. Ejecutar una prueba controlada con fotos autorizadas. Revisar el parecido, la aplicación del outfit y el maquillaje, el tiempo de espera y el costo real según los tokens reportados.
4. Si la prueba cumple los criterios de aceptación, habilitar el probador en producción con sus límites de uso y verificar el recorrido en la URL publicada. Si queda pendiente la activación, documentar el motivo y mantener disponibles las recomendaciones del catálogo.

**Criterios de aceptación:** una solicitud autorizada genera una imagen y permite compararla con la original. Se verifica el consumo real y se confirma que el navegador nunca recibe la clave.

**Dependencias:** F5-01 y F6-03.

---

## 8. Dependencias y paralelismo

Las tareas deben organizarse en el siguiente orden:

```text
F0-01
  |
  +--------------------+
  |                    |
F1-01                F1-02
  |
F1-03 (puede coincidir con F1-02)
  |
  v
Integrar Fase 1
  |
  +----------------------------+
  |            |          |    |
F2-01        F2-02      F2-05 F2-07
  |
  +----------------------+
  |          |           |
F2-03      F2-04       F2-06
  |
  v
Integrar Fase 2
  |
F3-01
  |
  +----------------+
  |                |
F4-01            F4-02
  |                |
  +----------------+
          |
        F4-03
          |
        F5-01
          |
        F6-01
          |
        F6-02
          |
        F6-03
          |
        F7-01
```

Las flechas representan dependencias, no duración.

### Reglas para ejecutar tareas paralelas

- F0-01 se ejecuta primero.
- F1-01 y F1-02 pueden trabajar simultáneamente.
- F1-03 empieza después de integrar F1-01.
- Las tareas independientes de Fase 2 pueden distribuirse entre agentes.
- Los motores F2-03 y F2-04 necesitan el catálogo F2-01.
- F3-01 comienza cuando todas las funcionalidades estén integradas.
- F4-01 y F4-02 pueden desarrollarse simultáneamente.
- F4-03 y F5-01 deben realizarse en orden.
- Las tareas de Fase 6 se ejecutan en orden y se verifican sin clave real. F5-01 debe integrarse antes de incorporar los cambios de Fase 6 a `main`.
- La clave y la prueba con el proveedor real se reservan para F7-01, después de integrar F5-01 y completar la Fase 6.

## 9. Reglas de Git

Cada tarea se desarrolla en una rama independiente.

Ejemplo:

```bash
git switch main
git pull
git switch -c feature/F2-03-outfit-engine
```

Al finalizar:

```bash
git add .
git commit -m "feat: implementar recomendaciones de outfits"
git push -u origin feature/F2-03-outfit-engine
```

Crear una Pull Request para integrar el trabajo.

No modificar directamente `main`.

No usar `push --force`.

No fusionar ramas que no hayan pasado las verificaciones.

No modificar archivos asignados a otro agente sin coordinación.

## 10. Comandos obligatorios

```bash
npm install
npm run dev
npm run typecheck
npm run lint
npm run test -- --run
npm run build
npm run preview
```

La Fase 0 debe configurar los scripts necesarios.

Cada agente debe ejecutar las verificaciones disponibles correspondientes a su tarea.

## 11. Pruebas de aceptación

Comprobar estos escenarios:

1. La aplicación abre sin registro.
2. La selección de ocasión funciona.
3. No se puede continuar sin ocasión.
4. Las preferencias se guardan durante la consulta.
5. El motor de outfits devuelve resultados válidos.
6. El motor de maquillaje devuelve resultados válidos.
7. La aplicación funciona sin fotografía.
8. Se puede visualizar una fotografía permitida.
9. Se rechazan imágenes no compatibles.
10. El catálogo permite buscar y filtrar.
11. Los resultados vacíos muestran un mensaje.
12. Se puede comenzar una nueva consulta.
13. El diseño funciona en móvil y escritorio.
14. La versión de producción funciona en el navegador.

Para el probador virtual, verificar también:

1. La foto se envía únicamente después de la autorización y al solicitar la edición.
2. Se puede elegir un look, ver el estado de carga y comparar la foto original con la editada.
3. Una foto inválida, un error del proveedor o una clave ausente dejan disponible el recorrido con el catálogo.
4. Las pruebas de la Fase 6 funcionan sin clave y el cliente compilado no contiene secretos.
5. La prueba final de F7-01 registra el consumo real y permite evaluar el parecido, la ropa y el maquillaje.

## 12. Instrucciones obligatorias para los agentes

Todos los agentes deben seguir estas reglas:

1. Leer este archivo antes de comenzar.
2. Trabajar únicamente en la tarea asignada.
3. Utilizar la rama correspondiente.
4. Respetar los contratos del dominio.
5. Modificar solo archivos autorizados.
6. Limitar los cambios al alcance de la fase asignada. El probador virtual corresponde a las fases 6 y 7.
7. No instalar dependencias innecesarias.
8. No duplicar lógica entre componentes.
9. Ejecutar pruebas antes de entregar.
10. Informar los errores encontrados.
11. No afirmar que una prueba pasó si no se ejecutó.
12. No continuar automáticamente con otra fase.

### Formato de entrega

Al terminar, cada agente debe informar:

**Tarea y rama:** identificador y rama utilizada.

**Archivos modificados:** lista de archivos.

**Implementación:** explicación de lo desarrollado.

**Pruebas:** comandos ejecutados y resultados.

**Limitaciones:** funcionalidades todavía no disponibles.

**Integración:** indicar si está listo para revisión y Pull Request.

## 13. Instrucción reutilizable para Codex

Copiar y completar el identificador de tarea:

```text
Lee completamente el archivo AGENTS.md.

Implementa únicamente la tarea [ID] indicada en
la sección de fases.

Trabaja en la rama correspondiente.

Respeta los contratos de dominio, dependencias
y archivos autorizados.

No modifiques funcionalidades ajenas a tu tarea.

Utiliza la solución más sencilla y mantenible.

Ejecuta las verificaciones disponibles.

Al terminar, entrega el reporte establecido
en AGENTS.md y deja los cambios listos
para revisión mediante Pull Request.
```

## 14. Registro del progreso

Actualizar estas casillas únicamente cuando la tarea haya sido integrada en `main`.

- [x] F0-01 — Preparación
- [x] F1-01 — Modelos de dominio
- [x] F1-02 — Sistema visual
- [x] F1-03 — Navegación y estado
- [x] F2-01 — Catálogo local
- [x] F2-02 — Selección de ocasiones
- [x] F2-03 — Recomendaciones de outfits
- [x] F2-04 — Recomendaciones de maquillaje
- [x] F2-05 — Fotografías
- [x] F2-06 — Catálogo visual
- [x] F2-07 — Pantalla de resultados
- [x] F3-01 — Integración
- [x] F4-01 — Pruebas
- [x] F4-02 — Diseño adaptable
- [x] F4-03 — Correcciones
- [x] F5-01 — Preparación de la publicación estática
- [x] F6-01 — Interfaz del probador virtual
- [x] F6-02 — Función de edición de imágenes
- [x] F6-03 — Despliegue de prueba verificado en Render con la edición deshabilitada.
- [ ] F7-01 — Activación y prueba con la API real

## 15. Resultado esperado

Al finalizar la Fase 5, Beauty & Fashion debe permitir consultar y recibir recomendaciones de moda y maquillaje a partir del catálogo local.

La primera versión debe ser sencilla, comprensible, estable y fácil de ampliar.

Al finalizar la Fase 7, la usuaria podrá probar un look recomendado en su propia foto y comparar el resultado con la original. El análisis independiente de fotografías, los favoritos y la integración con tiendas quedan fuera de este plan.

**Al retomar el proyecto, verificar qué tareas están integradas en `main` y continuar con la primera pendiente según sus dependencias.**
