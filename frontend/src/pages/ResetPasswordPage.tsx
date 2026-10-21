import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Link from '@mui/material/Link';
import { useState, type FormEvent } from 'react';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
import { resetPassword } from '../api/auth';
import { errorMessage } from '../api/errors';
import { useAuth } from '../auth/AuthProvider';
import { passwordProblem } from '../auth/password';
import { AuthShell, PasswordField } from '../components/AuthShell';
import { useLook } from '../LookProvider';

export function ResetPasswordPage() {
  const { logout } = useAuth();
  const look = useLook();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const mismatch = confirm !== password ? 'Those passwords don\'t match.' : null;
    const problem = mismatch ?? passwordProblem(password);
    if (problem) {
      setError(problem);
      return;
    }

    setPending(true);
    setError(null);
    try {
      await resetPassword(token, password);
      await logout();
      navigate('/login', { replace: true, state: { notice: 'Password updated. Sign in with the new one.' } });
    } catch (resetError: unknown) {
      setError(errorMessage(resetError));
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthShell
      kicker="Reset"
      copy={{ lead: 'New', em: 'password' }}
      blurb="Choose a password for this kitchen. The old one stops working, including on other devices."
    >
      {!token ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          That reset link is incomplete. Request a new one.
        </Alert>
      ) : null}
      {error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : null}
      {token ? (
        <Box component="form" onSubmit={onSubmit} sx={{ display: 'grid', gap: 2 }}>
          <PasswordField
            label="New password"
            name="new-password"
            autoComplete="new-password"
            value={password}
            onChange={setPassword}
            helperText="At least 8 characters, with a letter and a number."
          />
          <PasswordField
            label="Confirm password"
            name="confirm-password"
            autoComplete="new-password"
            value={confirm}
            onChange={setConfirm}
            error={confirm.length > 0 && confirm !== password}
            helperText={confirm.length > 0 && confirm !== password ? 'Those passwords don\'t match.' : undefined}
          />
          <Button type="submit" variant="contained" size="large" disabled={pending}>
            {pending ? <CircularProgress size={18} color="inherit" sx={{ mr: 1 }} aria-label="Updating password" /> : null}
            {pending ? 'Updating' : 'Update password'}
          </Button>
        </Box>
      ) : (
        <Button component={RouterLink} to="/forgot-password" variant="contained" size="large">
          Request a new link
        </Button>
      )}
      <Box sx={{ mt: 2 }}>
        <Link component={RouterLink} to="/login" underline="hover" sx={{ color: look.ink, fontWeight: 600 }}>
          Back to sign in
        </Link>
      </Box>
    </AuthShell>
  );
}
