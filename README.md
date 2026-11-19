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
