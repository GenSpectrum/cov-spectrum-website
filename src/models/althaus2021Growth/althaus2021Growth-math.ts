export type MathVariables = {
  ρ: number;
  τ: number;
  κ: number;
  ε: number;
  S: number;
  R: number;
  D: number;
};

function τ({ ρ, κ, ε, S, R, D }: Omit<MathVariables, 'τ'>): number {
  const β = R / (S * D);
  return (ρ + 1 / ((1 + κ) * D) + β * S - 1 / D) / (β * (S + ε * (1 - S))) - 1;
}

function κ({ ρ, τ, ε, S, R, D }: Omit<MathVariables, 'κ'>): number {
  const β = R / (S * D);
  return 1 / (((1 + τ) * β * (S + ε * (1 - S)) - β * S + 1 / D - ρ) * D) - 1;
}

function ε({ ρ, τ, κ, S, R, D }: Omit<MathVariables, 'ε'>): number {
  const β = R / (S * D);
  return ((ρ + 1 / ((1 + κ) * D) + β * S - 1 / D) / ((1 + τ) * β) - S) / (1 - S);
}

function S({ ρ, τ, κ, ε, R, D }: Omit<MathVariables, 'S'>): number {
  return ε / (((ρ + 1 / ((1 + κ) * D) + R / D - 1 / D) * D) / ((1 + τ) * R) - 1 + ε);
}

function R({ ρ, τ, κ, ε, S, D }: Omit<MathVariables, 'R'>): number {
  return (ρ + 1 / ((1 + κ) * D) - 1 / D) / (((1 + τ) * (S + ε * (1 - S))) / (S * D) - 1 / D);
}

function D({ ρ, τ, κ, ε, S, R }: Omit<MathVariables, 'D'>): number {
  return (1 / ρ) * (((1 + τ) * R * (S + ε * (1 - S))) / S - 1 / (1 + κ) - R + 1);
}

export const althaus2021GrowthMath = { τ, κ, ε, S, R, D };
