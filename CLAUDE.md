# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Website for FKR Reykjavík, a bespoke suit tailoring company. Built as a final CS project at Reykjavik University. The stack is **Drupal 11 headless CMS** (backend/API) + **React 19 + Vite** (frontend), running locally via DDEV.

- Frontend runs at: `http://localhost:5173`
- Drupal runs at: `http://fkr-web.ddev.site`
- Mailpit (local email catcher): `http://fkr-web.ddev.site:8025`

---

## Development Commands

### React (run from `react/`)
```bash
npm run dev       # Start dev server on localhost:5173
npm run build     # Production build
npm run lint      # ESLint
```

### Drupal (run from `drupal/`)
```bash
ddev start                  # Start DDEV (Docker)
ddev stop                   # Stop DDEV
ddev drush cr               # Clear Drupal cache (required after PHP changes)
ddev drush en fkr_booking   # Enable custom module
ddev drush pmu fkr_booking  # Disable custom module
ddev drush updb             # Run database updates
```

### Stripe (for local webhook testing)
```bash
stripe listen --forward-to http://fkr-web.ddev.site/api/stripe/webhook
```
The CLI outputs a `whsec_...` signing secret — update `settings.php` with it when testing locally.

---

## Architecture

### Drupal (headless CMS)
- Exposes content via **JSON:API** at `/jsonapi/...`
- Custom PHP module `fkr_booking` handles all business logic (bookings, gift cards, Stripe, emails)
- Admin pages at `/admin/fkr-bookings` and `/admin/fkr-gjafabref`
- Settings (API keys etc.) stored in `web/sites/default/settings.php` via `$settings[...]`

### React (SPA)
- All pages in `src/pages/`, each with a paired `.css` file
- `App.jsx` defines all routes; `Navbar` and `Footer` wrap every page
- Fetches Drupal content directly from `http://fkr-web.ddev.site/jsonapi/...`
- `DRUPAL_URL` constant defined at the top of each page file

### Custom Module: `fkr_booking`
Located at `drupal/web/modules/custom/fkr_booking/`.

| File | Purpose |
|------|---------|
| `fkr_booking.routing.yml` | Defines all API endpoints and admin routes |
| `fkr_booking.install` | DB schema for `fkr_bookings` and `fkr_gjafabref` tables |
| `fkr_booking.module` | `hook_mail()` email templates |
| `src/Controller/BookingController.php` | All endpoint and admin table logic |
| `src/Form/DeleteBookingForm.php` | Confirmation form for deleting a booking |
| `src/Form/DeleteGjafabrefForm.php` | Confirmation form for deleting a gift card order |

**API endpoints:**
- `POST /api/booking` — save appointment booking + send confirmation email
- `POST /api/gjafabref/checkout` — create Stripe checkout session + save pending order
- `POST /api/stripe/webhook` — receive Stripe event, send gift card confirmation email
- `POST /api/gjafabref` — save gift card order directly (no Stripe)

**Admin routes:**
- `GET /admin/fkr-bookings` — list all bookings with delete links
- `GET /admin/fkr-gjafabref` — list all gift card orders with delete links
- `GET /admin/fkr-bookings/{id}/delete` — confirmation form to delete a booking
- `GET /admin/fkr-gjafabref/{id}/delete` — confirmation form to delete a gift card order

### Stripe Integration
- ISK is treated as a **2-decimal currency** by Stripe — always multiply the ISK amount by 100 before passing to Stripe
- Gift card flow: React form → `/api/gjafabref/checkout` → Stripe hosted page → webhook confirms payment → email sent
- Keys in `settings.php`: `stripe_secret_key`, `stripe_publishable_key`, `stripe_webhook_secret`

### Drupal Content Types used by React
- `siduefni` — page content (title used to identify pages: "Forsíða", "Ferlið", etc.)
- `verdskra_lina` — price list rows, sorted by `field_rodun`
- `gjafabref_upphaed` — gift card amount options
- `algengar_spurningar` — FAQ entries
- Media images fetched via include: `field_mynd,field_mynd.field_media_image`

### Design System
- CSS variables in `react/src/index.css`: `--color-bg: #f4eded`, `--color-green: #2D5247`, `--color-text`, `--color-text-light`
- Font: Times New Roman sitewide (`--font-serif`), `font-weight: 500`
- ISK amounts formatted with dots as thousands separator (e.g. `25.000 kr`) using regex: `.replace(/\B(?=(\d{3})+(?!\d))/g, '.')`

---

## Important Notes

- After any PHP change in the custom module, run `ddev drush cr`
- If the module schema changes, uninstall and reinstall: `ddev drush pmu fkr_booking -y && ddev drush en fkr_booking -y`
- All `ddev` commands must be run from the `drupal/` directory, not the repo root
- The Stripe CLI webhook secret (`whsec_...` from `stripe listen`) is different from the Stripe Dashboard webhook secret — use the CLI one for local testing
