import Box from '@mui/material/Box';
import { useLook } from '../LookProvider';

export function MenuRule() {
  const look = useLook();

  if (look.rule === 'none') {
    return <Box aria-hidden sx={{ height: 10 }} />;
  }

  if (look.rule === 'bar') {
    return <Box aria-hidden sx={{ width: 44, height: 3, bgcolor: look.accent, my: 1.5 }} />;
  }

  return (
    <Box aria-hidden component="svg" viewBox="0 0 88 12" sx={{ width: 88, height: 12, display: 'block', my: 0.75, overflow: 'visible' }}>
      <path
        d="M1 7 C 16 3.2, 24 10, 40 6.2 S 66 9.5, 87 4.2"
        fill="none"
        stroke={look.accent}
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </Box>
  );
}
