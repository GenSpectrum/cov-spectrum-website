export function isValidNucInsertion(s: string): boolean {
  return /^INS_[0-9]+:[A-Z*?\\.]+$/.test(s.toUpperCase());
}
