# Beauty & Fashion

Aplicación web en español que recomienda outfits y maquillaje para cumpleaños, fiestas, cenas formales, salidas casuales y graduaciones. Se puede usar sin cuenta.

## Uso

1. Inicia una consulta y elige una ocasión.
2. Si quieres, indica el estilo de ropa y la intensidad de maquillaje que prefieres.
3. Añade una referencia visual o continúa sin foto.
4. En Resultados puedes cambiar tus preferencias o empezar una nueva consulta. En Catálogo puedes buscar por nombre o descripción y filtrar por categoría.

La galería acepta archivos JPG, PNG y WebP de hasta 5 MB. En navegadores compatibles también se ofrece la cámara. La fotografía permanece en el navegador. Las recomendaciones se calculan con reglas y datos locales a partir de la ocasión y las preferencias. La consulta se pierde al recargar la página.

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

El build genera `dist/`. El servidor de preview sirve esa compilación, normalmente en http://localhost:4173.

## Publicación en un hosting estático

1. Configura Node.js 22.12 o superior en el entorno de compilación.
2. Ejecuta `npm ci` y `npm run build`. Si el hosting compila desde Git, configura estos comandos en su panel.
3. Publica el contenido de `dist/` y habilita HTTPS. El directorio publicado debe servir `index.html` como página de inicio.
4. Prueba `/#/`, `/#/ocasion` y `/#/catalogo` en la URL pública. Las rutas usan el fragmento `#`, así que el hosting puede servir solo archivos estáticos sin reglas de reescritura. Abre Resultados desde una consulta activa.

La compilación usa rutas de recursos relativas. Puedes alojarla en la raíz de un dominio o en una subcarpeta.

## Límites del MVP

- Las recomendaciones usan el catálogo local y las preferencias seleccionadas. La fotografía solo sirve como referencia visual.
- El archivo y las preferencias se conservan en memoria durante la consulta. Al recargar se empieza de nuevo.
- La opción de cámara depende del navegador y del dispositivo. La galería y el flujo sin foto también están disponibles.
