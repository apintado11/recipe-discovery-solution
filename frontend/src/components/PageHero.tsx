import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';
import { useLook } from '../LookProvider';
import type { HeroCopy } from '../theme';
import { MenuRule } from './MenuRule';

type PageHeroProps = {
  copy: HeroCopy;
  kicker?: string;
  children?: ReactNode;
};

function MountainSketch({ color }: { color: string }) {
  return (
    <Box
      aria-hidden
      component="svg"
      viewBox="0 0 150 70"
      fill="none"
      stroke={color}
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      sx={{ position: 'absolute', right: 0, top: { xs: -6, md: -4 }, width: { xs: 132, md: 210 }, opacity: 0.8, pointerEvents: 'none' }}
    >
      <circle cx="122" cy="14" r="7" />
      <path d="M2 66 L34 30 L46 42 L70 12 L96 46 L108 36 L148 66" />
      <path d="M70 12 L66 24 M70 12 L76 26 M34 30 L32 38 M108 36 L106 44" opacity=".7" />
      <path d="M14 66 v-8 l-3 3 m3 -3 l3 3 M126 66 v-9 l-3 3 m3 -3 l3 3" opacity=".8" />
    </Box>
  );
}

export function PageHero({ copy, kicker, children }: PageHeroProps) {
  const look = useLook();
  const emphasis = (
    <Box component="span" sx={{ color: look.hero.emColor, fontStyle: look.hero.emItalic ? 'italic' : 'normal' }}>
      {copy.em}
    </Box>
  );

  return (
    <Box sx={{ position: 'relative', mb: 2.5 }}>
      {look.hero.sketch ? <MountainSketch color={look.ink} /> : null}
      {kicker ? (
        <Typography
          sx={{ color: look.accent, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', mb: 0.75 }}
        >
          {kicker}
        </Typography>
      ) : null}
      <Typography variant="h1" sx={{ fontSize: look.hero.size, position: 'relative', maxWidth: 640 }}>
        {copy.lead}
        {look.hero.stack ? <br /> : ' '}
        {emphasis}
        {copy.tail ? ` ${copy.tail}` : null}
      </Typography>
      <MenuRule />
      {children ? (
        <Typography
          sx={{
            maxWidth: 520,
            color: 'text.secondary',
            fontFamily: look.fonts.note,
            fontSize: look.fonts.note === look.fonts.body ? { xs: '0.92rem', md: '1rem' } : { xs: '1.2rem', md: '1.32rem' },
            lineHeight: 1.4,
          }}
        >
          {children}
        </Typography>
      ) : null}
    </Box>
  );
}
