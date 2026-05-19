# FOGEAT Architecture Notes

## Current Shape

FOGEAT is a Vite React app with Supabase as the backend and Vercel as the deploy target.

The app is still intentionally client-heavy, but the first stable boundaries are now separated:

- `src/App.jsx` owns the main UI flow and screen state.
- `src/components/` contains reusable React-only components.
- `src/config/` contains environment-aware runtime configuration.
- `src/domain/` contains static catalog data and pure business rules.
- `src/lib/` contains external service adapters such as Supabase and storage.
- `src/services/` contains app-facing data operations and hides Supabase table/storage details from React components.

## Supabase

Only service and low-level adapter modules should import the ready client from `src/lib/supabase.js`.
React screens should call `src/services/*` functions instead of using `supabase.from(...)` directly.

Supabase configuration is read from Vite environment variables first:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Fallback public values are still present so the existing Vercel deploy keeps working until environment variables are configured there.

## Venue Catalog

The base venue catalog is loaded through `src/services/venueCatalogService.js`.
In production it reads from `public.venues`, which makes names, addresses, Instagram handles, ratings, coordinates, icons, and dish metadata editable in Supabase.

`src/domain/catalog.js` still contains `DEFAULT_VENUES` as a local fallback. If the `venues` table is missing, empty, or temporarily unavailable, the app keeps working with that bundled catalog.

The SQL migration for the first Supabase catalog table is:

- `supabase/migrations/20260505000000_create_venues.sql`
- `supabase/migrations/20260505001000_create_venue_submissions.sql`

Run it once in the Supabase SQL editor or through the Supabase CLI before relying on dashboard edits.

New venues added from the map are no longer written directly into the public catalog.
They are inserted into `public.venue_submissions` with `status = 'pending'`.
Admins review them in the app, and approval copies the venue into `public.venues`.

## Next Refactor Targets

Good next steps:

- Split the large `FogEat` component into screen components: map, venue sheet, wishlist, checkins, profile, admin.
- Move injected CSS from `App.jsx` into a dedicated stylesheet once visual changes are planned.
- Add a small smoke-test path for auth-free pure functions in `src/domain/`.
