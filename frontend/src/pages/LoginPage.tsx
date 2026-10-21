import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState, type FormEvent } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { errorMessage } from '../api/errors';
import { useAuth } from '../auth/AuthProvider';
import { sampleKitchens, samplePassword } from '../auth/session';
import { AuthShell, PasswordField } from '../components/AuthShell';
import { useLook } from '../LookProvider';

export function LoginPage() {
  const { login } = useAuth();
  const look = useLook();
  const location = useLocation();
  const notice = (location.state as { notice?: string } | null)?.notice ?? '';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      await login(email, password);
    } catch (loginError: unknown) {
      setError(errorMessage(loginError));
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthShell kicker="Sign in" copy={look.copy.login} blurb="Each kitchen keeps its own favorites. Sign in with email, or create an account.">
      {notice ? (
        <Alert severity="success" sx={{ mb: 2 }}>
          {notice}
        </Alert>
      ) : null}
      {error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : null}
      <Box component="form" onSubmit={onSubmit} sx={{ display: 'grid', gap: 2 }}>
        <TextField
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          autoFocus
          required
          fullWidth
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <PasswordField label="Password" name="password" autoComplete="current-password" value={password} onChange={setPassword} />
        <Button type="submit" variant="contained" size="large" disabled={pending}>
          {pending ? <CircularProgress size={18} color="inherit" sx={{ mr: 1 }} aria-label="Signing in" /> : null}
          {pending ? 'Signing in' : 'Sign in'}
        </Button>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mt: 2 }}>
        <Link component={RouterLink} to="/forgot-password" underline="hover" sx={{ color: look.ink, fontWeight: 600 }}>
          Forgot password?
        </Link>
        <Link component={RouterLink} to="/register" underline="hover" sx={{ color: look.ink, fontWeight: 600 }}>
          Create an account
        </Link>
      </Box>
      <Typography sx={{ mt: 3, mb: 1, fontSize: '0.72rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'text.secondary' }}>
        Sample kitchens
      </Typography>
      <Box component="section" aria-label="Sample kitchens" sx={{ display: 'grid', gap: 1 }}>
        {sampleKitchens.map((kitchen) => (
          <Button
            key={kitchen.email}
            type="button"
            variant="outlined"
            onClick={() => {
              setEmail(kitchen.email);
              setPassword(samplePassword);
              setError(null);
            }}
            sx={{
              justifyContent: 'space-between',
              py: 1.1,
              px: 2,
              color: 'text.primary',
              '&:hover': { borderColor: look.ink, bgcolor: look.field },
            }}
          >
            <span>{kitchen.name}</span>
            <Box component="span" sx={{ color: 'text.secondary', fontWeight: 500 }}>
              {kitchen.email}
            </Box>
          </Button>
        ))}
      </Box>
      <Typography sx={{ mt: 1.25, color: 'text.secondary', fontSize: '0.85rem' }}>
        Fills the form. The shared password is {samplePassword}.
      </Typography>
    </AuthShell>
  );
}
