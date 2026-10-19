import { api } from './client';
import type { RecipePage } from '../types';

export type RecipeFilters = {
  cuisine?: string;
  ingredient?: string;
  search?: string;
  sort?: string;
  direction?: string;
  page: number;
  pageSize?: number;
};

export async function fetchRecipes(filters: RecipeFilters, signal?: AbortSignal): Promise<RecipePage> {
  const params: Record<string, string | number> = { page: filters.page };
  if (filters.pageSize) {
    params.pageSize = filters.pageSize;
  }
  if (filters.cuisine) {
    params.cuisine = filters.cuisine;
  }
  if (filters.ingredient) {
    params.ingredient = filters.ingredient;
  }
  if (filters.search) {
    params.search = filters.search;
  }
  if (filters.sort) {
    params.sort = filters.sort;
  }
  if (filters.direction) {
    params.direction = filters.direction;
  }

  const { data } = await api.get<RecipePage>('/recipes', { params, signal });
  return data;
}

export async function fetchCuisines(signal?: AbortSignal): Promise<string[]> {
  const { data } = await api.get<string[]>('/cuisines', { signal });
  return data;
}
