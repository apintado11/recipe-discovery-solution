import GridViewIcon from '@mui/icons-material/GridView';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import Box from '@mui/material/Box';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useLook } from '../LookProvider';
import type { RecipeLayout } from '../recipe/layoutPreference';

const OPTIONS: { value: RecipeLayout; label: string; icon: typeof ViewListIcon }[] = [
  { value: 'list', label: 'List layout', icon: ViewListIcon },
  { value: 'card', label: 'Card layout', icon: ViewModuleIcon },
  { value: 'compact', label: 'Compact layout', icon: GridViewIcon },
];

type ViewSwitcherProps = {
  value: RecipeLayout;
  onChange: (layout: RecipeLayout) => void;
};

export function ViewSwitcher({ value, onChange }: ViewSwitcherProps) {
  const look = useLook();
  return (
    <ToggleButtonGroup
      exclusive
      size="small"
      value={value}
      aria-label="Recipe layout"
      onChange={(_event, next: RecipeLayout | null) => {
        if (next) {
          onChange(next);
        }
      }}
      sx={{
        flexShrink: 0,
        gap: 0.25,
        p: 0.375,
        bgcolor: look.field,
        border: `1px solid ${look.line}`,
        borderRadius: look.chip.caps ? '4px' : '12px',
        '& .MuiToggleButtonGroup-grouped': {
          border: 0,
          borderRadius: look.chip.caps ? '2px' : '9px !important',
          margin: 0,
          px: 1,
          py: 0.5,
          color: look.inkSoft,
        },
        '& .MuiToggleButton-root.Mui-selected': {
          bgcolor: look.primary,
          color: look.onPrimary,
          '&:hover': { bgcolor: look.primary },
        },
      }}
    >
      {OPTIONS.map((option) => {
        const Icon = option.icon;
        return (
          <Tooltip key={option.value} title={option.label} disableTouchListener>
            <ToggleButton value={option.value} aria-label={option.label}>
              <Icon sx={{ fontSize: 18 }} />
            </ToggleButton>
          </Tooltip>
        );
      })}
    </ToggleButtonGroup>
  );
}

type ResultsBarProps = {
  countLabel: string;
  layout: RecipeLayout;
  onLayout: (layout: RecipeLayout) => void;
};

export function ResultsBar({ countLabel, layout, onLayout }: ResultsBarProps) {
  const look = useLook();
  const label =
    look.fonts.note !== look.fonts.body
      ? { fontFamily: look.fonts.note, fontSize: '1.4rem', fontWeight: 700, lineHeight: 1 }
      : look.chip.caps
        ? { fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase' as const }
        : { fontSize: '1.05rem', fontWeight: 600 };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.75 }}>
      <Typography sx={{ flexGrow: 1, minWidth: 0, color: 'text.secondary', ...label }}>{countLabel}</Typography>
      <ViewSwitcher value={layout} onChange={onLayout} />
    </Box>
  );
}
