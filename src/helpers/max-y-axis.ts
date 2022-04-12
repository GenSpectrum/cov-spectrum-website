// return maximum value to display in Y axis of a chart
export function maxYAxis(yMax: number, resultIfNotZero?: number, resultIfZero?: number): number {
  if (yMax === 0) {
    if (typeof resultIfZero !== 'undefined') {
      return resultIfZero;
    } else {
      return 1;
    }
  } else if (typeof resultIfNotZero !== 'undefined') {
    return resultIfNotZero;
  } else if (yMax <= 0.0005) {
    return 0.0005;
  } else {
    return yMax;
  }
}
