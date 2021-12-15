import { althaus2021GrowthMath, MathVariables } from '../althaus2021Growth-math';

function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function ρ({ τ, κ, ε, S, R, D }: Omit<MathVariables, 'ρ'>) {
  const β = R / (S * D);
  // This formula is directly taken from the manuscript.
  return (1 + τ) * β * (S + ε * (1 - S)) - 1 / ((1 + κ) * D) - β * S + 1 / D;
}

const generateCorrectData = (n: number): MathVariables[] => {
  const data = [];
  for (let i = 0; i < n; i++) {
    const params = {
      τ: randomBetween(-5, 5),
      κ: randomBetween(0, 1),
      ε: randomBetween(0, 1),
      S: randomBetween(0.001, 1),
      R: randomBetween(0, 10),
      D: randomBetween(4, 10),
    };
    data.push({
      ...params,
      ρ: ρ(params),
    });
  }
  return data;
};

const correctData = generateCorrectData(1000);

test('τ', () => {
  for (let correct of correctData) {
    const { τ: _, ...input } = correct;
    expect(althaus2021GrowthMath.τ(input)).toBeCloseTo(correct.τ, 5);
  }
});

test('κ', () => {
  for (let correct of correctData) {
    const { κ: _, ...input } = correct;
    expect(althaus2021GrowthMath.κ(input)).toBeCloseTo(correct.κ, 5);
  }
});

test('ε', () => {
  for (let correct of correctData) {
    const { ε: _, ...input } = correct;
    expect(althaus2021GrowthMath.ε(input)).toBeCloseTo(correct.ε, 5);
  }
});

test('S', () => {
  for (let correct of correctData) {
    const { S: _, ...input } = correct;
    expect(althaus2021GrowthMath.S(input)).toBeCloseTo(correct.S, 5);
  }
});

test('R', () => {
  for (let correct of correctData) {
    const { R: _, ...input } = correct;
    expect(althaus2021GrowthMath.R(input)).toBeCloseTo(correct.R, 5);
  }
});

test('D', () => {
  for (let correct of correctData) {
    const { D: _, ...input } = correct;
    expect(althaus2021GrowthMath.D(input)).toBeCloseTo(correct.D, 5);
  }
});
