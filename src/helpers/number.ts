/**
 * Shortens visual of number
 * @param num number to shorten (100000)
 * @returns shortened number string (ex. 100K)
 */
export function kFormat(num: number): string {
  if (num > 9999 && num < 1000000) {
    return (num / 1000).toFixed(0) + 'K';
  } else if (num > 1000000) {
    return (num / 1000000).toFixed(0) + 'M';
  } else if (num < 900) {
    return num.toString();
  }
  return num.toString();
}