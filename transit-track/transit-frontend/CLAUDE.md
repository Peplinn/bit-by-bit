# transit-frontend

Browser UI for transit-track. It shows Peterborough Transit buses in near real time. For each bus it shows the delay against the schedule and how likely the bus is to be late or not arrive.

## Rules for AI assistance

- **Only touch this directory.** Everything outside `transit-frontend/` (poller, Kafka, consumer, Postgres, API server) is off-limits, including reading it to suggest changes.
- **Appearance belongs to the owner.** Don't add or change styling, layout, colours, spacing or Tailwind classes, and don't edit `src/app.css`, without explicit permission. Build functional markup unstyled and leave classes the owner added untouched.
- **Explain every change.** The owner wants to understand and be able to explain every part of this code. Say what each change does, why it's done that way, and which Svelte/TypeScript concept it uses.

## Stack

Svelte 5 (runes: `$state`, `$derived`, `$props`, `$effect`), TypeScript, Tailwind CSS v4 (via `@tailwindcss/vite`), Vite. Plain Vite + Svelte, not SvelteKit, so there's no routing or server code.

## Commands

- `npm run dev` starts the dev server with hot reload (http://localhost:5173).
- `npm run check` runs svelte-check and tsc. Run it after changes.
- `npm run build` / `npm run preview` produce and serve the production build.

## Layout

- `index.html` loads the Jost font from Google Fonts.
- `src/main.ts` mounts `App.svelte` into `#app` and imports `app.css`: Tailwind, shadcn-svelte's theme variables (light and `.dark`), and `--font-sans` set to Jost.
- `src/App.svelte` is the single page: a `<main>` with a search `Input` above `BusTable`, no title bar. The search `query` state lives here so the future map can share it.
- shadcn-svelte (Vega style, neutral colours) is set up via `components.json`. Components are copied into `src/lib/components/ui/` and are ours to edit. Add more with `npx shadcn-svelte@latest add <name>`. Its imports use the `$lib` alias defined in `vite.config.ts` and both tsconfigs. `src/lib/utils.ts` holds its `cn()` class-merging helper.
- `src/lib/types.ts` holds `BusPosition`, the data contract for one bus. Its field names deliberately match the backend's snake_case (`positions` table / poller output). `route_code`, `route_name`, `route_color` and `direction_name` are expected to be joined from the Patterns table by the API (source: pt.mytransitride.com/api/Route, fields `routeCode`, `routeName`, `color`, `directionName`). `next_stop`, `delay_seconds` and `on_time_probability` are optional because the backend doesn't produce them yet.
- `src/lib/mockBuses.ts` holds fake data: real positions from the poller logs, real route colours/directions from the Route API, plus invented next-stop/delay/probability values and deliberate edge cases.
- `src/lib/format.ts` holds pure functions that turn a `BusPosition` into display text (route + direction, next stop, punctuality, last updated) plus `isReporting` and `matchesSearch`.
- `src/lib/color.ts` holds WCAG contrast helpers. `RouteNumber.svelte` uses them to draw the route number in a square of the route colour, with black or white text (≥4.5:1) and a border darkened until it reaches 3:1 against the white page.
- `src/lib/BusTable.svelte` is the bus table, built from shadcn's `Table` and `DropdownMenu` components. Columns: Route No. (`RouteNumber` square, sortable), Route ("Name - Direction", with a checklist dropdown in the header to filter by direction), Bus ID (sortable), Next Stop, Punctuality (early blue, late red, unknown grey). Rows in the not-reporting section are entirely grey (route squares too) and keep their punctuality until the last report is `PUNCTUALITY_EXPIRES_AFTER_SECONDS` (10 min) old, then show "—". `NextStop.svelte` and `Punctuality.svelte` render those two cells everywhere (table and popups). Links (Route No. squares, Bus IDs, popup links) are always underlined so they're recognisable on touch screens. It takes `buses`, `now` (ms) and `query` as props. Buses whose `last_update` is older than `STALE_AFTER_SECONDS` before `now` go in a collapsible "Not reporting" section below the active rows. One `busRow` snippet renders both kinds of row, keyed on `vehicle_id`.
- Popups: `src/lib/view.svelte.ts` keeps the open popup in the URL hash (`#/bus/113`, `#/bus/113/describe`, `#/route/6`). Links are plain `<a href>`s built with `busHref`/`routeHref`/`describeBusHref`; `closeView()` clears the hash. `App.svelte` has a single shadcn `Dialog` that shows `BusDetails` (live info plus `BusProfile`), `DescribeBusForm` ("Help describe this bus") or `RouteDetails` (every bus on the route), depending on the hash. Route No. squares and Bus IDs in the table link to them.
- `BusProfile` (in `types.ts`) describes a physical bus: make/model, seating (Forward/Sideways), capacity, bike racks (Front/Rear, empty = none), next-stop info (`{ display, audio }`, each Working/Sub-Optimal/Faulty, shown as two pills), appearance. Every field is `Dated<T>` (`{ value, date }`) and the popup shows each date beside the value as "12d ago" / "2m ago" (`formatDaysAgo`). The bus popup's subtitle is just "Active" or "Inactive"; active buses show route, next stop and punctuality, inactive ones (grey) show route and last update. The describe form uses shadcn `ToggleGroup` tags and sends a `submitted_at` timestamp. `mockBusProfiles.ts` has invented profiles for a few buses. `src/lib/api.ts` has `submitBusDescription`, which only logs to the console until the API has an endpoint.
- `mockNow` in `mockBuses.ts` stands in for the current time with mock data. `src/lib/clock.svelte.ts` (`createClock`) moves `now` forward in real time from there, once a second; live data will start it at `Date.now()`.
- Next Stop shows the stop and the position's age, e.g. "Reid at Hunter · 5s" (`formatAge`): 1 s steps under 10 s, 10 s steps under 1 min, 1m/3m under 4 min, then a fixed "4m+".
- `src/assets/` holds Vite template leftovers.

## Data source

- `src/lib/api.ts` is the only code that talks to the owner's API. With `VITE_API_URL` unset it returns the mock data, so the app runs before the API exists. Copy `.env.example` to `.env.local` to point it at the API: either `VITE_API_URL=/api` plus `API_PROXY_TARGET` (Vite's dev proxy in `vite.config.ts`, no CORS needed), or the API's full URL (API must allow CORS).
- `src/lib/busFeed.svelte.ts` (`createBusFeed`) fetches every 10 s, scheduling each fetch after the previous one finishes, and merges results with `mergeBuses` (upsert by `vehicle_id`, newer `last_update` wins, buses missing from a response are kept and age into "Not reporting"). It exposes `buses`, `status` and `error`.
- The bus popup's profile is fetched when the popup opens and shown with `{#await}`.
- The backend is the owner's; never edit it. The frontend expects:
  - `GET /buses` → JSON array of `BusPosition` (see `types.ts`). Required: `vehicle_id`, `pattern_id`, `headsign_text`, `velocity`, `bearing`, `lat`, `lng`, `last_update` (ISO 8601 with offset), `time_polled`, `route_code` (number), `route_name`, `route_color` (6-digit hex, no `#`), `direction_name`. Optional: `next_stop`, `delay_seconds`, `on_time_probability`.
  - `GET /buses/{vehicle_id}/profile` → `BusProfile` JSON, or 404 if the bus has no profile.
  - `POST /bus-descriptions` with a `BusDescription` JSON body → any 2xx.

## Design decisions

- Identify buses by `vehicle_id` everywhere: as each-block keys, for selection (store the id, not the object), and for live upserts. A newer `last_update` replaces a bus; an older one is ignored.
- Keep minimal `$state` and compute everything else (filtered/sorted rows) with `$derived`.
- Keep shared state such as the selected bus outside `BusTable`, so the future map can use it too.

## Roadmap

1. ~~Data type + fake data + static table~~
2. Sorting → filtering → row selection
3. Fake live ticker with upsert-by-`vehicle_id`
4. Owner styles the UI
5. Data source module: ~~mock → REST fetch (polling every 10 s)~~, waiting on the owner's API → live push via SSE (`EventSource`) or WebSockets
6. Live map tied to the table (selected row highlights the bus)
