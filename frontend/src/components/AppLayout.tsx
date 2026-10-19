import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Container from '@mui/material/Container';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { Link as RouterLink, Outlet, useMatch } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { displayName } from '../auth/session';
import { useLook } from '../LookProvider';
import type { Look } from '../theme';
import { ThemeMenuButton } from './ThemePicker';

type NavItem = { to: string; label: string; short: string; icon: typeof MenuBookOutlinedIcon; current: boolean };

function greeting(now = new Date()) {
  const hour = now.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function AccountButton({ name, look, onLogout }: { name: string; look: Look; onLogout: () => void }) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const initial = name.slice(0, 1).toUpperCase();

  const face =
    look.nav === 'editorial' ? (
      <Typography component="span" sx={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', px: 0.5 }}>
        {name}
      </Typography>
    ) : (
      <Box
        component="span"
        sx={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          ...(look.nav === 'dock'
            ? { background: `linear-gradient(135deg, ${look.accent}, #b8803f)`, color: look.onAccent, fontWeight: 700 }
            : { border: `1.5px solid ${look.ink}`, fontFamily: look.fonts.note, fontSize: '1.3rem', fontWeight: 700 }),
        }}
      >
        {initial}
      </Box>
    );

  return (
    <>
      <ButtonBase
        aria-label={`Account for ${name}`}
        aria-haspopup="menu"
        aria-expanded={anchor ? true : undefined}
        onClick={(event) => setAnchor(event.currentTarget)}
        sx={{ borderRadius: 999, color: look.ink, minHeight: 36 }}
      >
        {face}
      </ButtonBase>
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { mt: 1, minWidth: 200 } } }}
      >
        <Typography sx={{ px: 2, py: 1, color: 'text.secondary', fontSize: '0.85rem' }}>Signed in as {name}</Typography>
        <MenuItem
          onClick={() => {
            setAnchor(null);
            onLogout();
          }}
        >
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Log out
        </MenuItem>
      </Menu>
    </>
  );
}

function Controls({ name, look, onLogout }: { name: string; look: Look; onLogout: () => void }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
      <ThemeMenuButton color={look.ink} />
      <AccountButton name={name} look={look} onLogout={onLogout} />
    </Box>
  );
}

function JournalPill({ items, look }: { items: NavItem[]; look: Look }) {
  return (
    <Box
      component="nav"
      aria-label="Primary"
      sx={{
        display: { xs: 'none', md: 'grid' },
        gridTemplateColumns: '1fr 1fr',
        gap: 0.5,
        p: 0.5,
        width: 320,
        borderRadius: 999,
        bgcolor: look.field,
        border: `1px solid ${look.line}`,
      }}
    >
      {items.map((item) => (
        <ButtonBase
          key={item.to}
          component={RouterLink}
          to={item.to}
          aria-current={item.current ? 'page' : undefined}
          sx={{
            py: 0.6,
            borderRadius: 999,
            fontFamily: look.fonts.note,
            fontSize: '1.4rem',
            fontWeight: 700,
            color: item.current ? look.onPrimary : look.ink,
            bgcolor: item.current ? look.primary : 'transparent',
          }}
        >
          {item.label}
        </ButtonBase>
      ))}
    </Box>
  );
}

function JournalTabBar({ items, look }: { items: NavItem[]; look: Look }) {
  return (
    <Box
      component="nav"
      aria-label="Primary"
      sx={{
        display: { xs: 'grid', md: 'none' },
        gridTemplateColumns: `repeat(${items.length}, 1fr)`,
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1100,
        pt: 1.25,
        pb: 'max(14px, env(safe-area-inset-bottom))',
        background: `linear-gradient(180deg, transparent, ${look.paper} 38%)`,
      }}
    >
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <ButtonBase
            key={item.to}
            component={RouterLink}
            to={item.to}
            aria-current={item.current ? 'page' : undefined}
            sx={{ display: 'grid', justifyItems: 'center', gap: 0.25, color: item.current ? look.ink : look.inkSoft, py: 0.5 }}
          >
            <Icon sx={{ fontSize: 22 }} />
            <Box component="span" sx={{ fontFamily: look.fonts.note, fontSize: '1.2rem', fontWeight: 700, lineHeight: 1 }}>
              {item.short}
            </Box>
            <Box
              aria-hidden
              component="svg"
              viewBox="0 0 22 6"
              sx={{ width: 22, height: 6, visibility: item.current ? 'visible' : 'hidden' }}
            >
              <path d="M1 4 Q 6 1 11 3.5 T 21 2.5" fill="none" stroke={look.accent} strokeWidth="1.6" strokeLinecap="round" />
            </Box>
          </ButtonBase>
        );
      })}
    </Box>
  );
}

