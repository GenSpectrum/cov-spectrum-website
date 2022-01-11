export enum AnalysisMode {
  Single = 'Single',
  CompareEquals = 'CompareEquals',
  CompareToBaseline = 'CompareToBaseline',
}

export function decodeAnalysisMode(encoded: string | null): AnalysisMode | null {
  if (!Object.values(AnalysisMode).includes(encoded as any)) {
    return null;
  }
  return AnalysisMode[encoded as keyof typeof AnalysisMode];
}
