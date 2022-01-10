export enum AnalysisMode {
  Single = 'single',
  CompareEquals = 'compare-equals',
  CompareToBaseline = 'compare-to-baseline',
}

export function decodeAnalysisMode(encoded: string | null): AnalysisMode | null {
  if (!Object.values(AnalysisMode).includes(encoded as any)) {
    return null;
  }
  return AnalysisMode[encoded as keyof typeof AnalysisMode];
}
