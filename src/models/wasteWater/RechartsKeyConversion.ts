/**
 * The key name that will be passed to recharts may not contain additional dots because dots are used to
 * navigate through nested objects.
 */
export function escapeValueName(name: string): string {
  return name.replaceAll('.', '__');
}

export function deEscapeValueName(escapedName: string): string {
  return escapedName.replaceAll('__', '.');
}
