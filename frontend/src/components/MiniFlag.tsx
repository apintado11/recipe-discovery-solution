import Box from '@mui/material/Box';
import { flagForCuisine } from '../recipe/flags';

type MiniFlagProps = {
  cuisine: string;
  className?: string;
  height?: number;
};

export function MiniFlag({ cuisine, className, height = 14 }: MiniFlagProps) {
  const flag = flagForCuisine(cuisine);
  const width = Math.round(height * 1.5);

  if (!flag) {
    const letter = cuisine.trim().charAt(0).toUpperCase() || '?';
    return (
      <Box
        className={className}
        aria-hidden
        sx={{
          width,
          height,
          borderRadius: '3px',
          bgcolor: '#1d3a2c',
          color: '#f5efe2',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          fontFamily: '"Fraunces", Georgia, serif',
          fontSize: Math.max(8, height - 4),
          lineHeight: 1,
          boxShadow: 'inset 0 0 0 1px rgba(31, 26, 23, 0.18)',
        }}
      >
        {letter}
      </Box>
    );
  }

  return (
    <Box
      className={className}
      aria-hidden
      sx={{
        width,
        height,
        borderRadius: '2px',
        display: 'inline-block',
        flexShrink: 0,
        backgroundColor: flag.color,
        backgroundImage: `url("https://flagcdn.com/w40/${flag.code}.png")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        boxShadow: 'inset 0 0 0 1px rgba(31, 26, 23, 0.22), 0 1px 1px rgba(31, 26, 23, 0.12)',
      }}
    />
  );
}
