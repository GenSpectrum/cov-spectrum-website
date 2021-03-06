import { GridCellRequest, PlacedGridCell, placeGridCells } from '../PackedGrid';

describe('placeGridCells', () => {
  interface Case {
    label: string;
    requests: GridCellRequest[];
    parentWidth: number;
    result: PlacedGridCell[][];
  }
  const cases: Case[] = [
    {
      label: 'no grid cells',
      requests: [],
      parentWidth: 300,
      result: [],
    },
    {
      label: '1 grid cell (exactly parentWidth)',
      requests: [{ minWidth: 300, maxWidth: 300, minHeight: 400 }],
      parentWidth: 300,
      result: [[{ index: 0, width: 300, height: 400 }]],
    },
    {
      label: '1 grid cell (growing to parentWidth)',
      requests: [{ minWidth: 200, maxWidth: 400, minHeight: 400 }],
      parentWidth: 300,
      result: [[{ index: 0, width: 300, height: 400 }]],
    },
    {
      label: '1 grid cell (growing, but smaller than parentWidth)',
      requests: [{ minWidth: 200, maxWidth: 250, minHeight: 400 }],
      parentWidth: 300,
      result: [[{ index: 0, width: 250, height: 400 }]],
    },
    {
      label: '1 grid cell (requests to be larger than parent, not satisfied)',
      requests: [{ minWidth: 400, maxWidth: 400, minHeight: 400 }],
      parentWidth: 300,
      result: [[{ index: 0, width: 300, height: 400 }]],
    },
    {
      label: 'multiple grid cells (total fills exactly one row)',
      requests: [
        { minWidth: 100, maxWidth: 100, minHeight: 400 },
        { minWidth: 150, maxWidth: 150, minHeight: 200 },
        { minWidth: 100, maxWidth: 100, minHeight: 600 },
      ],
      parentWidth: 350,
      result: [
        [
          { index: 0, width: 100, height: 600 },
          { index: 1, width: 150, height: 600 },
          { index: 2, width: 100, height: 600 },
        ],
      ],
    },
    {
      label: 'multiple grid cells (each fills exactly one row)',
      requests: [
        { minWidth: 300, maxWidth: 300, minHeight: 400 },
        { minWidth: 300, maxWidth: 300, minHeight: 200 },
        { minWidth: 300, maxWidth: 300, minHeight: 600 },
      ],
      parentWidth: 300,
      result: [
        [{ index: 0, width: 300, height: 400 }],
        [{ index: 1, width: 300, height: 200 }],
        [{ index: 2, width: 300, height: 600 }],
      ],
    },
    {
      label: 'multiple grid cells (one row, remaining space distributed proportional to minWidth)',
      requests: [
        { minWidth: 50, maxWidth: 400, minHeight: 400 },
        { minWidth: 80, maxWidth: 400, minHeight: 200 },
        { minWidth: 70, maxWidth: 800, minHeight: 600 },
      ],
      parentWidth: 300,
      result: [
        [
          { index: 0, width: 75, height: 600 },
          { index: 1, width: 120, height: 600 },
          { index: 2, width: 105, height: 600 },
        ],
      ],
    },
    {
      label: 'multiple grid cells (one row, all elements hit maxWidth)',
      requests: [
        { minWidth: 50, maxWidth: 400, minHeight: 400 },
        { minWidth: 80, maxWidth: 400, minHeight: 200 },
        { minWidth: 70, maxWidth: 800, minHeight: 600 },
      ],
      parentWidth: 2000,
      result: [
        [
          { index: 0, width: 400, height: 600 },
          { index: 1, width: 400, height: 600 },
          { index: 2, width: 800, height: 600 },
        ],
      ],
    },
    {
      label: 'multiple grid cells (one row, some elements hit maxWidth)',
      requests: [
        { minWidth: 50, maxWidth: 600, minHeight: 400 },
        { minWidth: 80, maxWidth: 800, minHeight: 200 },
        { minWidth: 70, maxWidth: 400, minHeight: 600 },
      ],
      parentWidth: 1500,
      result: [
        [
          { index: 0, width: Math.ceil(50 + 325 + (125 * 50) / 130), height: 600 },
          { index: 1, width: Math.floor(80 + 520 + (125 * 80) / 130), height: 600 },
          { index: 2, width: 400, height: 600 },
        ],
      ],
    },
    {
      label: 'grid cells distributed across rows (minWidth === maxWidth)',
      requests: [
        { minWidth: 50, maxWidth: 50, minHeight: 400 },
        { minWidth: 80, maxWidth: 80, minHeight: 200 },
        { minWidth: 90, maxWidth: 90, minHeight: 600 },
        { minWidth: 20, maxWidth: 20, minHeight: 300 },
        { minWidth: 150, maxWidth: 150, minHeight: 400 },
      ],
      parentWidth: 200,
      result: [
        [
          { index: 0, width: 50, height: 400 },
          { index: 1, width: 80, height: 400 },
        ],
        [
          { index: 2, width: 90, height: 600 },
          { index: 3, width: 20, height: 600 },
        ],
        [{ index: 4, width: 150, height: 400 }],
      ],
    },
    {
      label:
        'grid cells distributed across rows (remaining space in each row distributed proportional to minWidth)',
      requests: [
        { minWidth: 50, maxWidth: 120, minHeight: 400 },
        { minWidth: 80, maxWidth: 100, minHeight: 200 },
        { minWidth: 90, maxWidth: 130, minHeight: 600 },
        { minWidth: 20, maxWidth: 200, minHeight: 300 },
        { minWidth: 95, maxWidth: 150, minHeight: 400 },
        { minWidth: 25, maxWidth: 150, minHeight: 400 },
        { minWidth: 90, maxWidth: 110, minHeight: 300 },
      ],
      parentWidth: 200,
      result: [
        [
          { index: 0, width: 100, height: 400 },
          { index: 1, width: 100, height: 400 },
        ],
        [
          { index: 2, width: 130, height: 600 },
          { index: 3, width: 70, height: 600 },
        ],
        [
          { index: 4, width: 150, height: 400 },
          { index: 5, width: 50, height: 400 },
        ],
        [{ index: 6, width: 110, height: 300 }],
      ],
    },
  ];

  for (const c of cases) {
    // eslint-disable-next-line jest/valid-title
    test(c.label, () => {
      const actualResult = placeGridCells(c.requests, c.parentWidth);
      expect(actualResult).toEqual(c.result);
    });
  }
});
