import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ShoppingList } from './ShoppingList';

const ingredients = [
  { name: 'Rice Stick Noodles', measure: '1/2 bag' },
  { name: 'Prawns', measure: '8 oz' },
];

describe('ShoppingList', () => {
  it('leads with the measure and tracks packed items', () => {
    render(<ShoppingList ingredients={ingredients} />);

    expect(screen.getByText('1/2 bag')).toBeInTheDocument();
    expect(screen.getByText('0 of 2 packed')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('checkbox', { name: '1/2 bag Rice Stick Noodles' }));

    expect(screen.getByRole('checkbox', { name: '1/2 bag Rice Stick Noodles' })).toBeChecked();
    expect(screen.getByText('1 of 2 packed')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Clear checks' }));

    expect(screen.getByRole('checkbox', { name: '8 oz Prawns' })).not.toBeChecked();
    expect(screen.getByText('0 of 2 packed')).toBeInTheDocument();
  });
});
