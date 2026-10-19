import CheckIcon from '@mui/icons-material/Check';
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { useLookChoice } from '../LookProvider';
import { lookOrder, looks, type Look } from '../theme';

function Swatch({ look, size = 26 }: { look: Look; size?: number }) {
  const [a, b, c] = look.swatches;
  return (
    <Box
      aria-hidden
      sx={{
        width: size,
        height: size,
        borderRadius: '50%',
        flexShrink: 0,
        background: `conic-gradient(${a} 0 50%, ${b} 50% 80%, ${c} 80% 100%)`,
        boxShadow: '0 0 0 1px rgba(127, 127, 127, 0.35)',
      }}
    />
  );
}

export function ThemeMenuButton({ color }: { color: string }) {
  const { look, setLook } = useLookChoice();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  return (
    <>
      <IconButton
        aria-label="Change theme"
        aria-haspopup="menu"
        aria-expanded={anchor ? true : undefined}
        onClick={(event) => setAnchor(event.currentTarget)}
        size="small"
        sx={{ width: 36, height: 36, color, border: `1px solid ${look.lineStrong}` }}
      >
        <PaletteOutlinedIcon sx={{ fontSize: 18 }} />
      </IconButton>
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { mt: 1, minWidth: 260 } } }}
      >
        <Typography sx={{ px: 2, pt: 1, pb: 0.5, fontSize: '0.72rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'text.secondary' }}>
          Theme
        </Typography>
        {lookOrder.map((id) => {
          const option = looks[id];
          return (
            <MenuItem
              key={id}
              selected={id === look.id}
              onClick={() => {
                setLook(id);
                setAnchor(null);
              }}
              sx={{ gap: 1.5, py: 1 }}
            >
              <Swatch look={option} />
              <ListItemText primary={option.name} secondary={option.blurb} />
              <ListItemIcon sx={{ minWidth: 0, visibility: id === look.id ? 'visible' : 'hidden' }}>
                <CheckIcon fontSize="small" />
              </ListItemIcon>
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
}

export function ThemeSwatches() {
  const { look, setLook } = useLookChoice();

  return (
    <Box role="radiogroup" aria-label="Theme" sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
      {lookOrder.map((id) => {
        const option = looks[id];
        const current = id === look.id;
        return (
          <Box
            key={id}
            component="button"
            type="button"
            role="radio"
            aria-checked={current}
            onClick={() => setLook(id)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 1.25,
              py: 0.75,
              borderRadius: 999,
              font: 'inherit',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              color: current ? look.onPrimary : look.ink,
              bgcolor: current ? look.primary : 'transparent',
              border: `1px solid ${current ? look.primary : look.lineStrong}`,
            }}
          >
            <Swatch look={option} size={18} />
            {option.name}
          </Box>
        );
      })}
    </Box>
  );
}
