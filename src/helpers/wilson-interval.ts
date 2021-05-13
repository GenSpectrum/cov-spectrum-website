// calculateWilsonInterval calculates the Wilson score interval for 95% confidence.
//
// This function is based on https://github.com/erikfox/wilson-interval, but without
// high precision math.
//
// observed - number of observed positive outcomes
// sample - size of sample
export function calculateWilsonInterval(observed: number, sample: number): [number, number] {
  const p = observed / sample;
  const n = sample;
  const z = 1.9599639715843482; // pnormaldist(math.eval('1 - (1 - confidence) / 2', { confidence }))

  return [
    (p + (z * z) / (2 * n) - z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * (n * n)))) / (1 + (z * z) / n),
    (p + (z * z) / (2 * n) + z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * (n * n)))) / (1 + (z * z) / n),
  ];
}
