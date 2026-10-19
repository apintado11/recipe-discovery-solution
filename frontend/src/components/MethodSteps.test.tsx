import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MethodSteps } from './MethodSteps';

const method = `STEP 1 - SOAK THE RICE NOODLES
Soak the rice noodles overnight untill they are soft
STEP 2 - BOIL THE RICE NOODLES
Boil the noodles for 10-15 minutes.`;

describe('MethodSteps', () => {
  it('focuses one step at a time and highlights times', () => {
    render(<MethodSteps description={method} />);

    expect(screen.getByRole('button', { current: 'step' })).toHaveTextContent('Soak the Rice Noodles');
    expect(screen.getByText('overnight').tagName).toBe('MARK');
    expect(screen.getByText('Step 1 of 2')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Next' }));

    expect(screen.getByText('Step 2 of 2')).toBeInTheDocument();
    expect(screen.getByRole('button', { current: 'step' })).toHaveTextContent('10-15 minutes');
    expect(screen.getByText('10-15 minutes').tagName).toBe('MARK');
  });
});