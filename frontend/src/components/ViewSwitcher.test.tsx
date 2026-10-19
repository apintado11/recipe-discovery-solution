import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ViewSwitcher } from './ViewSwitcher';

describe('ViewSwitcher', () => {
  it('reports the layout that was chosen', () => {
    const onChange = vi.fn();
    render(<ViewSwitcher value="card" onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: 'List layout' }));
    fireEvent.click(screen.getByRole('button', { name: 'Compact layout' }));

    expect(onChange).toHaveBeenNthCalledWith(1, 'list');
    expect(onChange).toHaveBeenNthCalledWith(2, 'compact');
  });
});