function JournalHeader({ items, look, name, onLogout }: HeaderProps) {
  return (
    <Box component="header" sx={{ pt: { xs: 2, md: 2.5 }, pb: { xs: 1, md: 2 } }}>
      <Container sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            component={RouterLink}
            to="/"
            sx={{
              display: { xs: 'none', md: 'inline' },
              fontFamily: look.fonts.display,
              fontStyle: 'italic',
              fontSize: '1.9rem',
              color: look.ink,
              textDecoration: 'none',
            }}
          >
            Recipe Discovery
          </Typography>
          <Typography sx={{ display: { xs: 'block', md: 'none' }, fontFamily: look.fonts.note, fontSize: '1.45rem', color: look.inkSoft }}>
            {greeting().toLowerCase()}, {name}
          </Typography>
        </Box>
        <JournalPill items={items} look={look} />
        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
          <Controls name={name} look={look} onLogout={onLogout} />
        </Box>
      </Container>
      <JournalTabBar items={items} look={look} />
    </Box>
  );
}

function EditorialHeader({ items, look, name, onLogout }: HeaderProps) {
  return (
    <Box component="header" sx={{ position: 'sticky', top: 0, zIndex: 1100, ...look.background, backgroundAttachment: 'fixed', pt: 1.5 }}>
      <Container>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, pb: 1.25, borderBottom: `1px solid ${look.ink}` }}>
          <Typography
            component={RouterLink}
            to="/"
            sx={{ flex: 1, fontFamily: look.fonts.title, fontWeight: 600, fontSize: { xs: '1.3rem', md: '1.6rem' }, color: look.ink, textDecoration: 'none', letterSpacing: '-0.01em' }}
          >
            Recipe{' '}
            <Box component="span" sx={{ fontStyle: 'italic', fontWeight: 400, color: look.accent }}>
              Discovery
            </Box>
          </Typography>
          <Controls name={name} look={look} onLogout={onLogout} />
        </Box>
        <Box component="nav" aria-label="Primary" sx={{ display: 'flex', gap: 3, borderBottom: `1px solid ${look.line}` }}>
          {items.map((item) => (
            <ButtonBase
              key={item.to}
              component={RouterLink}
              to={item.to}
              aria-current={item.current ? 'page' : undefined}
              sx={{
                py: 1.25,
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: item.current ? look.ink : look.inkSoft,
                boxShadow: item.current ? `inset 0 -2px 0 ${look.accent}` : 'none',
              }}
            >
              {item.label}
            </ButtonBase>
          ))}
        </Box>
      </Container>
    </Box>
  );
}

function CandleHeader({ items, look, name, onLogout }: HeaderProps) {
  return (
    <Box component="header" sx={{ pt: { xs: 2, md: 3 }, pb: 1 }}>
      <Container sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: '0.85rem', color: look.inkSoft }}>{greeting()}</Typography>
          <Typography
            component={RouterLink}
            to="/"
            sx={{ fontFamily: look.fonts.title, fontWeight: 600, fontSize: { xs: '1.55rem', md: '1.8rem' }, color: look.ink, textDecoration: 'none', letterSpacing: '-0.02em' }}
          >
            {name}&apos;s kitchen
          </Typography>
        </Box>
        <Controls name={name} look={look} onLogout={onLogout} />
      </Container>
      <Box
        component="nav"
        aria-label="Primary"
        sx={{
          position: 'fixed',
          left: '50%',
          bottom: 'max(22px, env(safe-area-inset-bottom))',
          transform: 'translateX(-50%)',
          zIndex: 1100,
          display: 'flex',
          gap: 0.75,
          p: 0.75,
          borderRadius: '24px',
          bgcolor: 'rgba(20, 36, 28, 0.72)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.45)',
        }}
      >
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <ButtonBase
              key={item.to}
              component={RouterLink}
              to={item.to}
              aria-current={item.current ? 'page' : undefined}
              sx={{
                gap: 1,
                px: 2.25,
                py: 1.25,
                borderRadius: '18px',
                fontWeight: 600,
                fontSize: '0.92rem',
                color: item.current ? look.onPrimary : look.inkSoft,
                bgcolor: item.current ? look.primary : 'transparent',
              }}
            >
              <Icon sx={{ fontSize: 18 }} />
              {item.label}
            </ButtonBase>
          );
        })}
      </Box>
    </Box>
  );
}

type HeaderProps = { items: NavItem[]; look: Look; name: string; onLogout: () => void };

const HEADERS: Record<Look['nav'], typeof JournalHeader> = {
  journal: JournalHeader,
  editorial: EditorialHeader,
  dock: CandleHeader,
};

export function AppLayout() {
  const { session, logout } = useAuth();
  const look = useLook();
  const onFavorites = Boolean(useMatch('/favorites'));
  const name = session ? displayName(session.user.username) : '';
  const items: NavItem[] = [
    { to: '/', label: 'Recipes', short: 'recipes', icon: MenuBookOutlinedIcon, current: !onFavorites },
    { to: '/favorites', label: 'Favorites', short: 'saved', icon: FavoriteBorderIcon, current: onFavorites },
  ];
  const Header = HEADERS[look.nav];
  const bottomSpace = look.nav === 'dock' ? 14 : look.nav === 'journal' ? { xs: 13, md: 6 } : 6;

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <Header items={items} look={look} name={name} onLogout={logout} />
      <Container component="main" sx={{ pt: { xs: 1.5, md: 3 }, pb: bottomSpace }}>
        <Outlet />
      </Container>
    </Box>
  );
}
