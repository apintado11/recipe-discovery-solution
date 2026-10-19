export type RecipeStep = {
  title: string | null;
  body: string;
};

export type HighlightKind = 'time' | 'measure';

export type TextPart = {
  text: string;
  kind: HighlightKind | null;
};

const QUANTITY =
  String.raw`(?:\d+\s+\d+\/\d+|\d+\/\d+|\d+(?:\.\d+)?|[½¼¾⅓⅔⅛⅜⅝⅞]|one|two|three|four|five|six|seven|eight|nine|ten|an|a)`;
const TIME_UNIT = String.raw`(?:minutes?|mins?|hours?|hrs?|seconds?|secs?)`;
const MEASURE_UNIT =
  String.raw`(?:tablespoons?|teaspoons?|tbsp|tsp|tbs|cups?|ounces?|oz|pounds?|lbs?|lb|grams?|kilograms?|kg|milliliters?|millilitres?|ml|liters?|litres?|cloves?|pinches?|pinch|bags?|cans?|slices?|pieces?|handfuls?|sticks?|cm|mm|inches?)`;

const HIGHLIGHT = new RegExp(
  [
    String.raw`(?<![\w])overnight\b`,
    String.raw`(?<![\w])${QUANTITY}\s*(?:[-–]|to)\s*${QUANTITY}\s*${TIME_UNIT}\b`,
    String.raw`(?<![\w])${QUANTITY}\s*${TIME_UNIT}\b`,
    String.raw`(?<![\w])${QUANTITY}\s*°\s*[fc]\b`,
    String.raw`(?<![\w])${QUANTITY}\s*degrees?(?:\s+(?:[fc]|fahrenheit|celsius))?\b`,
    String.raw`(?<![\w])${QUANTITY}\s*[fc]\b`,
    String.raw`(?<![\w])${QUANTITY}\s*${MEASURE_UNIT}\b`,
  ].join('|'),
  'gi',
);

const TIME_KIND = /overnight|minutes?|mins?|hours?|hrs?|seconds?|secs?/i;

export function parseSteps(description: string): RecipeStep[] {
  const text = description.replace(/\r\n/g, '\n').trim();
  if (!text) return [];

  if (/(?:^|\n)\s*step\s*\d+\b/i.test(text)) {
    return text
      .split(/\n(?=\s*step\s*\d+\b)/i)
      .map((chunk) => parseLabeledStep(chunk.trim()))
      .filter((step) => step.body.length > 0 || step.title);
  }

  const lines = text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const numbered = parseNumberedLines(lines);
  if (numbered) return numbered;

  if (lines.length >= 2) {
    return lines.map((line) => ({ title: null, body: line }));
  }

  const sentences = text
    .split(/(?<=[.!])\s+(?=[A-Z])/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 0);

  if (sentences.length >= 2) {
    return sentences.map((body) => ({ title: null, body }));
  }

  return [{ title: null, body: text }];
}

export function highlightParts(text: string): TextPart[] {
  const parts: TextPart[] = [];
  const pattern = new RegExp(HIGHLIGHT.source, 'gi');
  let last = 0;

  for (const match of text.matchAll(pattern)) {
    const start = match.index ?? 0;
    const raw = match[0];
    if (raw.length === 0 || start < last) continue;
    if (start > last) parts.push({ text: text.slice(last, start), kind: null });
    parts.push({ text: raw, kind: TIME_KIND.test(raw) ? 'time' : 'measure' });
    last = start + raw.length;
  }

  if (last < text.length) parts.push({ text: text.slice(last), kind: null });
  if (parts.length === 0) parts.push({ text, kind: null });
  return parts;
}

function parseLabeledStep(chunk: string): RecipeStep {
  const lines = chunk
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  const first = lines[0] ?? '';
  const heading = first.match(/^step\s*\d+\s*[-–—:.]?\s*(.*)$/i);
  if (!heading) return { title: null, body: lines.join('\n') };

  const label = heading[1].trim();
  const rest = lines.slice(1).join('\n').trim();
  if (label.length > 0 && isHeading(label)) {
    return { title: titleCase(label), body: rest };
  }

  const body = [label, rest].filter((part) => part.length > 0).join('\n');
  return { title: null, body };
}

function parseNumberedLines(lines: string[]): RecipeStep[] | null {
  const numberedCount = lines.filter((line) => /^\d+[.)]\s+\S/.test(line)).length;
  if (numberedCount < 2) return null;

  const steps: RecipeStep[] = [];
  for (const line of lines) {
    const match = line.match(/^\d+[.)]\s+(.*)$/);
    if (match) {
      steps.push({ title: null, body: match[1] });
    } else if (steps.length > 0) {
      steps[steps.length - 1].body = `${steps[steps.length - 1].body}\n${line}`;
    } else {
      steps.push({ title: null, body: line });
    }
  }

  return steps.filter((step) => step.body.length > 0);
}

function isHeading(value: string): boolean {
  const letters = value.replace(/[^A-Za-z]/g, '');
  if (letters.length < 3 || value.length > 60) return false;
  const capitals = value.replace(/[^A-Z]/g, '').length;
  return capitals / letters.length >= 0.8;
}

function titleCase(value: string): string {
  const small = new Set(['a', 'an', 'the', 'of', 'and', 'or', 'to', 'in', 'on', 'for', 'with']);
  return value
    .toLowerCase()
    .split(/\s+/)
    .map((word, index) => {
      if (index > 0 && small.has(word)) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}
