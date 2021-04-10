import { ValueWithCI } from './chen2021Fitness-types';

export const formatValueWithCI = (
  { value, ciLower, ciUpper }: ValueWithCI,
  fractionDigits = 4,
  usePercentSign = false
) => {
  if (usePercentSign) {
    return (
      `${(value * 100).toFixed(fractionDigits)}% ` +
      `[${(ciLower * 100).toFixed(fractionDigits)}%, ${(ciUpper * 100).toFixed(fractionDigits)}%]`
    );
  } else {
    return `${value.toFixed(fractionDigits)} [${ciLower.toFixed(fractionDigits)}, ${ciUpper.toFixed(
      fractionDigits
    )}]`;
  }
};

export const dateToString = (date: Date): string => {
  return date.toISOString().substring(0, 10);
};
