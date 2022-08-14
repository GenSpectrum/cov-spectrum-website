export function isValidAAInsertion(s: string): boolean {
  // TODO Only allow existing genes
  return /^INS_[A-Z]{1,3}[0-9]{0,2}[AB]?:[0-9]+:[A-Z*?\\.]+$/.test(s.toUpperCase());
}
