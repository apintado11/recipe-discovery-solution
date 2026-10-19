import AddIcon from '@mui/icons-material/Add';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RemoveIcon from '@mui/icons-material/Remove';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import { useState, type ReactNode } from 'react';
import { useLook } from '../LookProvider';
import { panelSx, type Look } from '../theme';
import type { FoodGroup, Nutrition, NutritionFacts } from '../types';

const COLORS = {
  protein: '#e07a5f',
  carbs: '#e9b949',
  fat: '#4fb3a0',
  fiber: '#8d7bd6',
  sugar: '#d97aa6',
  sodium: '#6f9fd8',
  good: '#3fae6f',
  warn: '#e8913a',
};

const GRADE_COLORS: Record<string, string> = { A: '#3fae6f', B: '#8cc152', C: '#e9b949', D: '#ef8a4c', E: '#d9534f' };

const GROUPS: Record<FoodGroup, { label: string; color: string }> = {
  PROTEIN: { label: 'Protein', color: '#e07a5f' },
  DAIRY: { label: 'Dairy', color: '#f0d39a' },
  GRAINS: { label: 'Grains', color: '#d4a056' },
  VEGETABLES: { label: 'Vegetables', color: '#6fbf73' },
  FRUIT: { label: 'Fruit', color: '#e88aa7' },
  LEGUMES: { label: 'Legumes', color: '#a98b62' },
  FATS_AND_OILS: { label: 'Fats & oils', color: '#4fb3a0' },
  SWEETS: { label: 'Sweets', color: '#c792ea' },
  SEASONING: { label: 'Seasonings & sauces', color: '#9aa77a' },
  OTHER: { label: 'Stock & other', color: '#8f9aa3' },
};

const MIN_SERVINGS = 1;
const MAX_SERVINGS = 12;

type NutrientKey = keyof NutritionFacts;

const NUTRIENTS: { key: NutrientKey; label: string; unit: 'g' | 'mg'; color: string }[] = [
  { key: 'protein', label: 'Protein', unit: 'g', color: COLORS.protein },
  { key: 'carbs', label: 'Carbs', unit: 'g', color: COLORS.carbs },
  { key: 'fat', label: 'Fat', unit: 'g', color: COLORS.fat },
  { key: 'fiber', label: 'Fiber', unit: 'g', color: COLORS.fiber },
  { key: 'sugar', label: 'Sugar', unit: 'g', color: COLORS.sugar },
  { key: 'sodium', label: 'Sodium', unit: 'mg', color: COLORS.sodium },
];

function amount(value: number, unit: string) {
  const rounded = value >= 10 || unit === 'mg' ? Math.round(value) : Math.round(value * 10) / 10;
  return `${rounded.toLocaleString()} ${unit}`;
}

type Segment = { value: number; color: string };

