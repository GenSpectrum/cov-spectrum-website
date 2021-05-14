import { calculateWilsonInterval } from '../wilson-interval';

test('calculateWilsonInterval', () => {
  const [low, high] = calculateWilsonInterval(5, 100);
  expect(low).toBeCloseTo(0.021543679268653298792, 10);
  expect(high).toBeCloseTo(0.11175046869375655694, 10);
});
