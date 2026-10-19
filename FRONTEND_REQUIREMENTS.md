## Front-End Challenge: React Application with MUI

In addition to the backend, build a React front-end that interacts with your API, using **MUI (Material-UI)** components from `mui.com`.

#### Recipe Browsing Page
- Display a list of recipes fetched from the backend using MUI components (e.g., `Card`, `Grid`, `TextField` for filtering).
- Support filtering by at least one criterion (e.g., cuisine or ingredient) using either:
  - REST: `GET /recipes?cuisine=Italian`
  - GraphQL: `recipes(cuisine: "Italian")`
- Show recipe details (e.g., name, ingredients, cuisine) in a visually appealing format.

#### Recipe Details Page
- Create a dedicated view for a single recipe, accessible by clicking a recipe from the list, using MUI components (e.g., `Typography`, `List`).
- Fetch data using either:
  - REST: `GET /recipes/{id}`
  - GraphQL: `recipe(id: "123")`
- Display all available recipe fields (e.g., description, prep time, difficulty).

#### Favorites Management
- Allow users to add a recipe to their favorites via an MUI `Button` or `IconButton`:
  - POST to REST: `/users/{userId}/favorites`
  - GraphQL mutation
- Display a user’s favorite recipes in a separate section or page, styled with MUI, fetched via:
  - REST: `GET /users/{userId}/favorites`
  - GraphQL query
- Use a hardcoded `userId` (e.g., `"1"`) for simplicity.

#### API Integration
- Use REST for at least one feature (e.g., recipe list).
- Use GraphQL for at least one feature (e.g., recipe details or favorites).
- Handle loading states with MUI’s `CircularProgress` and errors with `Alert`.

### Technical Requirements
- **Framework**: Use React (Create React App, Vite, or similar).
- **Component Library**: Use MUI components from `mui.com` (`@mui/material`) for all UI elements.
- **GraphQL Client**: Use Apollo Client (`@apollo/client`) or another library (e.g., `urql`) for GraphQL queries/mutations.
- **REST Client**: Use `fetch` or `axios` for REST API calls.
- **Styling**: Customize MUI components using the `@mui/system` `sx` prop or a theme (no raw CSS unless necessary for minor tweaks).
- **Routing**: Use React Router (`react-router-dom`) for navigation between pages (e.g., recipe list → details).
- **State Management**: Manage state with React hooks (`useState`, `useEffect`) or a library like Redux (optional).

### Bonus Features (Optional)
- Add pagination with MUI’s `Pagination` or infinite scrolling for the recipe list.
- Implement a search bar with MUI’s `TextField` and `IconButton`.
- Use TypeScript for type safety.
- Add unit tests with Jest or React Testing Library.

### Deliverables
- Place code in a `frontend/` folder.
- Include a `frontend/README.md` with setup instructions (e.g., `npm install && npm start`).
- Explain your design choices (e.g., MUI usage, API integration) in the README.


### Setup
1. Ensure your backend is running (e.g., `dotnet run` on `http://localhost:5000`).
2. Create a React app: `npx create-react-app frontend`.
3. Install dependencies: `npm install @mui/material @emotion/react @emotion/styled @apollo/client graphql react-router-dom`.
4. Run: `npm start`.
