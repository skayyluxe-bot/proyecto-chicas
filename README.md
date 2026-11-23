# Beauty & Fashion

Aplicación web en español que recomienda outfits y maquillaje para cumpleaños, fiestas, cenas formales, salidas casuales y graduaciones. Se puede usar sin cuenta.

## Uso

1. Inicia una consulta y elige una ocasión.
2. Si quieres, indica el estilo de ropa y la intensidad de maquillaje que prefieres.
3. Añade una referencia visual o continúa sin foto.
4. En Resultados puedes cambiar tus preferencias o empezar una nueva consulta. En Catálogo puedes buscar por nombre o descripción y filtrar por categoría.

La galería acepta archivos JPG, PNG y WebP de hasta 5 MB. En navegadores compatibles también se ofrece la cámara. Como referencia, la fotografía permanece en el navegador. Las recomendaciones se calculan con reglas y datos locales a partir de la ocasión y las preferencias. La consulta se pierde al recargar la página.

## Desarrollo

Necesitas Node.js 22.12 o superior, npm y un navegador moderno.

```sh
npm ci
npm run dev
```

Abre la dirección que indique Vite, normalmente http://localhost:5173.

## Verificación

```sh
npm run typecheck
npm run lint
npm run test -- --run
npm run build
npm run preview
```

El build genera el sitio en `dist/` y el servidor Node.js en `dist-server/`. `npm run preview` sirve el sitio estático, normalmente en http://localhost:4173. Para verificar el sitio y la función en el mismo servidor, usa `npm start`.

## Publicación en un hosting estático

1. Configura Node.js 22.12 o superior en el entorno de compilación.
2. Ejecuta `npm ci` y `npm run build`. Si el hosting compila desde Git, configura estos comandos en su panel.
3. Publica el contenido de `dist/` y habilita HTTPS. El directorio publicado debe servir `index.html` como página de inicio.
4. Prueba `/#/`, `/#/ocasion` y `/#/catalogo` en la URL pública. Las rutas usan el fragmento `#`, así que el hosting puede servir solo archivos estáticos sin reglas de reescritura. Abre Resultados desde una consulta activa.

La compilación usa rutas de recursos relativas. Puedes alojarla en la raíz de un dominio o en una subcarpeta.

## Probador virtual

En Resultados, el probador permite elegir un outfit, un maquillaje y una foto. La foto solo se envía al pulsar **Probar en mi foto** después de autorizar el envío. Las recomendaciones del catálogo siguen disponibles durante la edición y si el probador se desactiva.

### Prueba local sin clave

Compila y arranca la aplicación con la simulación del servidor. En PowerShell:

```powershell
npm.cmd run build
$env:TRY_ON_MODE = 'simulated'
npm.cmd start
```

Abre http://127.0.0.1:4174/#/. Usa una foto de prueba autorizada. El servidor valida el archivo y devuelve una ilustración del catálogo para verificar la comparación. OpenAI no recibe solicitudes en este modo.

Para comprobar el modo deshabilitado, reinicia el servidor con `TRY_ON_MODE=disabled`. Este es el modo predeterminado. Para desarrollar con recarga automática, deja el servidor en el puerto 4174 y ejecuta `npm run dev` en otra terminal. Vite redirige las solicitudes del probador al servidor local.

### Despliegue con servidor en Render

La configuración `render.yaml` prepara un servicio web Node.js. El comando de compilación instala las dependencias y genera ambos directorios. `npm start` sirve el sitio y `/api/try-on` en el mismo dominio. Render proporciona `PORT` y la configuración escucha en `0.0.0.0`. [Documentación de Render Web Services](https://render.com/docs/web-services)

El probador queda deshabilitado si no hay configuración de modo. Para una prueba controlada sin OpenAI, usa `TRY_ON_MODE=simulated` y una imagen de prueba autorizada. Comprueba que se puede abrir la consulta sin foto y que una edición consentida devuelve la ilustración. Después, vuelve a `disabled` antes de compartir el sitio.

### Activación en F7-01

Una vez integradas las fases anteriores, configura `OPENAI_API_KEY` en los secretos del servidor de pruebas y cambia allí `TRY_ON_MODE` a `openai`. Mantén la clave fuera del repositorio y de las variables `VITE_`. Con la clave ausente, el modo real permanece desactivado. Para desactivarlo manualmente, cambia a `disabled` y reinicia el servicio.

La aplicación procesa la foto en memoria y no la guarda en disco ni en registros. Al activar el modo real, OpenAI recibe la foto y las instrucciones. Según la documentación de la API, el contenido puede mantenerse en registros de supervisión hasta 30 días por defecto. Las imágenes detectadas por los controles de seguridad pueden retenerse para revisión. El aviso de autorización indica esta retención. [Controles de datos de OpenAI](https://developers.openai.com/api/docs/guides/your-data)

Cada solicitud genera una imagen JPEG de 1024 × 1536 en calidad media con GPT‑Image‑2.6 Flare. El servidor admite una edición a la vez y hasta diez por hora por proceso. El límite se reinicia al reiniciar el proceso. El registro operativo incluye duración, estado y los tokens que reporte el proveedor. Para calcular el costo, multiplica los tokens de foto de entrada, instrucciones y salida por sus respectivas tarifas. [Tarifas de GPT‑Image‑2.6 Flare](https://developers.openai.com/api/docs/models/gpt-image-2.6-flare)

## Límites del MVP

- Las recomendaciones usan el catálogo local y las preferencias seleccionadas. La edición del probador es opcional.
- El archivo y las preferencias se conservan en memoria durante la consulta. Al recargar se empieza de nuevo.
- La opción de cámara depende del navegador y del dispositivo. La galería y el flujo sin foto también están disponibles.
