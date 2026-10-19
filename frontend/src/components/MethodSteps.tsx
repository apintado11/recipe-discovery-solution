import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useRef, useState } from 'react';
import { highlightParts, parseSteps, type HighlightKind } from '../recipe/parseMethod';
import { useLook } from '../LookProvider';
import { panelSx, type Look } from '../theme';

type MethodStepsProps = {
  description: string;
};

function highlightStyle(look: Look, kind: HighlightKind) {
  return kind === 'time'
    ? { color: look.mark.timeInk, backgroundColor: look.mark.timeBg }
    : { color: look.mark.measureInk, backgroundColor: look.mark.measureBg };
}

export function MethodSteps({ description }: MethodStepsProps) {
  const look = useLook();
  const steps = parseSteps(description);
  const [active, setActive] = useState(0);
  const [seenDescription, setSeenDescription] = useState(description);
  const stepRefs = useRef<Array<HTMLButtonElement | null>>([]);

  if (description !== seenDescription) {
    setSeenDescription(description);
    setActive(0);
  }

  const current = Math.min(active, Math.max(steps.length - 1, 0));

  function focusStep(index: number) {
    setActive(index);
    window.requestAnimationFrame(() => {
      stepRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }

  return (
    <Box
      onKeyDown={(event) => {
        if (event.key === 'ArrowRight' && current < steps.length - 1) focusStep(current + 1);
        if (event.key === 'ArrowLeft' && current > 0) focusStep(current - 1);
      }}
      sx={{ ...panelSx(look), p: { xs: 2, md: 2.5 } }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <Box>
          <Typography variant="h3">
            Method
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            {steps.length === 0
              ? 'No method was provided.'
              : `${steps.length} ${steps.length === 1 ? 'step' : 'steps'}. Amounts and times are marked.`}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }} aria-hidden="true">
          <Legend swatch={look.mark.timeBg} ink={look.mark.timeInk} label="Time" />
          <Legend swatch={look.mark.measureBg} ink={look.mark.measureInk} label="Amount" />
        </Box>
      </Box>

      {steps.length > 1 ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
          <Button variant="outlined" disabled={current === 0} onClick={() => focusStep(current - 1)}>
            Previous
          </Button>
          <Typography sx={{ px: 1, fontWeight: 650 }} aria-live="polite">
            Step {current + 1} of {steps.length}
          </Typography>
          <Button variant="contained" disabled={current === steps.length - 1} onClick={() => focusStep(current + 1)}>
            Next
          </Button>
        </Box>
      ) : null}

      <Box sx={{ display: 'grid', gap: 1.5, mt: 2 }}>
        {steps.map((step, index) => {
          const selected = index === current;
          return (
            <Box
              key={`${step.title ?? 'step'}-${index}`}
              component="button"
              type="button"
              ref={(node: HTMLButtonElement | null) => {
                stepRefs.current[index] = node;
              }}
              aria-current={selected ? 'step' : undefined}
              onClick={() => focusStep(index)}
              sx={{
                textAlign: 'left',
                font: 'inherit',
                color: 'inherit',
                cursor: 'pointer',
                borderRadius: look.panel.radius === '4px' ? '4px' : '14px',
                p: 2,
                border: '2px solid',
                borderColor: selected ? look.row.selectedBorder : look.row.border,
                bgcolor: selected ? look.row.selectedBg : look.row.bg,
                boxShadow: selected && look.mode === 'dark' ? '0 12px 28px rgba(0, 0, 0, 0.28)' : 'none',
              }}
            >
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'baseline' }}>
                <Typography
                  component="span"
                  sx={{
                    fontFamily: look.fonts.title,
                    fontWeight: 600,
                    color: look.accent,
                    fontSize: '1.15rem',
                  }}
                >
                  {index + 1}
                </Typography>
                {step.title ? (
                  <Typography component="span" variant="h4" sx={{ fontSize: '1.15rem' }}>
                    {step.title}
                  </Typography>
                ) : null}
              </Box>
              {step.body ? (
                <Typography sx={{ mt: step.title ? 1 : 0.5, whiteSpace: 'pre-line', lineHeight: 1.65, fontSize: selected ? '1.05rem' : '1rem' }}>
                  <HighlightedText text={step.body} />
                </Typography>
              ) : null}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

export function HighlightedText({ text }: { text: string }) {
  const look = useLook();
  const parts = highlightParts(text);
  return (
    <>
      {parts.map((part, index) =>
        part.kind ? (
          <Box
            key={`${part.kind}-${index}`}
            component="mark"
            sx={{
              fontWeight: 700,
              px: 0.5,
              borderRadius: 0.75,
              ...highlightStyle(look, part.kind),
            }}
          >
            {part.text}
          </Box>
        ) : (
          <span key={`text-${index}`}>{part.text}</span>
        ),
      )}
    </>
  );
}

function Legend({ swatch, ink, label }: { swatch: string; ink: string; label: string }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
      <Box sx={{ width: 14, height: 14, borderRadius: 0.5, bgcolor: swatch, border: `1px solid ${ink}` }} />
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
    </Box>
  );
}
