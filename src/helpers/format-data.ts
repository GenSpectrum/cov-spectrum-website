export function formatCiPercent(ci: [number, number]): string {
  return `[${formatProportion(ci[0])} - ${formatPercent(ci[1])}]`;
}

export function formatPercent(value: number, digitsAfterDot: number = 2): string {
  return formatProportion(value, digitsAfterDot) + '%';
}

export function formatProportion(value: number, digitsAfterDot: number = 2): string {
  return (Number(value) * 100).toFixed(digitsAfterDot);
}
