import { TimeDistributionEntry } from '../../services/api-types';
import { addDayToYearWeek } from '../week';
import { fillWeeklyApiData } from '../fill-missing';

describe('fillApiWeeklyData', () => {
  test('single input element', () => {
    const emptyY: TimeDistributionEntry['y'] = {
      count: 0,
      total: 0,
      proportion: {
        value: 0,
        ciLower: 0,
        ciUpper: 0,
        confidenceLevel: 0,
      },
    };
    const inputData: TimeDistributionEntry[] = [
      {
        x: addDayToYearWeek('2023-07'),
        y: {
          count: 20,
          total: 517,
          proportion: {
            value: 0.04,
            ciLower: 0.035,
            ciUpper: 0.048,
            confidenceLevel: 0.95,
          },
        },
      },
    ];
    const actualOutputData: TimeDistributionEntry[] = fillWeeklyApiData(inputData, emptyY);
    expect(actualOutputData).toEqual(inputData);
  });
});
