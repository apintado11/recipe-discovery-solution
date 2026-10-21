# Recipe Discovery Platform — Solution

A .NET 8 API and a React + MUI client for browsing recipes and saving favorites. REST and GraphQL (HotChocolate) run in the same process. [TheMealDB](https://www.themealdb.com/api.php) is the recipe source; users and favorites live in this app.

The original briefs are kept in [REQUIREMENTS.md](REQUIREMENTS.md) (backend) and [FRONTEND_REQUIREMENTS.md](FRONTEND_REQUIREMENTS.md) (frontend). Submission steps are in [SUBMISSION.md](SUBMISSION.md).

This README has three parts:

1. [Requirements and how the solution meets each one](#part-1-requirements-and-answers)
2. [UI and style approach, plus everything added beyond the brief](#part-2-ui-and-style-approach)
3. [Running it, sample requests, and backend design notes](#part-3-running-it-and-design-notes)

---

## Part 1: Requirements and answers

Each item below is a line from the brief, followed by what this solution does about it.

### Backend: data model

**1. Recipe: ID, Name, Description, Ingredients (list), Cuisine, Preparation Time, Difficulty Level.**
Answer: `Contracts/Recipe.cs` has all seven fields (`Id`, `Name`, `Description`, `Ingredients` as a list of name and measure pairs, `Cuisine`, `PreparationTimeMinutes`, `Difficulty`) plus `ImageUrl`. TheMealDB has no prep time or difficulty, so `RecipeMapper` estimates both from the ingredient count and instruction length. The UI labels them as estimates. The exact formula is under [Design notes](#mapping-themealdb-to-a-recipe).

**2. User: ID, Username, Favorite Recipes (list of Recipe IDs).**
Answer: Accounts live in `Auth/AccountStore.cs`. Each one has an id, a display name, an email, and a hashed password. Three sample kitchens are seeded: Alex (`alex@recipe.test`), Blair (`blair@recipe.test`) and Casey (`casey@recipe.test`), all with the password `cookbook`. Favorites are still a list of recipe ids keyed by user id (`Services/FavoriteStore.cs`). One person can't read or change another person's list. New accounts are created from the register screen, and on a normal run they are saved to `data/accounts.json` so they survive an API restart. That file is local and gitignored.

### Backend: REST API

**3. `GET /recipes` — list recipes with optional filters (e.g. `?cuisine=Italian`).**
Answer: Implemented in `RecipesController`. Supports `cuisine`, `ingredient` and `search` (name), plus `sort`, `direction`, `page` and `pageSize`. `GET /cuisines` returns the cuisine list used by the dropdown.

**4. `GET /recipes/{id}` — get a single recipe by ID.**
Answer: Implemented. Returns the full recipe with ingredients, or HTTP 404 with a problem-details body if the id doesn't exist.

**5. `POST /users/{userId}/favorites` — add a recipe to a user's favorites (JSON body with `recipeId`).**
Answer: Implemented in `UsersController`. It checks that the recipe exists (404 if not) and returns 400 if `recipeId` is missing. It requires the user's token (401 without one, 403 for another user's list). Adding the same recipe twice does not duplicate it.

**6. `GET /users/{userId}/favorites` — list a user's favorite recipes.**
Answer: Implemented. Returns full recipe objects, not just ids, with the same auth rules as the POST.

### Backend: GraphQL API (HotChocolate)

**7. Query: fetch all recipes with optional filters (e.g. cuisine, ingredient).**
Answer: `recipes(cuisine, ingredient, search, page, pageSize, sort, direction)` in `GraphQL/Query.cs`. It returns a page with `items`, `total`, `page` and `pageSize`.

**8. Query: fetch a single recipe by ID, including nested ingredients.**
Answer: `recipe(id)` returns the recipe with nested `ingredients { name measure }`. A missing id returns a GraphQL error with code `NOT_FOUND`.

**9. Query: fetch a user's favorite recipes.**
Answer: `favorites(userId)` returns the user's saved recipes. It needs the login token and returns `FORBIDDEN` for someone else's list.

**10. Mutation: add a recipe to a user's favorites.**
Answer: `addFavorite(userId, recipeId)` in `GraphQL/Mutation.cs`. The UI's save buttons use it.

### Backend: technical requirements

**11. Use .NET (6 or later) with HotChocolate for GraphQL.**
Answer: ASP.NET Core on .NET 8, with HotChocolate serving `/graphql`.

**12. Implement both REST and GraphQL in the same application.**
Answer: One host serves REST controllers, Swagger (`/swagger`) and GraphQL (`/graphql`). Both call the same `RecipeService` and `FavoriteService`, so the two never disagree.

**13. Use dependency injection for service layers.**
Answer: `Program.cs` registers `IRecipeService`, `IFavoriteService`, `INutritionSource`, the typed `IMealDbClient` HTTP client, the cache, the favorite store and the token service. Controllers and resolvers receive them through constructor or `[Service]` injection. The tests swap in a fake TheMealDB client the same way.

**14. Basic error handling (e.g. 404 for missing resources).**
Answer: REST returns problem-details responses: 400 for a bad request, 401 with no token, 403 for another user's data, 404 for a missing recipe, and 503 if TheMealDB is unreachable. GraphQL maps the same cases to `NOT_FOUND` and `FORBIDDEN` error codes through `ApiErrorFilter`. The UI shows failures in an MUI `Alert`.

**15. Data source: a free public API or an in-memory mock.**
Answer: Both, in a sense. Recipes come from TheMealDB's public API and are cached in memory after the first load. Favorites are an in-memory store. See [Cache](#cache) for details.

### Backend bonus features

**16. Sorting or pagination on recipe queries.**
Answer: Both, on REST and GraphQL. You can sort by name, prep time or difficulty, ascending or descending. Results are paged after filtering and sorting: 12 per page by default, 24 maximum.

**17. Simple authentication (API key or JWT simulation).**
Answer: Email and password, with a signed HMAC token that expires in 12 hours. `POST /auth/register` creates an account, `POST /auth/login` checks the password, and `POST /auth/logout` revokes that token. Passwords are stored as PBKDF2 hashes. `POST /auth/forgot-password` starts a 30-minute reset, and `POST /auth/reset-password` sets the new password and signs every existing session out. In Development the reset message is delivered to a local inbox (`GET /auth/mailbox`) instead of a real mail server, and the reset screen reads the link. Favorite routes require `Authorization: Bearer <token>`, and the user id in the URL has to match the token. Changing the password invalidates older tokens.

**18. Unit tests for at least one REST endpoint and one GraphQL resolver.**
Answer: `tests/RecipeDiscovery.Api.Tests` (xUnit with `WebApplicationFactory`) covers:
- REST `GET /recipes/{id}`, both a hit and a 404.
- Sorting.
- Login and token rules.
- The GraphQL `nutrition` field and the `addFavorite` mutation.
- The nutrition estimate: measure parsing, food matching, servings, the score and the highlights.

There are 47 tests in all. A fake TheMealDB client keeps them offline, and mapper tests lock down the difficulty estimate.

### Bonus: GraphQL orchestration layer

**19. Use GraphQL as the entry point that orchestrates a public REST API and enriches recipes (e.g. nutrition) by chaining calls in resolvers.**
Answer: Implemented. `recipe(id)` and `recipes` load the meal from TheMealDB, by way of the catalog cache. A separate field resolver on `Recipe.nutrition` (`GraphQL/RecipeType.cs`) then calls `INutritionSource` for each recipe and adds a full nutrition profile. The client gets one unified response. Nutrition exists only in GraphQL and is computed only when a query asks for it.

How the estimate works:
- `MeasureParser` turns each ingredient's free-text measure into grams. It reads "200g", "1 ½ cups", "2 tbsp", "1/2 lb", "1 (12 oz.)", "2 large", ranges like "2-3", and "pinch" or "to taste".
- `FoodTable` holds 135 common ingredients with values per 100 g, plus a unit weight and a density for converting volumes to weight. Matching uses the longest key, so "eggplant" isn't read as "egg" and "butter beans" isn't read as "butter".
- `NutritionSource` adds it all up. It returns:
  - Whole-recipe totals for calories, protein, carbs, fat, fiber, sugar and sodium.
  - An estimated serving count, per-serving values, and percent of daily value.
  - The calorie split between protein, carbs and fat.
  - A 0–100 health score with an A–E grade, plus highlight tags such as "High protein", "Good fiber" and "High sodium".
  - The share of each food group by weight, and a breakdown per ingredient.
  - How many ingredients matched the table.

The source sits behind `INutritionSource`, so a real nutrition API such as USDA FoodData Central could replace the table without changing the schema or the UI.

The detail page turns this into a nutrition-tracker panel, described in [Part 2](#a-nutrition-tracker-on-every-recipe).

### Frontend: recipe browsing page

**20. Display a list of recipes from the backend using MUI components (`Card`, `Grid`, `TextField`).**
Answer: The browse page loads `GET /recipes` through Axios and renders MUI `Card`s in a responsive grid. Search and filter fields use `TextField` and `Select`.

**21. Filter by at least one criterion (cuisine or ingredient).**
Answer: You can filter by cuisine, ingredient and recipe name, and sort the results. Cuisine can be picked from the dropdown or from a scrolling strip of flag chips under the search bar. On phones, the filters move into a bottom-sheet `Drawer`.

**22. Show recipe details (name, ingredients, cuisine) in a visually appealing format.**
Answer: Every card shows the photo, name, a cuisine chip with the country flag, prep time and difficulty. There are three layouts (list, card, compact) and three visual themes, described in [Part 2](#part-2-ui-and-style-approach).

### Frontend: recipe details page

**23. A dedicated view for a single recipe, reached by clicking a recipe in the list (`Typography`, `List`).**
Answer: `/recipes/:id`, reached by clicking any card. It's built from MUI `Typography`, `Chip`, `Checkbox` and `Button`, with the ingredients and steps rendered as list markup through MUI `Box`. Refreshing or sharing the link works, because the Vite proxy sends browser page loads to the React app and API calls to the API.

**24. Fetch with `GET /recipes/{id}` or GraphQL `recipe(id)`.**
Answer: GraphQL `recipe(id)` through Apollo Client, including nested ingredients and nutrition.

**25. Display all available recipe fields (description, prep time, difficulty).**
Answer: The page shows:
- The photo, name, cuisine, prep time and difficulty, with the estimate label.
- A nutrition panel (see [Part 2](#a-nutrition-tracker-on-every-recipe)).
- An ingredient shopping list.
- The method, split into steps.

### Frontend: favorites management

**26. Add a recipe to favorites with an MUI `Button` or `IconButton` (REST POST or GraphQL mutation).**
Answer: Every card has a heart `IconButton`, and the detail page has a "Save to favorites" `Button`. Both call the GraphQL `addFavorite` mutation. The heart fills in once the recipe is saved.

**27. Display a user's favorites in a separate section or page (REST GET or GraphQL query).**
Answer: The `/favorites` page uses the GraphQL `favorites(userId)` query and the same card layouts as browse.

**28. Use a hardcoded `userId` (e.g. `"1"`) for simplicity.**
Answer: The solution goes one step further. Sign-in is email and password, and the user id comes from the signed-in token. That makes it possible to show that favorites really are per person. Logging out revokes the token and clears the Apollo cache, so the next person starts with their own list. A forgotten password can be reset from the local inbox.

### Frontend: API integration

**29. Use REST for at least one feature.**
Answer: REST through Axios handles login, the recipe list with search, filters, sort and paging, and the cuisine list.

**30. Use GraphQL for at least one feature.**
Answer: GraphQL through Apollo handles recipe details (with the full nutrition profile), saving favorites, and the favorites page (with calories and protein per serving on each card).

**31. Show loading states with `CircularProgress` and errors with `Alert`.**
Answer: Every page shows a `CircularProgress` on first load and an `Alert` on failure. When you change filters, a thin `LinearProgress` bar appears and the current results stay on screen, so the page doesn't flash.

### Frontend: technical requirements

**32. React (CRA, Vite or similar).**
Answer: React 18 on Vite.

**33. MUI (`@mui/material`) for all UI elements.**
Answer: Every control is MUI: `Container`, `Box`, `Typography`, `Card`, `TextField`, `Select`, `Chip`, `ToggleButtonGroup`, `Drawer`, `Menu`, `Pagination`, `Checkbox`, `Alert`, the progress indicators and `@mui/icons-material`. The headers are themed MUI `Box` layouts, so each theme can have its own navigation.

**34. Style with the `sx` prop or a theme (no raw CSS except minor tweaks).**
Answer: All styling goes through an MUI theme built from design tokens (`src/theme.ts`) and the `sx` prop. The app has no CSS files. The three themes are three token sets fed into the same `createTheme`.

**35. React Router for navigation.**
Answer: React Router 6. Signed-out routes are `/login`, `/register`, `/forgot-password`, and `/reset-password`. After sign-in, `/` is browse, `/recipes/:id` is the detail page, and `/favorites` is the saved list.

**36. State with React hooks or a library.**
Answer: React hooks and context (`useState`, `useEffect`, `useMemo`, a session context and a theme context), with Apollo's cache for GraphQL data. No Redux was needed.

### Frontend bonus features

**37. Pagination with MUI `Pagination` or infinite scroll.**
Answer: MUI `Pagination` under the list, backed by server-side paging. Page size follows the layout: 12 for cards, 24 for list and compact.

**38. Search bar with MUI `TextField` and `IconButton`.**
Answer: A search `TextField` with a search `IconButton`. Typing waits 300 ms before searching, and Enter or the button searches right away.

**39. TypeScript.**
Answer: The whole frontend is TypeScript, and `npm run build` typechecks before building.

**40. Unit tests with Jest or React Testing Library.**
Answer: Vitest (a Jest-compatible runner) with React Testing Library. Eight test files and 20 tests cover the recipe card, the login screen, the layout switcher, the shopping list, method step parsing and navigation, the flag lookup, and the nutrition panel, including servings rescaling.

### Deliverables

**41. Code in `frontend/`, a `frontend/README.md` with setup steps, and design choices explained.**
Answer: The code is in `frontend/`, and [frontend/README.md](frontend/README.md) covers setup and frontend design. This README covers the whole solution, setup, sample GraphQL queries and mutations, and the design choices.

---

## Part 2: UI and style approach

### The goal

The brief asks for a "visually appealing format" and leaves the look open. The aim was a recipe app that feels homey, like a well-used cookbook or a kitchen journal, while working like a modern app: fast, built for phones first, and easy to scan. Everything is MUI, styled through the theme and `sx`, so the brief's styling rule holds.

### Three switchable themes

The app ships three complete looks, not just three color palettes. You can switch with the palette button in the header or with the buttons on the login screen. The choice is saved in `localStorage`, and the browser's address-bar color (`theme-color`) changes with it.

- **Field Journal** (default): green paper with cream ink, a faint paper texture, and handwritten notes in Caveat. The headline is in Instrument Serif. A line sketch of mountains sits behind the headline. Recipes show as cream polaroid cards with a slight alternating tilt that straightens on hover. On phones, the navigation is a bottom tab bar with a hand-drawn underline.
- **Cookbook Editorial**: the light theme, with warm cream paper, deep green ink and a terracotta accent. Titles are in Fraunces serif; labels and cuisine tags are small uppercase. The layout borrows from print: a sticky header with uppercase tabs, a "Vol. 790 · Autumn kitchen" line above the headline, and a numbered list view (01, 02, …).
- **Candlelight**: near-black green with a gold accent, for evening browsing. Panels are frosted glass. Cards are full-width photos with the title and details laid over a dark gradient. Navigation is a floating dock at the bottom.

**Why three:** taste in this kind of app is personal, and the three moods cover the usual range: warm and crafted, clean and light, and dark and sleek. All three come from one token object per theme (`Look` in `src/theme.ts`). Pages read tokens instead of hardcoding colors, so a page is written once and every theme stays complete. The cost is small: each theme is about 65 lines of tokens, no page is duplicated, and only a handful of Google Fonts are loaded.

### Layout and mobile

- **Layout switcher (list, card, compact).** This works like the view toggle on video sites. Card is the browsing view, list is for scanning, and compact fits the most recipes on screen. The choice is remembered, and the page size changes with it.
- **Phone-first search.** On phones the search bar is a single compact row. Cuisine, ingredient and sort move into a bottom-sheet drawer behind a filter button, which shows how many filters are active. Earlier, the search form took up the whole screen on mobile.
- **Quick cuisine strip.** A horizontally scrolling row of flag chips under the search bar sets the cuisine filter with one tap.
- **Theme-specific navigation.** Journal uses a bottom tab bar, Editorial a sticky header with tabs, and Candlelight a floating dock. The page leaves bottom padding so the tab bar and dock never cover content or the page numbers.

### A nutrition tracker on every recipe

People who cook to eat well want answers to "how much protein is in this?" and "is it a good choice?" without doing the math. Every recipe page has a panel styled like a fitness-app dashboard, built from MUI and SVG and using the active theme's colors:

- **Calorie ring:** calories per serving in the center, with the ring split by how much comes from protein, carbs and fat. Underneath is its share of a 2,000 kcal day.
- **Daily value bars:** protein, carbs, fat, fiber, sugar and sodium per serving, each with the grams and a bar showing the percent of daily value.
- **Health score:** an A–E grade on a ring, with green tags for good signs ("High protein", "Good fiber", "Veg-forward") and amber tags for warnings ("High sodium", "High sugar").
- **Plate by weight:** a stacked bar showing how the recipe divides among grains, vegetables, protein, dairy and other groups.
- **Biggest calorie sources:** the five ingredients that add the most calories, so you can see what to swap.
- **Servings stepper:** changing the serving count rescales every number live, for batch cooking or meal prep.

All values are labeled as estimates. The panel also shows how many ingredients matched the food table, so the confidence is visible. Saved recipe cards show calories and protein per serving.

### Flair and why it's there

- **Country flags on cuisine chips.** Each cuisine chip shows its country's flag, and in two themes a stripe in the flag's colors. The images come from flagcdn because Windows doesn't render emoji flags.
- **Handwritten and serif type.** Caveat for notes, Instrument Serif and Fraunces for headlines, and DM Sans for body text. The pairing gives the cookbook feel while body text stays readable.
- **Small print touches.** A greeting that changes with the time of day, accent rules under headlines, numbered recipes in Editorial, and the mountain sketch in Journal. Each one is small, but together they make the app feel designed rather than assembled.
- **Polaroid tilt and hover.** Cards in the Journal theme sit slightly crooked like photos pasted into a notebook, and straighten when you point at them. It's a cue that the card is clickable.

### Extras beyond the brief

Backend:
- Search by recipe name, plus sorting by name, prep time or difficulty, on both REST and GraphQL.
- An in-memory catalog cache, so TheMealDB is called 26 times on the first request and not again after that.
- Per-user tokens, with 401 and 403 rules on favorites.
- GraphQL-only nutrition enrichment through a chained field resolver. It parses measures into grams and returns macros, fiber, sugar, sodium, servings, daily values, a health score and grade, highlights, food groups and a per-ingredient breakdown.
- Swagger UI, problem-details errors, and a 503 response when TheMealDB is down.

Frontend:
- Email sign-in, account creation, logout, and password reset. Sample kitchens are Alex, Blair, and Casey. Their password is `cookbook`. In Development, reset mail shows up in a local inbox on the forgot-password screen.
- Three complete, switchable themes, saved between visits.
- List, card and compact layouts, saved between visits.
- A phone filter drawer, a quick cuisine strip and an active-filter count.
- Flag chips for every cuisine.
- **Shopping list** on the detail page. The ingredients list leads with the amount, and each item can be checked off with a "packed" progress bar and a "Clear checks" button.
- **Step-by-step method.** The instructions are split into numbered steps with Previous and Next buttons, and times and amounts are highlighted in the text.
- A nutrition-tracker panel on the detail page: calorie ring, daily value bars, health score, food-group breakdown, top calorie sources and a servings stepper.
- Detail links that survive a page refresh in dev, thanks to the Vite proxy bypass.
- Accessible labels on every icon button, `aria-pressed` on toggles, and labeled loading indicators. The tests query by these labels.
- `design-mockups/index.html`, the three static phone mockups the themes were built from.

---

## Part 3: Running it and design notes

### Run it

Terminal 1, from the repository root:

```bash
dotnet run --project src/RecipeDiscovery.Api
```

The API listens on `http://localhost:5080`.

- Swagger: `http://localhost:5080/swagger`
- GraphQL: `http://localhost:5080/graphql`

Terminal 2:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. Sign in with email and password, or create an account. The sample kitchens are `alex@recipe.test`, `blair@recipe.test`, and `casey@recipe.test`, and the password for each is `cookbook`. The buttons on the sign-in screen fill those in. Log out from the account menu. Forgot password delivers the reset link to a local inbox on that page, because there is no mail server. Accounts are saved in `src/RecipeDiscovery.Api/data/accounts.json` and survive an API restart. Change the look with the palette button. The Vite dev server proxies `/auth`, `/recipes`, `/cuisines`, `/users` and `/graphql` to the API. To call the API from another origin, set `VITE_API_URL` (see `frontend/.env.example`). The API allows `http://localhost:5173`.

Tests:

```bash
dotnet test
cd frontend && npm test
```

### What the UI calls

| Page | Protocol | Call |
| --- | --- | --- |
| Sign in, register, logout, password reset | REST | `POST /auth/login`, `/auth/register`, `/auth/logout`, `/auth/forgot-password`, `/auth/reset-password` |
| Browse, search, sort | REST | `GET /recipes` and `GET /cuisines` |
| Save a favorite | GraphQL | `addFavorite` |
| Recipe detail, including nutrition | GraphQL | `recipe(id)` |
| Favorites | GraphQL | `favorites(userId)` |

The UI won't show recipes until you sign in. Favorite routes require that person's token. Recipe reads stay open, so the samples below work without one.

### Sample requests

```bash
curl "http://localhost:5080/recipes?cuisine=Italian&sort=prepTime&direction=asc&page=1&pageSize=12"
curl "http://localhost:5080/recipes/52772"

TOKEN=$(curl -s -X POST "http://localhost:5080/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"alex@recipe.test","password":"cookbook"}' | python3 -c 'import json,sys; print(json.load(sys.stdin)["token"])')

curl -X POST "http://localhost:5080/users/1/favorites" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"recipeId":"52772"}'
curl -H "Authorization: Bearer $TOKEN" "http://localhost:5080/users/1/favorites"
```

```graphql
query RecipeById {
  recipe(id: "52772") {
    id
    name
    cuisine
    description
    preparationTimeMinutes
    difficulty
    imageUrl
    ingredients {
      name
      measure
    }
    nutrition {
      calories
      protein
      servings
      perServing { calories protein carbs fat fiber sugar sodium }
      dailyValues { calories protein carbs fat fiber sodium }
      macros { proteinPercent carbsPercent fatPercent }
      healthScore
      grade
      highlights { label positive }
      foodGroups { group percent }
      ingredients { name measure grams calories matched }
    }
  }
}

query FavoriteRecipes {
  favorites(userId: "1") {
    id
    name
    cuisine
  }
}

mutation SaveFavorite {
  addFavorite(userId: "1", recipeId: "52772") {
    id
    name
  }
}
```

Paste the recipe query into `http://localhost:5080/graphql`. The favorites query and the `addFavorite` mutation need the login token: in the GraphQL IDE, set the header `Authorization: Bearer <token>` using the token from `POST /auth/login`.

### Mapping TheMealDB to a Recipe

TheMealDB meals and this API's recipes have different shapes. A meal has `idMeal`, `strMeal`, `strArea`, `strInstructions`, a thumbnail, and up to 20 ingredient and measure pairs. It has no prep time, difficulty, user or favorites. `MealDbClient` reads the JSON, and `RecipeMapper` turns one meal into a `Recipe`:

| Recipe field | Source |
| --- | --- |
| id, name, cuisine | `idMeal`, `strMeal`, `strArea` when it is set, otherwise `strCountry` |
| description | `strInstructions` |
| ingredients | ingredient and measure pairs, empty slots dropped |
| imageUrl | `strMealThumb` |
| preparationTimeMinutes | `15 + 2 per ingredient + 1 per 100 characters of instructions`, clamped to 10–120 |
| difficulty | Easy at 30 minutes or less and 8 ingredients or fewer; Hard at 60 minutes or more, or 12 ingredients or more; otherwise Medium |

Prep time and difficulty are computed once, when the recipe is cached.

### Cache

TheMealDB's area list includes countries that have no meals, so the app doesn't use it for the cuisine dropdown. Instead, the first list or cuisine request builds a catalog from `search.php?f=a` through `search.php?f=z`: 26 calls, a few at a time. Each call returns full meals, which are mapped and stored in `RecipeCache`. Cuisines are the distinct areas on those meals, or the country when a meal has no area.

After that warm-up:

- List, search, cuisine, ingredient and sort all run on the in-memory catalog. Ingredient text matches an ingredient name; search matches a recipe name.
- `GET /recipes/{id}` and `recipe(id)` return the cached recipe. An id that wasn't in the catalog falls back to `lookup.php` once, behind a per-id lock, and is stored for next time.

The cache and the favorites store last as long as the process does. That suits a single-instance demo, but it means favorites reset when the API restarts.

### How this scales

The request path already depends on `RecipeService`, so the fill strategy can change without rewriting controllers, resolvers or the UI.

1. A background refresh walks letters `a`–`z` and swaps in a new in-memory snapshot. A failed refresh keeps the previous one.
2. With more than one API instance, the snapshot moves to Redis and favorites move to Postgres, with a unique `(user_id, recipe_id)` index.
3. Anonymous recipe responses can send `ETag` and `Cache-Control`, so repeat views stop at the browser or a CDN.
4. If the catalog outgrew memory, it would move to Postgres, with Redis holding the hot ids. TheMealDB would remain the sync source.

### Projects

- `src/RecipeDiscovery.Api` — ASP.NET Core 8 with REST, HotChocolate, the TheMealDB client, the memory cache, favorites and demo auth.
- `tests/RecipeDiscovery.Api.Tests` — xUnit API and mapper tests, run offline against a fake TheMealDB client.
- `frontend` — Vite, React, TypeScript, MUI, Axios, Apollo Client and React Router, with Vitest and React Testing Library tests.
- `design-mockups` — static HTML mockups of the three themes.

On a host that sets `PORT`, the API binds `http://0.0.0.0:$PORT`.
