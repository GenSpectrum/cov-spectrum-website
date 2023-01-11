export type Rename<T, K extends keyof T, N extends string> = Pick<T, Exclude<keyof T, K>> & {
  [P in N]: T[K];
};

/**
 * Desired order: B.1.2, B.1.2*, B.1.2.7, B.1.10, C.1, BA.1
 */
export const comparePangoLineages = (a: string, b: string) => {
  const aPadded = a
    .split('.')
    .map(s => s.padStart(5, '0'))
    .join('.');
  const bPadded = b
    .split('.')
    .map(s => s.padStart(5, '0'))
    .join('.');
  return aPadded.localeCompare(bPadded);
};
