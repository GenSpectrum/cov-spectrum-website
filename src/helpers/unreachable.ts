export function unreachable(value: never): never {
  console.error('unreachable branch reached with value', value);
  throw new Error('unreachable branch reached');
}
