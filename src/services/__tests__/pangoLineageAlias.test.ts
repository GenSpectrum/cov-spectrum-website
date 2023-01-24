import { useQuery } from 'react-query';
import { renderHook } from '@testing-library/react-hooks';
import { usePangoLineageFullName, usePangoLineageWithAlias } from '../pangoLineageAlias';

jest.mock('react-query');
const useQueryMock = useQuery as jest.Mock;

describe('usePangoLineageFullName', () => {
  beforeEach(() => {
    useQueryMock.mockReset();
    useQueryMock.mockReturnValue([]);
  });

  test.each([
    { expectedResult: undefined, data: [] },
    { expectedResult: undefined, data: [{ alias: 'SOMEOTHERALIAS', fullName: 'FULLNAME.1.2.3' }] },
    { expectedResult: undefined, data: undefined },
    { expectedResult: 'FULLNAME.4.5.6.1.2.3', data: [{ alias: 'SOMEALIAS', fullName: 'FULLNAME.4.5.6' }] },
    { expectedResult: undefined, data: [{ alias: 'SOMEALIASEXTENDED', fullName: 'FULLNAME.4.5.6' }] },
  ])('$#: should return $expectedResult for $data available', ({ expectedResult, data }) => {
    useQueryMock.mockReturnValue({ data });

    const pangoLineage = 'SOMEALIAS.1.2.3';
    const { result } = renderHook(() => usePangoLineageFullName(pangoLineage));

    expect(result.current).toBe(expectedResult);
  });

  test('should return only alias if pangoLineage is alias', () => {
    useQueryMock.mockReturnValue({ data: [{ alias: 'SOMEALIAS', fullName: 'FULLNAME.1.2.3' }] });

    const pangoLineage = 'SOMEALIAS';
    const { result } = renderHook(() => usePangoLineageFullName(pangoLineage));

    expect(result.current).toBe('FULLNAME.1.2.3');
  });
});

describe('usePangoLineageWithAlias', () => {
  beforeEach(() => {
    useQueryMock.mockReset();
    useQueryMock.mockReturnValue([]);
  });

  test.each([
    { expectedResult: 'FULLNAME.4.5.6', data: [] },
    { expectedResult: 'FULLNAME.4.5.6', data: undefined },
    { expectedResult: 'ALIAS.6', data: [{ alias: 'ALIAS', fullName: 'FULLNAME.4.5' }] },
  ])('$#: should return $expectedResult for $data available', ({ expectedResult, data }) => {
    useQueryMock.mockReturnValue({ data });

    const pangoLineage = 'FULLNAME.4.5.6';
    const { result } = renderHook(() => usePangoLineageWithAlias(pangoLineage));

    expect(result.current).toBe(expectedResult);
  });
});
