import { approximateBinomialRatioConfidence } from '../binomial-ratio-confidence';

test('approximateBinomialRatioConfidence', () => {
  interface Case {
    x: number;
    m: number;
    y: number;
    n: number;
    low: number;
    high: number;
  }
  const cases: Case[] = [
    { x: 21, m: 91, y: 114, n: 1158, low: 1.55004024, high: 3.54503271 },
    { x: 0, m: 91, y: 0, n: 1158, low: 0, high: Infinity },
    { x: 0, m: 0, y: 0, n: 0, low: 0, high: Infinity },
    { x: 0, m: 91, y: 114, n: 1158, low: 0, high: 0.89040097 },
    { x: 21, m: 91, y: 0, n: 1158, low: 32.61516936, high: Infinity },
    { x: 91, m: 91, y: 1158, n: 1158, low: 0.97981025, high: 1.0102934 },
  ];

  for (const c of cases) {
    const [low, high] = approximateBinomialRatioConfidence(c.x, c.m, c.y, c.n);
    expect(low).toBeCloseTo(c.low, 5);
    expect(high).toBeCloseTo(c.high, 5);
  }
});
