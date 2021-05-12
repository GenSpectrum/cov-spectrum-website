/**
 * A very basic function that returns three ticks: the first date, the last date, and the date that lies in the middle.
 *
 * @param data: A list that is sorted by date ascendantly
 */
export function getTicks(data: { date: Date }[]): number[] {
  let ticksDates: Date[] = [];
  if (data.length === 0) {
    ticksDates = [];
  } else if (data.length === 1) {
    ticksDates = [data[0].date];
  } else {
    const startDate = data[0].date;
    const endDate = data[data.length - 1].date;
    if (data.length === 2) {
      ticksDates = [startDate, endDate];
    } else {
      ticksDates = [startDate, new Date((endDate.getTime() + startDate.getTime()) / 2), endDate];
    }
  }
  return ticksDates.map(d => d.getTime());
}
