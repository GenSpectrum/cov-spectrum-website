import { SpecialDateRangeSelector } from '../DateRangeSelector';

describe('SpecialDateRange', () => {
  describe('Past6M', () => {
    test('should have a Monday as from boundary', () => {
      const underTest = new SpecialDateRangeSelector('Past6M');

      expect(underTest.getDateRange().dateFrom!.dayjs.locale('en').format('dddd')).toBe('Monday');
    });
  });
});
