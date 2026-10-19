import { gql } from '@apollo/client';

const RECIPE_FIELDS = gql`
  fragment RecipeFields on Recipe {
    id
    name
    description
    cuisine
    preparationTimeMinutes
    difficulty
    imageUrl
    ingredients {
      name
      measure
    }
  }
`;

export const RECIPE_QUERY = gql`
  query Recipe($id: ID!) {
    recipe(id: $id) {
      ...RecipeFields
    }
  }
  ${RECIPE_FIELDS}
`;

export const FAVORITES_QUERY = gql`
  query Favorites($userId: ID!) {
    favorites(userId: $userId) {
      ...RecipeFields
    }
  }
  ${RECIPE_FIELDS}
`;

export const FAVORITE_IDS_QUERY = gql`
  query FavoriteIds($userId: ID!) {
    favorites(userId: $userId) {
      id
    }
  }
`;

export const ADD_FAVORITE = gql`
  mutation AddFavorite($userId: ID!, $recipeId: ID!) {
    addFavorite(userId: $userId, recipeId: $recipeId) {
      id
      name
    }
  }
`;
