import { describe, expect, it } from 'vitest';
import { highlightParts, parseSteps } from './parseMethod';

const shrimp = `STEP 1 - SOAK THE RICE NOODLES
Soak the rice noodles overnight untill they are soft
STEP 2 - BOIL THE RICE NOODLES
Boil the noodles for 10-15 minutes and then rinse with cold water to stop the cooking process of the noodles.
STEP 3 -MARINATING THE SHRIMP
In a bowl add the shrimp, egg, 1 pinch of white pepper, 1 Teaspoon of sesame seed oil, 1 Tablespoon corn starch and 1 tablespoon of oil
Mix together well
STEP 4 - STIR FRY
In a wok add 2 Tablespoons of oil, shrimp and stir fry them until it is golden brown
Set the shrimp aside
Add 1 Tablespoon of oil to the work and then add minced garlic, ginger and all of the vegetables.`;

describe('parseSteps', () => {
  it('splits labeled steps and keeps a short heading', () => {
    const steps = parseSteps(shrimp);

    expect(steps.map((step) => step.title)).toEqual([
      'Soak the Rice Noodles',
      'Boil the Rice Noodles',
      'Marinating the Shrimp',
      'Stir Fry',
    ]);
    expect(steps[2].body).toContain('Mix together well');
    expect(steps[0].body).not.toMatch(/STEP/i);
  });

  it('splits a lowercase step label onto the following lines', () => {
    const steps = parseSteps('step 1\nFry for 5 mins.\n\nstep 2\nHeat the oven to 190C.');

    expect(steps).toEqual([
      { title: null, body: 'Fry for 5 mins.' },
      { title: null, body: 'Heat the oven to 190C.' },
    ]);
  });

  it('keeps each paragraph as a step', () => {
    const steps = parseSteps('Mix the sauce.\nAdd the noodles.\nServe immediately!');

    expect(steps.map((step) => step.body)).toEqual(['Mix the sauce.', 'Add the noodles.', 'Serve immediately!']);
  });

  it('splits a single paragraph into sentences', () => {
    const steps = parseSteps('Boil the pasta for 10 minutes. Drain it. Toss with oil.');

    expect(steps).toHaveLength(3);
    expect(steps[0].body).toBe('Boil the pasta for 10 minutes.');
  });

  it('groups extra lines under a numbered step', () => {
    const steps = parseSteps('1. Heat the pan.\nUntil the oil shimmers.\n2. Add the garlic.');

    expect(steps).toEqual([
      { title: null, body: 'Heat the pan.\nUntil the oil shimmers.' },
      { title: null, body: 'Add the garlic.' },
    ]);
  });

  it('leaves a one-line method as a single step', () => {
    expect(parseSteps('Make and enjoy')).toEqual([{ title: null, body: 'Make and enjoy' }]);
  });
});

describe('highlightParts', () => {
  it('marks times and amounts without marking the step number', () => {
    const parts = highlightParts(
      'Soak overnight, then boil for 10-15 minutes with 1 pinch of pepper, ½ cup stock, and 2 Tablespoons of oil at 350° F.',
    );
    const marked = parts.filter((part) => part.kind).map((part) => `${part.kind}:${part.text}`);

    expect(marked).toEqual([
      'time:overnight',
      'time:10-15 minutes',
      'measure:1 pinch',
      'measure:½ cup',
      'measure:2 Tablespoons',
      'measure:350° F',
    ]);
  });

  it('marks word quantities, compact units, and a temperature range', () => {
    const marked = highlightParts('Rest one minute, then add 1/2 bag, 8 oz, and 2 tsp. Heat to 190C/170C for 4-5 mins.')
      .filter((part) => part.kind)
      .map((part) => part.text);

    expect(marked).toEqual(['one minute', '1/2 bag', '8 oz', '2 tsp', '190C', '170C', '4-5 mins']);
  });
});
