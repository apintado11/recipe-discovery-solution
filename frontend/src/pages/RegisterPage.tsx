import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import { useState, type FormEvent } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { errorMessage } from '../api/errors';
import { useAuth } from '../auth/AuthProvider';
import { passwordProblem } from '../auth/password';
import { AuthShell, PasswordField } from '../components/AuthShell';
import { useLook } from '../LookProvider';

export function RegisterPage() {
  const { register } = useAuth();
  const look = useLook();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
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
      await register({ name, email, password });
    } catch (registerError: unknown) {
      setError(errorMessage(registerError));
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthShell
      kicker="Join"
      copy={{ lead: 'Create', em: 'account' }}
      blurb="A name, an email, and a password. Favorites stay with this kitchen."
    >
      {error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : null}
      <Box component="form" onSubmit={onSubmit} sx={{ display: 'grid', gap: 2 }}>
        <TextField
          label="Name"
          name="name"
          autoComplete="name"
          autoFocus
          required
          fullWidth
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <TextField
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          required
          fullWidth
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <PasswordField
          label="Password"
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
          {pending ? <CircularProgress size={18} color="inherit" sx={{ mr: 1 }} aria-label="Creating account" /> : null}
          {pending ? 'Creating account' : 'Create account'}
        </Button>
      </Box>
      <Box sx={{ mt: 2 }}>
        <Link component={RouterLink} to="/login" underline="hover" sx={{ color: look.ink, fontWeight: 600 }}>
          Already have an account? Sign in
        </Link>
      </Box>
    </AuthShell>
  );
}
