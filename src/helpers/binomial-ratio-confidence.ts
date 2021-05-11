import assert from 'assert';

// approximateBinomialRatioConfidence calculates the 95% confidence interval of
// the ratio of two measured proportions, where each proportion is calculated
// from a measured binomially distributed random variable.
//
// Original paper:
// "Obtaining Confidence Intervals for the Risk Ratio in Cohort Studies" (Katz et al., 1978, Biometrics 34, 469-474)
//
// Shorter description:
// "Confidence Intervals for the Ratio of Two Binomial Proportions" (Koopman 1984, Biometrics 40, 513-517)
//
// R implementation:
// https://github.com/cran/DescTools/blob/62a71ebdfc239988ad02d5c2feed2b9d2645b97d/R/StatsAndCIs.r#L3164
//
// x - number of successes for the ratio numerator
// m - number of trials for the ratio numerator
// y - number of successes for the ratio denominator
// n - number of trials for the ratio denominator
// alpha - confidence level (between 0 and 1)
export function approximateBinomialRatioConfidence(
  x: number,
  m: number,
  y: number,
  n: number
): [number, number] {
  assert(x >= 0 && x <= m);
  assert(y >= 0 && y <= n);

  if (
    (x === 0 && y === 0) ||
    (x === 0 && m < 0.5) ||
    (y === 0 && n < 0.5) ||
    (x === m && y === n && (x < 0.5 || y < 0.5))
  ) {
    return [0, Infinity];
  } else if (x === 0) {
    return [0, approximateBinomialRatioConfidence(0.5, m, y, n)[1]];
  } else if (y === 0) {
    return [approximateBinomialRatioConfidence(x, m, 0.5, n)[0], Infinity];
  } else if (x === m && y === n) {
    return approximateBinomialRatioConfidence(m - 0.5, m, n - 0.5, n);
  }

  const t = x / m / (y / n);
  const eta = 1.959963984540054; // scipy.stats.norm.ppf(1 - (1 - 0.95) / 2)
  const stddev = Math.sqrt(1 / x - 1 / m + 1 / y - 1 / n);
  return [t * Math.exp(-eta * stddev), t * Math.exp(eta * stddev)];
}
