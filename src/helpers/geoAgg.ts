export function aggregateGeo(
  option: string,
  data: {
    division: string | null;
    count: number;
    prevalence?: number;
    country: string | null;
    region: string | null;
  }[]
): Map<string, { count: number; prevalence: number }> {
  const calc = new Map<string, { whole: number; variant: number }>();
  const output = new Map<string, { count: number; prevalence: number }>();

  switch (option) {
    case 'Regions':
      for (const item of data) {
        if (item.country && item.region) {
          if (!calc.has(item.region)) {
            let whole: number = item.prevalence ? item.count / item.prevalence : 0;
            calc.set(item.region, { whole: whole, variant: item.count });
          } else {
            const oldWhole = calc.get(item.region)?.whole ?? 0;
            const wholeToAdd = item.prevalence ? item.count / item.prevalence : 0;
            const oldVariant = calc.get(item.region)?.variant ?? 0;
            calc.set(item.region, { whole: oldWhole + wholeToAdd, variant: oldVariant + item.count });
          }
        }
      }

      break;
    case 'Countries':
      for (const item of data) {
        if (item.country && item.region) {
          if (!calc.has(item.country)) {
            let whole: number = item.prevalence ? item.count / item.prevalence : 0;
            calc.set(item.country, { whole: whole, variant: item.count });
          } else {
            const oldWhole = calc.get(item.country)?.whole ?? 0;
            const wholeToAdd = item.prevalence ? item.count / item.prevalence : 0;
            const oldVariant = calc.get(item.country)?.variant ?? 0;
            calc.set(item.country, { whole: oldWhole + wholeToAdd, variant: oldVariant + item.count });
          }
        }
      }
      break;
  }

  for (const [key, value] of calc.entries()) {
    output.set(key, { count: value.variant, prevalence: value.whole ? value.variant / value.whole : 0 });
  }

  return output;
}
