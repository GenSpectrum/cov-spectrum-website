export function unreachable(value: never): never {
  console.error('unreachable branch reached with value', value);
  throw new Error('unreachable branch reached');
}

export function defaultForNever<T>(value: never, defaultValue: T): T {
  return defaultValue;
}
