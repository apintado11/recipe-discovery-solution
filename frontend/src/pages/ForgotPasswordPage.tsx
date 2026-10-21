import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState, type FormEvent } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { fetchMailbox, forgotPassword, type LocalMessage } from '../api/auth';
import { errorMessage } from '../api/errors';
import { AuthShell } from '../components/AuthShell';
import { useLook } from '../LookProvider';

export function ForgotPasswordPage() {
  const look = useLook();
  const [email, setEmail] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [localDelivery, setLocalDelivery] = useState(false);
  const [message, setMessage] = useState<LocalMessage | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      const result = await forgotPassword(email.trim());
      setLocalDelivery(result.localDelivery);
      setSent(true);
      if (result.localDelivery) {
        const messages = await fetchMailbox(email.trim());
        setMessage(messages[0] ?? null);
      } else {
        setMessage(null);
      }
    } catch (forgotError: unknown) {
      setError(errorMessage(forgotError));
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthShell
      kicker="Reset"
      copy={{ lead: 'Forgot', em: 'password' }}
      blurb="Enter the email on the account. A reset link will be waiting in the local inbox."
    >
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
        <Button type="submit" variant="contained" size="large" disabled={pending}>
          {pending ? <CircularProgress size={18} color="inherit" sx={{ mr: 1 }} aria-label="Sending reset link" /> : null}
          {pending ? 'Sending' : 'Send reset link'}
        </Button>
      </Box>
      {sent && localDelivery ? (
        <Box sx={{ mt: 2.5, p: 2, borderRadius: 2, bgcolor: look.field, border: `1px solid ${look.line}` }} aria-live="polite">
          <Typography sx={{ fontSize: '0.72rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: look.accent, fontWeight: 700 }}>
            Local inbox
          </Typography>
          {message ? (
            <>
              <Typography sx={{ mt: 1.25, fontWeight: 700 }}>{message.subject}</Typography>
              <Typography sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
                To {message.to} · {formatSent(message.sentAt)}
              </Typography>
              <Typography sx={{ mt: 1.5 }}>{message.body}</Typography>
              <Button component="a" href={message.resetUrl} variant="contained" sx={{ mt: 2 }}>
                Choose a new password
              </Button>
            </>
          ) : (
            <Typography sx={{ mt: 1.25 }}>
              Nothing arrived for that address. Check the spelling, or create an account.
            </Typography>
          )}
        </Box>
      ) : null}
      {sent && !localDelivery ? (
        <Alert severity="success" sx={{ mt: 2 }}>
          If an account uses that email, a reset link is on its way.
        </Alert>
      ) : null}
      <Box sx={{ mt: 2 }}>
        <Link component={RouterLink} to="/login" underline="hover" sx={{ color: look.ink, fontWeight: 600 }}>
          Back to sign in
        </Link>
      </Box>
    </AuthShell>
  );
}

function formatSent(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}
