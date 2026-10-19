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

export function LoginPage() {
  const { login } = useAuth();
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
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        px: 2,
        bgcolor: 'background.default',
      }}
    >
      <Paper sx={{ width: '100%', maxWidth: 440, p: { xs: 3, sm: 4 }, border: '1px solid #e4dccb' }} elevation={0}>
        <Typography variant="h1" sx={{ fontSize: '2.4rem', mb: 1 }}>
          Recipe Discovery
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Pick a demo cook. Each person keeps a separate favorites list. This sign-in issues a short-lived token. There is no password.
        </Typography>
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
        <Box sx={{ display: 'grid', gap: 1.5 }}>
          {users.map((user) => (
            <Button
              key={user.id}
              variant="contained"
              disabled={pending !== null}
              onClick={() => onLogin(user.username)}
            >
              {pending === user.username ? 'Signing in' : `Continue as ${displayName(user.username)}`}
            </Button>
          ))}
        </Box>
      </Paper>
    </Box>
  );
}
