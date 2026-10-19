import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: { main: '#1f4d3a', contrastText: '#f6f1e7' },
    secondary: { main: '#c4553a', contrastText: '#fffdf8' },
    background: { default: '#f3efe6', paper: '#fffdf8' },
    text: { primary: '#1f1a17', secondary: '#5c5148' },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: '"Outfit", "Segoe UI", sans-serif',
    h1: { fontFamily: '"Fraunces", Georgia, serif', fontWeight: 560 },
    h2: { fontFamily: '"Fraunces", Georgia, serif', fontWeight: 560 },
    h3: { fontFamily: '"Fraunces", Georgia, serif', fontWeight: 560 },
    h4: { fontFamily: '"Fraunces", Georgia, serif', fontWeight: 560 },
  },
});
