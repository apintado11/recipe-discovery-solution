import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { fetchDemoUsers } from '../api/auth';
import { errorMessage } from '../api/errors';
import { useAuth } from '../auth/AuthProvider';
import { displayName, type DemoUser } from '../auth/session';
import { PageHero } from '../components/PageHero';
import { ThemeSwatches } from '../components/ThemePicker';
import { useLook } from '../LookProvider';
import { panelSx } from '../theme';

export function LoginPage() {
  const { login } = useAuth();
  const look = useLook();
  const [users, setUsers] = useState<DemoUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetchDemoUsers()
      .then((next) => {
        if (!controller.signal.aborted) {
          setUsers(next);
        }
      })
      .catch((fetchError: unknown) => {
        if (!controller.signal.aborted) {
          setError(errorMessage(fetchError));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, []);

  async function onLogin(username: string) {
    setPending(username);
    setError(null);
    try {
      await login(username);
    } catch (loginError: unknown) {
      setError(errorMessage(loginError));
    } finally {
      setPending(null);
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', px: 2, py: 4 }}>
      <Paper elevation={0} sx={{ ...panelSx(look), width: '100%', maxWidth: 460, p: { xs: 3.5, sm: 4.5 } }}>
        <PageHero copy={look.copy.login}>
          Pick a demo cook. Each person keeps a separate favorites list. This sign-in issues a short-lived token. There is no
          password.
        </PageHero>
        {loading ? (
          <Box role="status" aria-live="polite" sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress aria-label="Loading accounts" />
          </Box>
        ) : null}
        {error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : null}
        <Box sx={{ display: 'grid', gap: 1.25 }}>
          {users.map((user) => (
            <Button
              key={user.id}
              variant="outlined"
              disabled={pending !== null}
              onClick={() => onLogin(user.username)}
              sx={{
                justifyContent: 'flex-start',
                py: 1.25,
                px: 2,
                color: 'text.primary',
                '&:hover': { borderColor: look.ink, bgcolor: look.field },
              }}
            >
              {pending === user.username ? 'Signing in' : `Continue as ${displayName(user.username)}`}
            </Button>
          ))}
        </Box>
        <Typography sx={{ mt: 3, mb: 1, fontSize: '0.72rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'text.secondary' }}>
          Theme
        </Typography>
        <ThemeSwatches />
      </Paper>
    </Box>
  );
}
