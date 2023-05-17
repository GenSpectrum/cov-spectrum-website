import { formatCiPercent, formatPercent, formatProportion } from '../format-data';

describe('formatProportion', function () {
  it('should format proportion with default 2 digits after the dot', function () {
    expect(formatProportion(0.123)).toBe('12.30');
  });

  it('should format proportion with given number of digits after the dot', function () {
    expect(formatProportion(0.123, 3)).toBe('12.300');
    expect(formatProportion(0.123, 0)).toBe('12');
  });
});

describe('formatPercent', function () {
  it('should format percent with default 2 digits after the dot', function () {
    expect(formatPercent(0.123)).toBe('12.30%');
  });

  it('should format percent with given number of digits after the dot', function () {
    expect(formatPercent(0.123, 3)).toBe('12.300%');
  });
});

describe('formatCiPercent', function () {
  it('should format CI percent', function () {
    expect(formatCiPercent([0.123, 0.456])).toBe('[12.30 - 45.60%]');
  });
});
