import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState, type ReactNode } from 'react';
import { PageHero } from './PageHero';
import { ThemeSwatches } from './ThemePicker';
import { useLook } from '../LookProvider';
import { panelSx, type HeroCopy } from '../theme';

type AuthShellProps = {
  kicker: string;
  copy: HeroCopy;
  blurb: string;
  children: ReactNode;
};

export function AuthShell({ kicker, copy, blurb, children }: AuthShellProps) {
  const look = useLook();

  return (
    <Box component="main" sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', px: 2, py: 4 }}>
      <Paper elevation={0} sx={{ ...panelSx(look), width: '100%', maxWidth: 480, p: { xs: 3.5, sm: 4.5 } }}>
        <PageHero copy={copy} kicker={kicker}>
          {blurb}
        </PageHero>
        {children}
        <Typography sx={{ mt: 3, mb: 1, fontSize: '0.72rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'text.secondary' }}>
          Theme
        </Typography>
        <ThemeSwatches />
      </Paper>
    </Box>
  );
}

type PasswordFieldProps = {
  label: string;
  name: string;
  value: string;
  autoComplete: string;
  onChange: (value: string) => void;
  helperText?: string;
  error?: boolean;
};

export function PasswordField({ label, name, value, autoComplete, onChange, helperText, error }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <TextField
      label={label}
      type={visible ? 'text' : 'password'}
      name={name}
      autoComplete={autoComplete}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      required
      fullWidth
      error={error}
      helperText={helperText}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              type="button"
              aria-label={visible ? 'Hide password' : 'Show password'}
              onClick={() => setVisible((current) => !current)}
              edge="end"
            >
              {visible ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );
}
