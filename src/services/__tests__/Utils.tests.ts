import { Utils } from '../Utils';

test('trimBy', () => {
  interface Case {
    arr: any[];
    isBlankFunc: (element: any) => boolean;
    expected: any[];
  }

  const cases: Case[] = [
    {
      arr: ['a', 'a', 'b', 'a', 'c', 'a'],
      isBlankFunc: (x: string) => x === 'a',
      expected: ['b', 'a', 'c'],
    },
    {
      arr: ['a', 'a', 'a'],
      isBlankFunc: (x: string) => x === 'a',
      expected: [],
    },
    {
      arr: [],
      isBlankFunc: (x: string) => x === 'a',
      expected: [],
    },
    {
      arr: [
        { a: 1, b: 0 },
        { a: 3, b: 12 },
        { a: 5, b: 0 },
        { a: 0, b: 5 },
        { a: 0, b: 0 },
      ],
      isBlankFunc: (x: { a: number; b: number }) => x.b === 0,
      expected: [
        { a: 3, b: 12 },
        { a: 5, b: 0 },
        { a: 0, b: 5 },
      ],
    },
  ];

  for (const c of cases) {
    const trimmed = Utils.trimBy(c.arr, c.isBlankFunc);
    expect(trimmed).toStrictEqual(c.expected);
  }
});
