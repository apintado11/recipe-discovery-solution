export type Ingredient = {
  name: string;
  measure: string;
};

export type NutritionFacts = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  /** Milligrams. */
  sodium: number;
};

export type FoodGroup =
  | 'PROTEIN'
  | 'DAIRY'
  | 'GRAINS'
  | 'VEGETABLES'
  | 'FRUIT'
  | 'LEGUMES'
  | 'FATS_AND_OILS'
  | 'SWEETS'
  | 'SEASONING'
  | 'OTHER';

/** What list cards ask for. */
export type NutritionSummary = {
  servings: number;
  perServing: Pick<NutritionFacts, 'calories' | 'protein'>;
};

/** What the detail page asks for. Top-level facts are whole-recipe totals. */
export type Nutrition = NutritionFacts & {
  servings: number;
  perServing: NutritionFacts;
  /** Percent of daily value per serving, at the estimated serving count. */
  dailyValues: NutritionFacts;
  macros: { proteinPercent: number; carbsPercent: number; fatPercent: number };
  healthScore: number;
  grade: string;
  highlights: { label: string; positive: boolean }[];
  foodGroups: { group: FoodGroup; grams: number; percent: number }[];
  ingredients: {
    name: string;
    measure: string;
    grams: number;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    group: FoodGroup;
    matched: boolean;
  }[];
  matchedIngredients: number;
  totalIngredients: number;
};

export type Recipe = {
  id: string;
  name: string;
  description: string;
  ingredients: Ingredient[];
  cuisine: string;
  preparationTimeMinutes: number;
  difficulty: string;
  imageUrl?: string | null;
  nutrition?: NutritionSummary | null;
};

export type RecipeDetail = Recipe & {
  nutrition?: Nutrition | null;
};

export type RecipePage = {
  page: number;
  pageSize: number;
  total: number;
  items: Recipe[];
};
