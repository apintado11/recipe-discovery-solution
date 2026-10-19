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

MUI supplies the shell and the interactive pieces: `AppBar` and `Container` for layout, `Card` for each recipe, `TextField` and `Select` for search, cuisine, ingredient, and sort, an `IconButton` on the search field, `Pagination` for the list, `CircularProgress` while a request is in flight, and `Alert` when it fails. Color and type are set in `src/theme.ts` and applied with the `sx` prop. Fraunces and Outfit are loaded from Google Fonts.

The login screen gates the routes. The token from `POST /auth/login` is kept in `sessionStorage` and attached to Axios and Apollo requests. Logging out clears that token and the Apollo cache.

Routing is React Router: `/` is the list, `/recipes/:id` is the detail page, `/favorites` is the saved list.

The list is REST through Axios (`GET /recipes`, `GET /cuisines`), including `sort` and `direction`. Search and ingredient text wait 300ms, and the search button or Enter sends the current text immediately. Detail, saving a favorite, and the favorites page are GraphQL through Apollo Client. Nutrition is requested only on those GraphQL queries.

In dev, Vite proxies those paths to `http://localhost:5080`, so the browser talks to one origin. Set `VITE_API_URL` when the built app should call the API directly. See `.env.example`.
