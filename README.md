# Beauty & Fashion

Aplicación web de moda y maquillaje. Esta entrega implementa F0-01: entorno React + TypeScript + Vite y herramientas de calidad.

## Requisitos

- Node.js LTS compatible con Vite y npm (verificado con Node 26.13.1 y npm 11.20.0).
- Git y un navegador moderno.

## Desarrollo

Desde la raíz del repositorio:

```sh
npm install
npm run dev
```

Abre la dirección que indique Vite (habitualmente http://localhost:5173). Para detener el servidor, presiona Ctrl+C.

## Verificaciones

```sh
npm run typecheck
npm run lint
npm run test -- --run
npm run build
npm run preview
```

El build genera `dist/`. Preview sirve esa compilación localmente, habitualmente en http://localhost:4173. `npm run test` mantiene las pruebas en modo observación. La prueba inicial comprueba la integración de React Testing Library y jest-dom en jsdom.

## Estructura prevista

- `src/main.tsx`: entrada y pantalla provisional de preparación.
- `src/app`, `src/components`, `src/pages`: presentación (fases posteriores).
- `src/state`: estado con React Context (fase posterior).
- `src/domain`: contratos y recomendaciones puras (fases posteriores).
- `src/data`: catálogos locales (fase posterior).
- `src/styles`: CSS tradicional (fase posterior).
- `src/test`: configuración y pruebas.
- `public/images`: imágenes locales (fase posterior).

React Router está instalado; HashRouter y las rutas se implementarán en F1-03. Las recomendaciones, fotos y catálogo todavía no están disponibles. El MVP no utilizará backend, autenticación, servicios de IA ni bases de datos externas. Esta entrega no está publicada.

Las tareas y ramas se rigen por AGENTS.md. Las casillas de progreso se actualizan únicamente tras integrar cada tarea en main.

## Validación de F0-01

Verificado con Node.js 26.13.1 y npm 11.20.0:

- Instalación limpia de dependencias completada; `package-lock.json` incluido.
- `npm run typecheck`: correcto.
- `npm run lint`: correcto.
- `npm run test -- --run`: 1 prueba aprobada.
- `npm run build`: correcto; genera `dist/`.
- `npm run dev` y `npm run preview`: servidores iniciados correctamente.
- Edge en modo headless: título y contenido comprobados tanto en desarrollo como en preview, sin excepciones ni mensajes de error en consola.

Los intentos iniciales dejaron paquetes incompletos por problemas de red. Se resolvió mediante una instalación limpia. En este equipo fue necesario utilizar los certificados de Windows para acceder al registro de npm:

```powershell
$env:NODE_USE_SYSTEM_CA = '1'
npm.cmd install
```

Para instalaciones reproducibles posteriores, utiliza `npm ci`. ESLint 9 emite un aviso de versión sin soporte; el lint funciona con la configuración incluida. Esta tarea está preparada para revisión; las funcionalidades de Fase 1 todavía no están implementadas.