/** A donut. Segment values are percentages of the full circle. */
function Ring({ size, stroke, segments, track, label, children }: {
  size: number;
  stroke: number;
  segments: Segment[];
  track: string;
  label: string;
  children: ReactNode;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const gap = segments.filter((segment) => segment.value > 0).length > 1 ? 3 : 0;
  let offset = 0;

  return (
    <Box sx={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={label}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={track} strokeWidth={stroke} />
        {segments.map((segment, index) => {
          const length = (circumference * Math.max(0, Math.min(segment.value, 100))) / 100;
          const dash = Math.max(length - gap, 0);
          const circle = (
            <circle
              key={index}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={segment.color}
              strokeWidth={stroke}
              strokeDasharray={`${dash} ${circumference}`}
              strokeDashoffset={-offset}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
              style={{ transition: 'stroke-dasharray 600ms ease, stroke-dashoffset 600ms ease' }}
            />
          );
          offset += length;
          return circle;
        })}
      </svg>
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

function Dot({ color }: { color: string }) {
  return <Box component="span" aria-hidden sx={{ width: 10, height: 10, borderRadius: 99, bgcolor: color, flexShrink: 0 }} />;
}

function SectionLabel({ look, children }: { look: Look; children: ReactNode }) {
  return (
    <Typography
      component="h4"
      sx={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: look.inkSoft, mb: 1.25 }}
    >
      {children}
    </Typography>
  );
}

function Bar({ value, color, look, label }: { value: number; color: string; look: Look; label: string }) {
  return (
    <LinearProgress
      variant="determinate"
      value={Math.max(0, Math.min(value, 100))}
      aria-label={label}
      sx={{
        height: 8,
        borderRadius: 99,
        bgcolor: look.line,
        '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 99, transition: 'transform 600ms ease' },
      }}
    />
  );
}

export function NutritionPanel({ nutrition }: { nutrition: Nutrition }) {
  const look = useLook();
  const [servings, setServings] = useState(nutrition.servings);

  const perServing = (key: NutrientKey) => nutrition[key] / servings;
  const dailyValue = (key: NutrientKey) => (nutrition.dailyValues[key] * nutrition.servings) / servings;

  const calories = Math.round(perServing('calories'));
  const { proteinPercent, carbsPercent, fatPercent } = nutrition.macros;
  const gradeColor = GRADE_COLORS[nutrition.grade] ?? COLORS.carbs;
  const topSources = [...nutrition.ingredients].sort((a, b) => b.calories - a.calories).slice(0, 5);
  const topCalories = Math.max(topSources[0]?.calories ?? 0, 1);

  const macros = [
    { label: 'Protein', percent: proteinPercent, grams: perServing('protein'), color: COLORS.protein },
    { label: 'Carbs', percent: carbsPercent, grams: perServing('carbs'), color: COLORS.carbs },
    { label: 'Fat', percent: fatPercent, grams: perServing('fat'), color: COLORS.fat },
  ];

  return (
    <Box component="section" aria-labelledby="nutrition-heading" sx={{ ...panelSx(look), p: { xs: 2, md: 3 } }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, mb: 2.5 }}>
        <Box>
          <Typography id="nutrition-heading" variant="h3">
            Nutrition
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5, fontSize: '0.92rem' }}>
            Estimated per serving · {nutrition.matchedIngredients} of {nutrition.totalIngredients} ingredients matched
          </Typography>
        </Box>
        <Box
          sx={{ display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: look.field, border: `1px solid ${look.line}`, borderRadius: 99, px: 0.5, py: 0.25 }}
        >
          <IconButton
            size="small"
            aria-label="Fewer servings"
            disabled={servings <= MIN_SERVINGS}
            onClick={() => setServings((count) => Math.max(MIN_SERVINGS, count - 1))}
            sx={{ color: look.ink }}
          >
            <RemoveIcon fontSize="small" />
          </IconButton>
          <Typography aria-live="polite" sx={{ minWidth: 76, textAlign: 'center', fontWeight: 600, fontSize: '0.9rem' }}>
            Serves {servings}
          </Typography>
          <IconButton
            size="small"
            aria-label="More servings"
            disabled={servings >= MAX_SERVINGS}
            onClick={() => setServings((count) => Math.min(MAX_SERVINGS, count + 1))}
            sx={{ color: look.ink }}
          >
            <AddIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gap: { xs: 3, md: 4 },
          alignItems: 'center',
          gridTemplateColumns: { xs: '1fr', md: 'auto minmax(0, 1fr) auto' },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, justifyContent: { xs: 'center', md: 'flex-start' } }}>
          <Ring
            size={164}
            stroke={14}
            track={look.line}
            segments={macros.map((macro) => ({ value: macro.percent, color: macro.color }))}
            label={`${calories} calories per serving. ${proteinPercent}% from protein, ${carbsPercent}% from carbs, ${fatPercent}% from fat.`}
          >
            <Typography sx={{ fontFamily: look.fonts.title, fontWeight: 600, fontSize: '2.3rem', lineHeight: 1 }}>
              {calories.toLocaleString()}
            </Typography>
            <Typography sx={{ fontSize: '0.78rem', color: look.inkSoft, mt: 0.25 }}>kcal / serving</Typography>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: look.accent, mt: 0.5 }}>
              {Math.round(dailyValue('calories'))}% of 2,000
            </Typography>
          </Ring>
          <Box component="ul" aria-label="Calories by macro" sx={{ listStyle: 'none', m: 0, p: 0, display: 'grid', gap: 1.25 }}>
            {macros.map((macro) => (
              <Box component="li" key={macro.label} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Dot color={macro.color} />
                <Box>
                  <Typography sx={{ fontWeight: 700, lineHeight: 1.1 }}>{macro.percent}%</Typography>
                  <Typography sx={{ fontSize: '0.78rem', color: look.inkSoft }}>
                    {macro.label} · {amount(macro.grams, 'g')}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        <Box>
          <SectionLabel look={look}>Daily value per serving</SectionLabel>
          <Box component="ul" aria-label="Nutrients per serving" sx={{ listStyle: 'none', m: 0, p: 0, display: 'grid', gap: 1.25 }}>
            {NUTRIENTS.map((nutrient) => {
              const value = perServing(nutrient.key);
              const percent = Math.round(dailyValue(nutrient.key));
              return (
                <Box
                  component="li"
                  key={nutrient.key}
                  sx={{ display: 'grid', gridTemplateColumns: '64px minmax(0, 1fr) 92px', alignItems: 'center', gap: 1.5 }}
                >
                  <Typography sx={{ fontSize: '0.88rem', fontWeight: 600 }}>{nutrient.label}</Typography>
                  <Bar
                    look={look}
                    value={percent}
                    color={nutrient.color}
                    label={`${nutrient.label}: ${amount(value, nutrient.unit)}, ${percent}% of daily value`}
                  />
                  <Typography sx={{ fontSize: '0.85rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <Box component="span" sx={{ fontWeight: 700 }}>
                      {amount(value, nutrient.unit)}
                    </Box>{' '}
                    <Box component="span" sx={{ color: look.inkSoft }}>
                      {percent}%
                    </Box>
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: { xs: 'row', md: 'column' }, alignItems: 'center', gap: 2, maxWidth: { md: 200 } }}>
          <Ring
            size={112}
            stroke={10}
            track={look.line}
            segments={[{ value: nutrition.healthScore, color: gradeColor }]}
            label={`Health score ${nutrition.healthScore} out of 100, grade ${nutrition.grade}`}
          >
            <Typography sx={{ fontFamily: look.fonts.title, fontWeight: 700, fontSize: '2.1rem', lineHeight: 1, color: gradeColor }}>
              {nutrition.grade}
            </Typography>
            <Typography sx={{ fontSize: '0.72rem', color: look.inkSoft }}>{nutrition.healthScore} / 100</Typography>
          </Ring>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, justifyContent: { md: 'center' } }}>
            <Typography sx={{ width: '100%', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: look.inkSoft, textAlign: { md: 'center' } }}>
              Health score
            </Typography>
            {nutrition.highlights.map((highlight) => {
              const color = highlight.positive ? COLORS.good : COLORS.warn;
              return (
                <Chip
                  key={highlight.label}
                  size="small"
                  label={highlight.label}
                  icon={highlight.positive ? <CheckCircleOutlineIcon /> : <ErrorOutlineIcon />}
                  sx={{
                    bgcolor: `${color}26`,
                    color: look.ink,
                    border: `1px solid ${color}66`,
                    fontWeight: 600,
                    '& .MuiChip-icon': { color },
                  }}
                />
              );
            })}
          </Box>
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gap: { xs: 3, md: 4 }, mt: { xs: 3, md: 4 }, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
        <Box>
          <SectionLabel look={look}>Plate by weight</SectionLabel>
          <Box
            role="img"
            aria-label={nutrition.foodGroups.map((share) => `${GROUPS[share.group].label} ${share.percent}%`).join(', ')}
            sx={{ display: 'flex', height: 14, borderRadius: 99, overflow: 'hidden', bgcolor: look.line, gap: '2px' }}
          >
            {nutrition.foodGroups.map((share) => (
              <Box
                key={share.group}
                title={`${GROUPS[share.group].label} ${share.percent}%`}
                sx={{ width: `${share.percent}%`, minWidth: share.percent > 0 ? 4 : 0, bgcolor: GROUPS[share.group].color, transition: 'width 600ms ease' }}
              />
            ))}
          </Box>
          <Box component="ul" sx={{ listStyle: 'none', m: 0, mt: 1.5, p: 0, display: 'flex', flexWrap: 'wrap', columnGap: 2, rowGap: 0.75 }}>
            {nutrition.foodGroups.map((share) => (
              <Box component="li" key={share.group} sx={{ display: 'flex', alignItems: 'center', gap: 0.75, fontSize: '0.82rem' }}>
                <Dot color={GROUPS[share.group].color} />
                {GROUPS[share.group].label}
                <Box component="span" sx={{ color: look.inkSoft }}>
                  {share.percent}%
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        <Box>
          <SectionLabel look={look}>Biggest calorie sources</SectionLabel>
          <Box component="ol" aria-label="Biggest calorie sources" sx={{ listStyle: 'none', m: 0, p: 0, display: 'grid', gap: 1.25 }}>
            {topSources.map((source) => (
              <Box component="li" key={`${source.name}-${source.measure}`}>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 0.5 }}>
                  <Typography sx={{ fontSize: '0.88rem', fontWeight: 600, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {source.name}
                  </Typography>
                  <Typography sx={{ fontSize: '0.76rem', color: look.inkSoft, whiteSpace: 'nowrap' }}>
                    {source.grams.toLocaleString()} g{source.matched ? '' : ' · estimated'}
                  </Typography>
                  <Typography sx={{ ml: 'auto', fontSize: '0.85rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
                    {Math.round(source.calories / servings).toLocaleString()} kcal
                  </Typography>
                </Box>
                <Bar
                  look={look}
                  value={(source.calories / topCalories) * 100}
                  color={GROUPS[source.group].color}
                  label={`${source.name}: ${Math.round(source.calories / servings)} kcal per serving`}
                />
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      <Typography sx={{ mt: 3, fontSize: '0.76rem', color: look.inkSoft }}>
        Estimates from a built-in food table, priced from each ingredient's measure. Daily values use a 2,000 kcal reference diet.
      </Typography>
    </Box>
  );
}
