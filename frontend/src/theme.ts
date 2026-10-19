import { createTheme } from '@mui/material/styles';

export type LookId = 'journal' | 'editorial' | 'candlelight';

export type HeroCopy = { lead: string; em: string; tail?: string };

type Tone = { ink: string; inkSoft: string; chipBg: string; chipBorder: string };

export type Look = {
  id: LookId;
  name: string;
  blurb: string;
  swatches: [string, string, string];
  mode: 'light' | 'dark';
  nav: 'journal' | 'editorial' | 'dock';
  page: string;
  background: { backgroundColor: string; backgroundImage: string; backgroundBlendMode: string };
  ink: string;
  inkSoft: string;
  primary: string;
  onPrimary: string;
  accent: string;
  onAccent: string;
  line: string;
  lineStrong: string;
  field: string;
  paper: string;
  fonts: { body: string; display: string; title: string; note: string };
  hero: { weight: number; size: { xs: string; md: string }; emColor: string; emItalic: boolean; stack: boolean; sketch: boolean };
  section: { family: string; italic: boolean; weight: number; size: string };
  panel: { bg: string; border: string; shadow: string; radius: string; blur: boolean };
  card: Tone & {
    surface: string;
    border: string;
    shadow: string;
    radius: string;
    photoRadius: string;
    mat: number;
    heart: string;
    heartBg: string;
    heartBorder: string;
    overlay: boolean;
    tagOnPhoto: boolean;
    numbered: boolean;
    tilt: boolean;
    listSurface: 'card' | 'rule' | 'dashed';
    metaCaps: boolean;
  };
  pageTone: Tone;
  chip: { radius: string; caps: boolean };
  mark: { timeInk: string; timeBg: string; measureInk: string; measureBg: string };
  row: { bg: string; checkedBg: string; border: string; selectedBg: string; selectedBorder: string };
  rule: 'squiggle' | 'bar' | 'none';
  copy: { browse: HeroCopy; favorites: HeroCopy; login: HeroCopy };
};

const sans = '"DM Sans", "Segoe UI", system-ui, sans-serif';
const fraunces = '"Fraunces", Georgia, serif';
const instrument = '"Instrument Serif", Georgia, serif';
const caveat = '"Caveat", "Segoe Print", cursive';

