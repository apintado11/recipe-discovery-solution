# Recipe Discovery Platform

A .NET 8 API and React client for browsing recipes and saving favorites. REST and GraphQL run in the same process. [TheMealDB](https://www.themealdb.com/api.php) is the recipe source. Users and favorites live in this app.

The original brief is in [REQUIREMENTS.md](REQUIREMENTS.md). Submission steps are in [SUBMISSION.md](SUBMISSION.md).

## Run it

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

Open `http://localhost:5173`. The first screen is a quick login for Alex, Blair, or Casey. Each person has their own favorites. Log out from the bar to switch users. The Vite dev server proxies `/auth`, `/recipes`, `/cuisines`, `/users`, and `/graphql` to the API. To call the API from another origin, set `VITE_API_URL` (see `frontend/.env.example`). The API allows `http://localhost:5173`.

Tests:

```bash
dotnet test
cd frontend && npm test
```

## What the UI calls

| Page | Protocol | Call |
| --- | --- | --- |
| Sign in | REST | `POST /auth/login` |
| Browse, search, sort | REST | `GET /recipes` and `GET /cuisines` |
| Save a favorite | GraphQL | `addFavorite` |
| Recipe detail, including nutrition | GraphQL | `recipe(id)` |
| Favorites | GraphQL | `favorites(userId)` |

The UI will not show recipes until you pick a demo user. Favorite routes require that user's token. Recipe reads stay open so the samples below work without one.

## Sample requests

```bash
curl "http://localhost:5080/recipes?cuisine=Italian&sort=prepTime&direction=asc&page=1&pageSize=12"
curl "http://localhost:5080/recipes/52772"

TOKEN=$(curl -s -X POST "http://localhost:5080/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"alex"}' | python3 -c 'import json,sys; print(json.load(sys.stdin)["token"])')

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

Paste the recipe query into `http://localhost:5080/graphql`. Favorite queries and the `addFavorite` mutation need the login token: in the GraphQL IDE, set the header `Authorization: Bearer <token>` using the token from `POST /auth/login`. A missing recipe returns a GraphQL error with code `NOT_FOUND`. The same miss on REST is HTTP 404. A favorite call for someone else is HTTP 403, or GraphQL code `FORBIDDEN`. A favorite call with no token is HTTP 401. If TheMealDB cannot be reached, REST returns 503.

## Design choices

TheMealDB meals and this API's recipes are different shapes. A meal has `idMeal`, `strMeal`, `strArea`, `strInstructions`, a thumbnail, and up to 20 ingredient/measure pairs. It has no prep time, difficulty, user, or favorites.

`MealDbClient` reads that JSON. `RecipeMapper` turns one meal into a `Recipe`:

| Recipe field | Source |
| --- | --- |
| id, name, cuisine | `idMeal`, `strMeal`, `strArea` when it is set, otherwise `strCountry` |
| description | `strInstructions` |
| ingredients | ingredient and measure pairs, empty slots dropped |
| imageUrl | `strMealThumb` |
| preparationTimeMinutes | `15 + 2 per ingredient + 1 per 100 characters of instructions`, clamped to 10–120 |
| difficulty | Easy at 30 minutes or less and 8 ingredients or fewer; Hard at 60 minutes or more, or 12 ingredients or more; otherwise Medium |

Prep time and difficulty are estimates, computed once when the recipe is cached. The browse page says so.

Lists can be sorted by name, prep time, or difficulty, ascending or descending, with `sort` and `direction` on REST and GraphQL. Paging happens after the sort.

`nutrition` is a GraphQL field, not a REST property. The recipe resolver loads the meal from the catalog. A separate field resolver calls `NutritionSource`, a small ingredient table, and adds calories and protein. TheMealDB is not asked for nutrition. The detail page shows those numbers and labels them as estimates.

Sign-in is a JWT-style HMAC token, not a password system. `GET /auth/users` lists Alex (`1`), Blair (`2`), and Casey (`3`). `POST /auth/login` with `{ "username": "alex" }` returns a token that expires in 12 hours. The UI stores it in `sessionStorage` and sends `Authorization: Bearer` on later calls. Favorite routes require that token, and the user id in the request has to match the token. Logging out clears the token and the Apollo cache, so the next person starts from their own list.

Favorites are a separate store. Saving a favorite checks that the recipe id resolves, then stores the id. Adding the same id again does not duplicate it.

REST controllers and HotChocolate resolvers both call `RecipeService` and `FavoriteService`. GraphQL is not a second server. It is the `/graphql` endpoint on this host.

### Cache

TheMealDB area list includes countries that have no meals, so the app does not use that list as the cuisine dropdown. The first list or cuisine request builds a catalog from `search.php?f=a` through `search.php?f=z` (26 calls, a few at a time). Each call returns full meals. Those meals are mapped and stored in `RecipeCache`. Cuisines are the distinct areas on those meals, or the country when a meal has no area.

After that warm-up:

- List, search, cuisine, ingredient, and sort run on the in-memory catalog. Ingredient text matches an ingredient name. Search matches a recipe name.
- The list is paged after filtering (12 by default, 24 maximum).
- `GET /recipes/{id}` and `recipe(id)` return the cached recipe. An id that was not in the catalog still uses `lookup.php` once, behind a per-id lock, and is stored for next time.

The cache lasts for the life of the process. That matches a single-instance demo and keeps TheMealDB off the hot path after the first read.

### How this scales

The request path already depends on `RecipeService`, so the fill strategy can change without rewriting controllers, resolvers, or the UI.

1. A background refresh walks letters `a`–`z`, maps every meal, and swaps in a new in-memory snapshot. List, filter, and get-by-id then hit memory only. A failed refresh keeps the previous snapshot.
2. More than one API instance shares that snapshot in Redis. Favorites move to Postgres with a unique `(user_id, recipe_id)` index. The favorite stores the recipe id; the read model fills in the recipe.
3. Anonymous recipe responses can send `ETag` and `Cache-Control`, so repeat views stop at the browser or a CDN.
4. If the catalog outgrew memory, the snapshot would move to Postgres and Redis would keep the hot ids. TheMealDB would stay the sync source.

## Projects

- `src/RecipeDiscovery.Api` — ASP.NET Core 8, REST, HotChocolate, TheMealDB client, memory cache, favorites
- `tests/RecipeDiscovery.Api.Tests` — xUnit. `WebApplicationFactory` covers `GET /recipes/{id}` (hit and 404), sorting, the nutrition field, login, and the `addFavorite` mutation. A fake TheMealDB client keeps the tests offline. Mapper tests lock the difficulty estimate.
- `frontend` — Vite, React, TypeScript, MUI, Axios, Apollo Client. Vitest and React Testing Library cover the recipe card and the quick-login screen.

On a host that sets `PORT`, the API binds `http://0.0.0.0:$PORT`.
