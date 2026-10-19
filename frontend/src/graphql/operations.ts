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

const FACTS = gql`
  fragment Facts on NutritionFacts {
    calories
    protein
    carbs
    fat
    fiber
    sugar
    sodium
  }
`;

export const RECIPE_QUERY = gql`
  query Recipe($id: ID!) {
    recipe(id: $id) {
      ...RecipeFields
      nutrition {
        calories
        protein
        carbs
        fat
        fiber
        sugar
        sodium
        servings
        perServing {
          ...Facts
        }
        dailyValues {
          ...Facts
        }
        macros {
          proteinPercent
          carbsPercent
          fatPercent
        }
        healthScore
        grade
        highlights {
          label
          positive
        }
        foodGroups {
          group
          grams
          percent
        }
        ingredients {
          name
          measure
          grams
          calories
          protein
          carbs
          fat
          group
          matched
        }
        matchedIngredients
        totalIngredients
      }
    }
  }
  ${RECIPE_FIELDS}
  ${FACTS}
`;

export const FAVORITES_QUERY = gql`
  query Favorites($userId: ID!) {
    favorites(userId: $userId) {
      ...RecipeFields
      nutrition {
        servings
        perServing {
          calories
          protein
        }
      }
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
