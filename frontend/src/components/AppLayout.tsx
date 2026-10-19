import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { Link as RouterLink, Outlet, useMatch } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { displayName } from '../auth/session';

export function AppLayout() {
  const { session, logout } = useAuth();
  const onFavorites = useMatch('/favorites');
  const onRecipes = !onFavorites;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="sticky" elevation={0} color="primary">
        <Toolbar sx={{ flexWrap: 'wrap', gap: 0.5 }}>
          <Typography
            variant="h3"
            component={RouterLink}
            to="/"
            sx={{ flexGrow: 1, color: 'inherit', textDecoration: 'none', fontSize: '1.6rem' }}
          >
            Recipe Discovery
          </Typography>
          <Button component={RouterLink} to="/" color="inherit" aria-current={onRecipes ? 'page' : undefined}>
            Recipes
          </Button>
          <Button
            component={RouterLink}
            to="/favorites"
            color="inherit"
            aria-current={onFavorites ? 'page' : undefined}
          >
            Favorites
          </Button>
          <Typography sx={{ ml: 2, mr: 1 }}>{session ? displayName(session.user.username) : ''}</Typography>
          <Button color="inherit" onClick={logout}>
            Log out
          </Button>
        </Toolbar>
      </AppBar>
      <Container component="main" sx={{ py: 4 }}>
        <Outlet />
      </Container>
    </Box>
  );
}
