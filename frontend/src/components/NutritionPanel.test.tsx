import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { Nutrition } from '../types';
import { NutritionPanel } from './NutritionPanel';

const facts = { calories: 1200, protein: 90, carbs: 60, fat: 40, fiber: 12, sugar: 8, sodium: 1600 };

const nutrition: Nutrition = {
  ...facts,
  servings: 2,
  perServing: { calories: 600, protein: 45, carbs: 30, fat: 20, fiber: 6, sugar: 4, sodium: 800 },
  dailyValues: { calories: 30, protein: 90, carbs: 11, fat: 26, fiber: 21, sugar: 8, sodium: 35 },
  macros: { proteinPercent: 37, carbsPercent: 25, fatPercent: 38 },
  healthScore: 84,
  grade: 'A',
  highlights: [
    { label: 'High protein', positive: true },
    { label: 'High sodium', positive: false },
  ],
  foodGroups: [
    { group: 'PROTEIN', grams: 500, percent: 62 },
    { group: 'VEGETABLES', grams: 300, percent: 38 },
  ],
  ingredients: [
    { name: 'Chicken Breast', measure: '500g', grams: 500, calories: 825, protein: 155, carbs: 0, fat: 18, group: 'PROTEIN', matched: true },
    { name: 'Mystery Spice', measure: '1 tsp', grams: 4, calories: 4, protein: 0, carbs: 0, fat: 0, group: 'OTHER', matched: false },
  ],
  matchedIngredients: 1,
  totalIngredients: 2,
};

describe('NutritionPanel', () => {
  it('shows per-serving numbers and rescales when servings change', () => {
    render(<NutritionPanel nutrition={nutrition} />);

    expect(screen.getByText('600')).toBeInTheDocument();
    expect(screen.getByText('Serves 2')).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: 'Protein: 45 g, 90% of daily value' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Health score 84 out of 100, grade A' })).toBeInTheDocument();
    expect(screen.getByText('High protein')).toBeInTheDocument();
    expect(screen.getByText('High sodium')).toBeInTheDocument();
    expect(screen.getByText(/4 g · estimated/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'More servings' }));

    expect(screen.getByText('Serves 3')).toBeInTheDocument();
    expect(screen.getByText('400')).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: 'Protein: 30 g, 60% of daily value' })).toBeInTheDocument();
  });

  it('stops at one serving', () => {
    render(<NutritionPanel nutrition={{ ...nutrition, servings: 1 }} />);

    expect(screen.getByRole('button', { name: 'Fewer servings' })).toBeDisabled();
  });
});
