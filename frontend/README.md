# Recipe Discovery frontend

React + TypeScript app, built with Vite and MUI. It talks to the API in `src/RecipeDiscovery.Api`.

## Setup

Start the API first (`dotnet run --project src/RecipeDiscovery.Api` from the repo root). Then:

```bash
npm install
npm run dev
```

Open `http://localhost:5173` and choose Alex, Blair, or Casey. Log out to switch.

```bash
npm test
npm run build
```

`npm test` runs Vitest and React Testing Library. `npm run build` typechecks and writes `dist/`.

## Design choices

The full requirement-by-requirement write-up and the UI rationale are in the [root README](../README.md).

MUI supplies the shell and the interactive pieces: `Container` and `Box` for layout, `Card` for each recipe, `TextField` and `Select` for search, cuisine, ingredient, and sort, an `IconButton` on the search field, a `Drawer` for filters on phones, `ToggleButtonGroup` for the list, card, and compact layouts, `Pagination` for the list, `CircularProgress` while a request is in flight, and `Alert` when it fails.

There are three themes: Field Journal, Cookbook Editorial, and Candlelight. Each is a token object (`Look`) in `src/theme.ts`, turned into an MUI theme by `buildTheme` and provided by `LookProvider`. Components read tokens through `useLook()` and style with `sx`, so there are no CSS files. The palette button in the header and the buttons on the login screen switch themes, and the choice is saved in `localStorage`. DM Sans, Fraunces, Instrument Serif, and Caveat are loaded from Google Fonts. Country flags come from flagcdn, because Windows does not render emoji flags.

The login screen gates the routes. The token from `POST /auth/login` is kept in `sessionStorage` and attached to Axios and Apollo requests. Logging out clears that token and the Apollo cache.

Routing is React Router: `/` is the list, `/recipes/:id` is the detail page, `/favorites` is the saved list.

The list is REST through Axios (`GET /recipes`, `GET /cuisines`), including `sort` and `direction`. Search and ingredient text wait 300ms, and the search button or Enter sends the current text immediately. Detail, saving a favorite, and the favorites page are GraphQL through Apollo Client. Nutrition is requested only on those GraphQL queries.

In dev, Vite proxies those paths to `http://localhost:5080`, so the browser talks to one origin. Set `VITE_API_URL` when the built app should call the API directly. See `.env.example`.