function grain(rgb: string, alpha: number) {
  const [r, g, b] = rgb.split(',').map((value) => (Number(value) / 255).toFixed(3));
  return `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 ${r} 0 0 0 0 ${g} 0 0 0 0 ${b} 0 0 0 ${alpha} 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;
}

const journal: Look = {
  id: 'journal',
  name: 'Field Journal',
  blurb: 'Green paper, cream ink, handwritten notes',
  swatches: ['#1e4a37', '#f5efe2', '#e8c47c'],
  mode: 'dark',
  nav: 'journal',
  page: '#1e4a37',
  background: {
    backgroundColor: '#1e4a37',
    backgroundImage: [
      grain('255,255,255', 0.5),
      'radial-gradient(120% 60% at 85% -10%, rgba(255, 215, 150, 0.2), transparent 60%)',
      'radial-gradient(90% 50% at 0% 0%, rgba(190, 230, 200, 0.1), transparent 60%)',
    ].join(', '),
    backgroundBlendMode: 'soft-light, normal, normal',
  },
  ink: '#f5efe2',
  inkSoft: '#d2cbb9',
  primary: '#f5efe2',
  onPrimary: '#1e4a37',
  accent: '#e8c47c',
  onAccent: '#1e3b2d',
  line: 'rgba(245, 239, 226, 0.22)',
  lineStrong: 'rgba(245, 239, 226, 0.5)',
  field: 'rgba(10, 36, 26, 0.25)',
  paper: '#1a4231',
  fonts: { body: sans, display: instrument, title: fraunces, note: caveat },
  hero: { weight: 400, size: { xs: '2.9rem', md: '4.2rem' }, emColor: '#e8c47c', emItalic: true, stack: true, sketch: true },
  section: { family: instrument, italic: true, weight: 400, size: '2rem' },
  panel: { bg: '#1a4231', border: 'rgba(245, 239, 226, 0.2)', shadow: '0 18px 40px rgba(0, 0, 0, 0.22)', radius: '18px', blur: false },
  card: {
    surface: '#f5efe2',
    ink: '#1e3b2d',
    inkSoft: '#56665a',
    chipBg: 'transparent',
    chipBorder: 'rgba(30, 59, 45, 0.25)',
    border: 'transparent',
    shadow: '0 14px 28px rgba(0, 0, 0, 0.28)',
    radius: '6px',
    photoRadius: '3px',
    mat: 1,
    heart: '#a8442a',
    heartBg: 'rgba(245, 239, 226, 0.92)',
    heartBorder: 'transparent',
    overlay: false,
    tagOnPhoto: false,
    numbered: false,
    tilt: true,
    listSurface: 'dashed',
    metaCaps: false,
  },
  pageTone: { ink: '#f5efe2', inkSoft: '#d2cbb9', chipBg: 'rgba(10, 36, 26, 0.25)', chipBorder: 'rgba(245, 239, 226, 0.3)' },
  chip: { radius: '999px', caps: false },
  mark: { timeInk: '#f5efe2', timeBg: 'rgba(245, 239, 226, 0.14)', measureInk: '#e8c47c', measureBg: 'rgba(232, 196, 124, 0.16)' },
  row: {
    bg: 'rgba(10, 36, 26, 0.22)',
    checkedBg: 'rgba(245, 239, 226, 0.08)',
    border: 'rgba(245, 239, 226, 0.18)',
    selectedBg: '#24563f',
    selectedBorder: '#f5efe2',
  },
  rule: 'squiggle',
  copy: {
    browse: { lead: 'What are we', em: 'cooking', tail: 'today?' },
    favorites: { lead: 'Saved', em: 'recipes' },
    login: { lead: 'Recipe', em: 'Discovery' },
  },
};

const editorial: Look = {
  id: 'editorial',
  name: 'Cookbook Editorial',
  blurb: 'Warm paper, serif type, a printed cookbook',
  swatches: ['#f4eee2', '#1d3a2c', '#b4532c'],
  mode: 'light',
  nav: 'editorial',
  page: '#f4eee2',
  background: {
    backgroundColor: '#f4eee2',
    backgroundImage: [
      grain('140,122,92', 0.35),
      'radial-gradient(100% 50% at 50% -10%, rgba(255, 252, 244, 0.8), transparent 70%)',
    ].join(', '),
    backgroundBlendMode: 'multiply, normal',
  },
  ink: '#1d3a2c',
  inkSoft: '#5c6559',
  primary: '#1d3a2c',
  onPrimary: '#f8f3e8',
  accent: '#b4532c',
  onAccent: '#fdf8ef',
  line: '#ddd3bf',
  lineStrong: '#bfb39b',
  field: '#fffaf0',
  paper: '#fbf7ee',
  fonts: { body: sans, display: fraunces, title: fraunces, note: sans },
  hero: { weight: 400, size: { xs: '2.6rem', md: '3.9rem' }, emColor: '#1d3a2c', emItalic: true, stack: true, sketch: false },
  section: { family: fraunces, italic: false, weight: 600, size: '1.55rem' },
  panel: { bg: '#fbf7ee', border: '#ddd3bf', shadow: 'none', radius: '4px', blur: false },
  card: {
    surface: 'transparent',
    ink: '#1d3a2c',
    inkSoft: '#5c6559',
    chipBg: '#f4eee2',
    chipBorder: 'transparent',
    border: 'transparent',
    shadow: 'none',
    radius: '0px',
    photoRadius: '3px',
    mat: 0,
    heart: '#1d3a2c',
    heartBg: '#f4eee2',
    heartBorder: '#1d3a2c',
    overlay: false,
    tagOnPhoto: true,
    numbered: true,
    tilt: false,
    listSurface: 'rule',
    metaCaps: true,
  },
  pageTone: { ink: '#1d3a2c', inkSoft: '#5c6559', chipBg: '#fffaf0', chipBorder: '#ddd3bf' },
  chip: { radius: '2px', caps: true },
  mark: { timeInk: '#1d3a2c', timeBg: '#e1e9dc', measureInk: '#93401f', measureBg: '#f3dccf' },
  row: { bg: '#fffaf0', checkedBg: '#efe8da', border: '#ddd3bf', selectedBg: '#fffaf0', selectedBorder: '#1d3a2c' },
  rule: 'bar',
  copy: {
    browse: { lead: 'Slow food for', em: 'long evenings.' },
    favorites: { lead: 'Kept for', em: 'later.' },
    login: { lead: 'Recipe', em: 'Discovery' },
  },
};

const candlelight: Look = {
  id: 'candlelight',
  name: 'Candlelight',
  blurb: 'Dark and sleek, glass cards, gold accent',
  swatches: ['#0e1c16', '#eac27c', '#f3ecdf'],
  mode: 'dark',
  nav: 'dock',
  page: '#0e1c16',
  background: {
    backgroundColor: '#0e1c16',
    backgroundImage: [
      'radial-gradient(70% 40% at 80% 0%, rgba(234, 194, 124, 0.2), transparent 70%)',
      'radial-gradient(80% 50% at 0% 30%, rgba(46, 120, 86, 0.32), transparent 70%)',
    ].join(', '),
    backgroundBlendMode: 'normal, normal',
  },
  ink: '#f3ecdf',
  inkSoft: '#b8b2a5',
  primary: '#f3ecdf',
  onPrimary: '#0e1c16',
  accent: '#eac27c',
  onAccent: '#1a140b',
  line: 'rgba(255, 255, 255, 0.09)',
  lineStrong: 'rgba(255, 255, 255, 0.2)',
  field: 'rgba(255, 255, 255, 0.06)',
  paper: '#15261e',
  fonts: { body: sans, display: fraunces, title: fraunces, note: sans },
  hero: { weight: 600, size: { xs: '2.1rem', md: '3rem' }, emColor: '#eac27c', emItalic: false, stack: false, sketch: false },
  section: { family: fraunces, italic: false, weight: 600, size: '1.45rem' },
  panel: {
    bg: 'rgba(255, 255, 255, 0.05)',
    border: 'rgba(255, 255, 255, 0.08)',
    shadow: '0 24px 48px rgba(0, 0, 0, 0.35)',
    radius: '24px',
    blur: true,
  },
  card: {
    surface: 'rgba(255, 255, 255, 0.06)',
    ink: '#f3ecdf',
    inkSoft: '#b8b2a5',
    chipBg: 'rgba(14, 28, 22, 0.55)',
    chipBorder: 'transparent',
    border: 'rgba(255, 255, 255, 0.07)',
    shadow: 'none',
    radius: '22px',
    photoRadius: '0px',
    mat: 0,
    heart: '#eac27c',
    heartBg: 'rgba(0, 0, 0, 0.4)',
    heartBorder: 'transparent',
    overlay: true,
    tagOnPhoto: false,
    numbered: false,
    tilt: false,
    listSurface: 'card',
    metaCaps: false,
  },
  pageTone: { ink: '#f3ecdf', inkSoft: '#b8b2a5', chipBg: 'rgba(255, 255, 255, 0.07)', chipBorder: 'transparent' },
  chip: { radius: '12px', caps: false },
  mark: { timeInk: '#f3ecdf', timeBg: 'rgba(255, 255, 255, 0.1)', measureInk: '#eac27c', measureBg: 'rgba(234, 194, 124, 0.15)' },
  row: {
    bg: 'rgba(255, 255, 255, 0.04)',
    checkedBg: 'rgba(255, 255, 255, 0.08)',
    border: 'rgba(255, 255, 255, 0.08)',
    selectedBg: 'rgba(255, 255, 255, 0.09)',
    selectedBorder: '#eac27c',
  },
  rule: 'none',
  copy: {
    browse: { lead: 'Find something', em: 'worth cooking' },
    favorites: { lead: 'Your', em: 'favorites' },
    login: { lead: 'Recipe', em: 'Discovery' },
  },
};

export const looks: Record<LookId, Look> = { journal, editorial, candlelight };
export const lookOrder: LookId[] = ['journal', 'editorial', 'candlelight'];

export function panelSx(look: Look) {
  return {
    bgcolor: look.panel.bg,
    color: look.ink,
    border: `1px solid ${look.panel.border}`,
    borderRadius: look.panel.radius,
    boxShadow: look.panel.shadow,
    ...(look.panel.blur ? { backdropFilter: 'blur(20px)' } : {}),
  } as const;
}

export function buildTheme(look: Look) {
  return createTheme({
    palette: {
      mode: look.mode,
      primary: { main: look.primary, contrastText: look.onPrimary },
      secondary: { main: look.accent, contrastText: look.onAccent },
      background: { default: look.page, paper: look.paper },
      text: { primary: look.ink, secondary: look.inkSoft },
      divider: look.line,
    },
    shape: { borderRadius: 12 },
    typography: {
      fontFamily: look.fonts.body,
      h1: { fontFamily: look.fonts.display, fontWeight: look.hero.weight, lineHeight: 1.02, letterSpacing: '-0.02em' },
      h2: { fontFamily: look.fonts.title, fontWeight: 600, letterSpacing: '-0.01em' },
      h3: {
        fontFamily: look.section.family,
        fontWeight: look.section.weight,
        fontStyle: look.section.italic ? 'italic' : 'normal',
        fontSize: look.section.size,
        lineHeight: 1.1,
      },
      h4: { fontFamily: look.fonts.title, fontWeight: 600, letterSpacing: '-0.01em' },
      button: { textTransform: 'none', fontWeight: 600, letterSpacing: '0.01em' },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: { ...look.background, backgroundAttachment: 'fixed', color: look.ink, minHeight: '100vh' },
          '::selection': { backgroundColor: look.accent, color: look.onAccent },
        },
      },
      MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
      MuiCard: { styleOverrides: { root: { backgroundImage: 'none' } } },
      MuiMenu: {
        styleOverrides: { paper: { backgroundColor: look.paper, border: `1px solid ${look.line}`, borderRadius: 14 } },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            backgroundColor: look.field,
            color: look.ink,
            '& .MuiOutlinedInput-notchedOutline': { borderColor: look.lineStrong },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: look.ink },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: look.primary },
          },
        },
      },
      MuiInputLabel: { styleOverrides: { root: { color: look.inkSoft } } },
      MuiButton: {
        styleOverrides: {
          root: { borderRadius: 999 },
          contained: { boxShadow: 'none', '&:hover': { boxShadow: 'none' } },
          outlined: { borderColor: look.lineStrong, color: look.ink },
        },
      },
      MuiChip: {
        styleOverrides: {
          outlined: { borderColor: look.lineStrong, color: look.ink, backgroundColor: look.field },
          deleteIcon: { color: look.inkSoft },
        },
      },
      MuiPaginationItem: {
        styleOverrides: {
          root: {
            color: look.ink,
            '&.Mui-selected': {
              backgroundColor: look.primary,
              color: look.onPrimary,
              '&:hover': { backgroundColor: look.primary, opacity: 0.9 },
            },
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: { backgroundColor: look.line },
          bar: { backgroundColor: look.primary },
        },
      },
    },
  });
}

export const theme = buildTheme(journal);
