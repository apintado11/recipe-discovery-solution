import Chip from '@mui/material/Chip';
import type { ChipProps } from '@mui/material/Chip';
import { useLook } from '../LookProvider';
import { flagForCuisine } from '../recipe/flags';
import { MiniFlag } from './MiniFlag';

type CuisineChipProps = {
  cuisine: string;
  onDelete?: ChipProps['onDelete'];
  flagHeight?: number;
  tone?: 'page' | 'card';
};

export function CuisineChip({ cuisine, onDelete, flagHeight = 14, tone = 'page' }: CuisineChipProps) {
  const look = useLook();
  const colors = tone === 'card' ? look.card : look.pageTone;
  const accent = flagForCuisine(cuisine)?.color ?? look.accent;
  const flagWidth = Math.round(flagHeight * 1.5);

  return (
    <Chip
      size="small"
      variant="outlined"
      label={cuisine}
      onDelete={onDelete}
      icon={<MiniFlag cuisine={cuisine} height={flagHeight} />}
      sx={{
        maxWidth: '100%',
        height: 26,
        borderRadius: look.chip.radius,
        borderColor: colors.chipBorder,
        bgcolor: colors.chipBg,
        color: colors.ink,
        fontWeight: 600,
        ...(look.chip.caps
          ? { fontSize: '0.68rem', letterSpacing: '0.12em', textTransform: 'uppercase' }
          : { fontSize: '0.8rem' }),
        boxShadow: look.chip.caps ? 'none' : `inset 3px 0 0 ${accent}`,
        '& .MuiChip-icon': {
          width: flagWidth,
          height: flagHeight,
          minWidth: flagWidth,
          ml: look.chip.caps ? '8px' : '10px',
          mr: '2px',
          borderRadius: '2px',
          color: 'inherit',
        },
        '& .MuiChip-label': { px: 1, overflow: 'hidden', textOverflow: 'ellipsis' },
        '& .MuiChip-deleteIcon': { color: colors.inkSoft },
      }}
    />
  );
}
