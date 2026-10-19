export type Ingredient = {
  name: string;
  measure: string;
};

export type Nutrition = {
  calories: number;
  protein: number;
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
  nutrition?: Nutrition | null;
};

export type RecipePage = {
  page: number;
  pageSize: number;
  total: number;
  items: Recipe[];
};
