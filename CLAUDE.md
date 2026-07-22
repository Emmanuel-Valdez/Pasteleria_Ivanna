# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Landing page for Pastelería Ivanna, a home bakery in Mendoza, Argentina, that takes custom orders for tortas (cakes), alfajores de maicena, and tartas. Single-page Astro site: hero, a bento-style catalog, and a WhatsApp CTA — no backend, no forms, no cart.

## Commands

```bash
npm run dev      # astro dev — local dev server
npm run build    # astro check && astro build — type-check + static build to dist/
npm run preview  # serve the built dist/ locally
```

There is no test suite and no linter configured. `astro check` (part of `npm run build`) is the correctness gate — it must pass with 0 errors before considering a change done.

## Dependency versions are pinned on purpose — do not `npm update`

`package.json` pins `astro`, `@astrojs/check`, `@astrojs/tailwind`, and `tailwindcss` to exact versions (no `^`), and adds an `overrides` block pinning `@astrojs/compiler` to `2.8.0` and `vite` to `5.3.0`. This exact combination is known-good — it was verified working elsewhere before being applied here.

This is load-bearing: a plain `npm install` without these pins resolves `@astrojs/compiler` to a newer version (2.13.x at time of writing) that silently breaks `<style>` block / Tailwind CSS compilation in `astro dev` — the page renders with zero CSS and no error is thrown. If styles ever stop applying in dev, check `node_modules/@astrojs/compiler/package.json` and `node_modules/vite/package.json` against the pinned versions first, before debugging component code.

## Architecture

- **Single page** (`src/pages/index.astro`): `Layout` → `Hero` → `Catalog`. `Layout.astro` also renders `Header` and a fixed `FloatingWhatsApp` button globally.
- **Content collection for cakes** (`src/content/config.ts`, entries in `src/content/cakes/*.md`): each torta is one Markdown file with frontmatter `{ title, category: 'tortas', image, alt }`, image referenced relative to `src/assets/cakes/`. Adding a new torta to the catalog means adding one `.md` file — no component changes needed. Alfajores and Tartas are NOT in the collection; they're static photo+text sections in `Catalog.astro` with a WhatsApp CTA instead of a photo grid. Their photos (`src/assets/alfajores.png`, `src/assets/tartas.png`) are low-res crops from the original Instagram flyer (`img/`) — placeholders until real photos exist.
- **`Catalog.astro`** assembles three pieces: a top "bento" grid (`BentoTile`) — Tortas is a large tile with a two-photo CSS crossfade on hover, plus two photo-only mini tiles linking to `#tortas` and photo tiles for Alfajores/Tartas — followed by the full Tortas photo grid (`CakeCard` per entry) and the Alfajores/Tartas text sections. `CakeCard` is a button (not a link): clicking opens a shared native `<dialog>` lightbox defined at the bottom of `Catalog.astro`, showing a larger image (`getImage` 1080w, passed via `data-full`) with a per-cake WhatsApp CTA inside the modal.
- **`src/data/site.ts`** is the single source of truth for the business name, slogan, and WhatsApp number, plus the `whatsappHref(message)` helper that builds `wa.me` links with a prefilled, URL-encoded message. Every CTA button goes through this — there is no contact form and no backend.
- All cake photos go through `astro:assets` (`<Image>`), never `public/` — this is what gives the large automatic size/format reduction (originals ~200–300kB PNG down to ~10–25kB webp).
- No i18n: this site is Spanish-only, so there's no translation layer.

## Design system

Warm bakery palette (not the portfolio's dark-navy/gold), defined as named colors in `tailwind.config.mjs`: `cream` (#FAF6EC) background, `cocoa` (#4A2E1E) text, `rose` (#D88C9A) and `gold` (#C9A227) accents, `whatsapp` (#25D366) reserved for WhatsApp CTAs only. `font-script` (Playfair Display italic, via `@fontsource/playfair-display`) is used for the business name and section headings; body copy uses Onest (`@fontsource-variable/onest`).

## Deploy

Not yet deployed. `Dockerfile` / `docker-compose.yml` / `nginx.conf` set up a standard Node build → static Nginx container, with the container bound to `127.0.0.1:8082` on the host.

**Plan, phase 2 — CI/CD:** `.github/workflows/docker-build.yml` builds the Docker image on every push/PR (catches a broken `npm run build` before it reaches the VPS), and on push to `master` also pushes it to GHCR as `ghcr.io/emmanuel-valdez/pasteleria_ivanna:latest` and `:<sha>` — no extra secrets needed, it uses the built-in `GITHUB_TOKEN`. The `deploy` job (SSH to the VPS, `docker compose pull && up -d`) is written but commented out in that file, waiting on:

- Domain pointed at the VPS
- VPS-level Nginx server block + Certbot cert
- `VPS_HOST` / `VPS_USER` / `VPS_SSH_KEY` repo secrets

Once those exist, uncomment the `deploy` job and point `docker-compose.yml` at the GHCR image instead of `build: .`.
