# Pastelería Ivanna

Landing page de una sola página para **Pastelería Ivanna**, una pastelería casera en Mendoza, Argentina, que hace pedidos a medida de tortas, alfajores de maicena y tartas.

Sin backend, sin formulario de contacto: todo el camino de conversión termina en WhatsApp, con un mensaje prellenado según lo que el cliente quiera encargar.

**Repo:** https://github.com/Emmanuel-Valdez/Pasteleria_Ivanna
**Sitio:** https://pasteleriaivanna.evaldez.ar

## Stack

- [Astro 4](https://astro.build/) + TypeScript
- Tailwind CSS con paleta de marca propia (`cream`, `cocoa`, `rose`, `gold`, `whatsapp`)
- Content Collections de Astro para el catálogo de tortas (19 tortas)
- `astro:assets` para optimizar todas las fotos (WebP, tamaños responsive)
- Sin frameworks de UI, sin JS del lado del cliente salvo un lightbox nativo (`<dialog>`) para ver las fotos en grande

## Comandos

```bash
npm install       # instalar dependencias (ver nota de versiones pineadas más abajo)
npm run dev       # servidor de desarrollo local
npm run build     # astro check (type-check) + build estático a dist/
npm run preview   # sirve el build de dist/ localmente
```

No hay test suite ni linter configurado. `astro check` (parte de `npm run build`) es el gate de corrección: tiene que pasar con 0 errores antes de dar un cambio por terminado.

## Arquitectura

- **Página única** (`src/pages/index.astro`): `Layout` → `Hero` → `Catalog`. `Layout.astro` también renderiza el `Header` y un botón flotante de WhatsApp (`FloatingWhatsApp`) en toda la página.
- **Catálogo de tortas** vive en `src/content/cakes/*.md` — cada torta es un archivo Markdown con frontmatter `{ title, category, image, imageHover?, alt }`. El `imageHover` es opcional y le da a esa tarjeta una segunda foto de detalle que se muestra con un crossfade en hover. Agregar una torta nueva = crear un `.md`, sin tocar componentes.
- **`Catalog.astro`** arma un grid tipo "bento" arriba (fotos de tortas + alfajores + tartas) y debajo la grilla completa de fotos de tortas, más las secciones de Alfajores y Tartas con foto + texto + CTA de WhatsApp.
- Al hacer click en cualquier foto de torta se abre un modal (lightbox) con la imagen en grande y un botón directo para encargar esa torta por WhatsApp.
- **`src/data/site.ts`** es la fuente única de verdad para el nombre del negocio, el slogan y el número de WhatsApp, con un helper `whatsappHref(mensaje)` que arma los links `wa.me` con el texto pre-cargado. Todos los CTA pasan por acá.
- Todas las fotos pasan por `astro:assets` (`<Image>`), nunca por `public/` — esto da la reducción automática de tamaño y formato (originales ~200–300kB PNG a ~10–25kB webp).

## Las versiones de las dependencias están pineadas a propósito

`package.json` fija `astro`, `@astrojs/check`, `@astrojs/tailwind` y `tailwindcss` a versiones exactas (sin `^`), y agrega un bloque `overrides` que fija `@astrojs/compiler` a `2.8.0` y `vite` a `5.3.0`.

Esto es importante: un `npm install` sin estos pines resuelve `@astrojs/compiler` a una versión más nueva (2.13.x al momento de escribir esto) que rompe **silenciosamente** la compilación de Tailwind/`<style>` en `astro dev` — la página carga sin ningún CSS aplicado y no tira ningún error.

Si en algún momento el sitio deja de tener estilos en desarrollo, lo primero es revisar `node_modules/@astrojs/compiler/package.json` y `node_modules/vite/package.json` contra las versiones pineadas, antes de ponerse a debuggear los componentes.

## Deploy

El sitio está desplegado en `https://pasteleriaivanna.evaldez.ar`.

`Dockerfile` / `docker-compose.yml` / `nginx.conf` arman un contenedor Nginx estático que sirve el build de Astro, escuchando en `127.0.0.1:8082` en el VPS. `docker-compose.yml` apunta directamente a la imagen de GHCR (`ghcr.io/emmanuel-valdez/pasteleria_ivanna:latest`).

### CI/CD

`.github/workflows/docker-build.yml` hace dos cosas:

1. **Build** (cada push/PR a `master`): construye la imagen Docker multiplataforma (amd64 + arm64) y la sube a GHCR con tags `:latest` y `:<sha>`.
2. **Deploy** (solo push a `master`): se conecta al VPS via Tailscale + SSH, hace `git pull`, `docker compose pull` y `docker compose up -d`.

La conexión al VPS usa Tailscale (action `tailscale/github-action@v2`) con secrets `TAILSCALE_OAUTH_CLIENT_ID` y `TAILSCALE_OAUTH_SECRET`. Las credenciales SSH del VPS están en `VPS_HOST`, `VPS_USER` y `VPS_SSH_KEY`.
