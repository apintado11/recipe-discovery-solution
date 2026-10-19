import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider } from '../auth/AuthProvider';
import { theme } from '../theme';
import { LoginPage } from './LoginPage';

vi.mock('../api/auth', () => ({
  fetchDemoUsers: vi.fn(),
  loginRequest: vi.fn(),
}));

import { fetchDemoUsers } from '../api/auth';

describe('LoginPage', () => {
  beforeEach(() => {
    vi.mocked(fetchDemoUsers).mockResolvedValue([
      { id: '1', username: 'alex' },
      { id: '2', username: 'blair' },
      { id: '3', username: 'casey' },
    ]);
  });

  it('offers a quick login for each demo user', async () => {
    render(
      <ThemeProvider theme={theme}>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </ThemeProvider>,
    );

    expect(await screen.findByRole('button', { name: 'Continue as Alex' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continue as Blair' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continue as Casey' })).toBeInTheDocument();
  });
});