import { GridCellRequest, PlacedGridCell, placeGridCells } from '../algorithm';

describe('placeGridCells', () => {
  interface Case {
    label: string;
    requests: GridCellRequest[];
    parentWidth: number;
    maxColumns?: number;
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
      requests: [{ minWidth: 300, maxWidth: 300 }],
      parentWidth: 300,
      result: [[{ index: 0, width: 300 }]],
    },
    {
      label: '1 grid cell (growing to parentWidth)',
      requests: [{ minWidth: 200, maxWidth: 400 }],
      parentWidth: 300,
      result: [[{ index: 0, width: 300 }]],
    },
    {
      label: '1 grid cell (unlimited maxWidth)',
      requests: [{ minWidth: 200 }],
      parentWidth: 300,
      result: [[{ index: 0, width: 300 }]],
    },
    {
      label: '1 grid cell (undefined minWidth and maxWidth, should fill)',
      requests: [{}],
      parentWidth: 300,
      result: [[{ index: 0, width: 300 }]],
    },
    {
      label: '1 grid cell (undefined minWidth, small maxWidth, should limit)',
      requests: [{ maxWidth: 200 }],
      parentWidth: 300,
      result: [[{ index: 0, width: 200 }]],
    },
    {
      label: '1 grid cell (undefined minWidth, large maxWidth, should fill)',
      requests: [{ maxWidth: 400 }],
      parentWidth: 300,
      result: [[{ index: 0, width: 300 }]],
    },
    {
      label: '1 grid cell (growing, but smaller than parentWidth)',
      requests: [{ minWidth: 200, maxWidth: 250 }],
      parentWidth: 300,
      result: [[{ index: 0, width: 250 }]],
    },
    {
      label: '1 grid cell (requests to be larger than parent, not satisfied)',
      requests: [{ minWidth: 400, maxWidth: 400 }],
      parentWidth: 300,
      result: [[{ index: 0, width: 300 }]],
    },
    {
      label: 'multiple grid cells (total fills exactly one row)',
      requests: [
        { minWidth: 100, maxWidth: 100 },
        { minWidth: 150, maxWidth: 150 },
        { minWidth: 100, maxWidth: 100 },
      ],
      parentWidth: 350,
      result: [
        [
          { index: 0, width: 100 },
          { index: 1, width: 150 },
          { index: 2, width: 100 },
        ],
      ],
    },
    {
      label: 'multiple grid cells (each fills exactly one row)',
      requests: [
        { minWidth: 300, maxWidth: 300 },
        { minWidth: 300, maxWidth: 300 },
        { minWidth: 300, maxWidth: 300 },
      ],
      parentWidth: 300,
      result: [[{ index: 0, width: 300 }], [{ index: 1, width: 300 }], [{ index: 2, width: 300 }]],
    },
    {
      label: 'multiple grid cells (no widths means full rows)',
      requests: [{}, {}, {}],
      parentWidth: 300,
      result: [[{ index: 0, width: 300 }], [{ index: 1, width: 300 }], [{ index: 2, width: 300 }]],
    },
    {
      label: 'multiple grid cells (one row, remaining space distributed proportional to minWidth)',
      requests: [
        { minWidth: 50, maxWidth: 400 },
        { minWidth: 80, maxWidth: 400 },
        { minWidth: 70, maxWidth: 800 },
      ],
      parentWidth: 300,
      result: [
        [
          { index: 0, width: 75 },
          { index: 1, width: 120 },
          { index: 2, width: 105 },
        ],
      ],
    },
    {
      label: 'multiple grid cells (one row, all elements hit maxWidth)',
      requests: [
        { minWidth: 50, maxWidth: 400 },
        { minWidth: 80, maxWidth: 400 },
        { minWidth: 70, maxWidth: 800 },
      ],
      parentWidth: 2000,
      result: [
        [
          { index: 0, width: 400 },
          { index: 1, width: 400 },
          { index: 2, width: 800 },
        ],
      ],
    },
    {
      label: 'multiple grid cells (one row, some elements hit maxWidth)',
      requests: [
        { minWidth: 50, maxWidth: 600 },
        { minWidth: 80, maxWidth: 800 },
        { minWidth: 70, maxWidth: 400 },
      ],
      parentWidth: 1500,
      result: [
        [
          { index: 0, width: Math.ceil(50 + 325 + (125 * 50) / 130) },
          { index: 1, width: Math.floor(80 + 520 + (125 * 80) / 130) },
          { index: 2, width: 400 },
        ],
      ],
    },
    {
      label: 'grid cells distributed across rows (minWidth === maxWidth)',
      requests: [
        { minWidth: 50, maxWidth: 50 },
        { minWidth: 80, maxWidth: 80 },
        { minWidth: 90, maxWidth: 90 },
        { minWidth: 20, maxWidth: 20 },
        { minWidth: 150, maxWidth: 150 },
      ],
      parentWidth: 200,
      result: [
        [
          { index: 0, width: 50 },
          { index: 1, width: 80 },
        ],
        [
          { index: 2, width: 90 },
          { index: 3, width: 20 },
        ],
        [{ index: 4, width: 150 }],
      ],
    },
    {
      label:
        'grid cells distributed across rows (remaining space in each row distributed proportional to minWidth)',
      requests: [
        { minWidth: 50, maxWidth: 120 },
        { minWidth: 80, maxWidth: 100 },
        { minWidth: 90, maxWidth: 130 },
        { minWidth: 20, maxWidth: undefined },
        { minWidth: 95, maxWidth: 150 },
        { minWidth: 25, maxWidth: 150 },
        { minWidth: 90, maxWidth: 110 },
      ],
      parentWidth: 200,
      result: [
        [
          { index: 0, width: 100 },
          { index: 1, width: 100 },
        ],
        [
          { index: 2, width: 130 },
          { index: 3, width: 70 },
        ],
        [
          { index: 4, width: 150 },
          { index: 5, width: 50 },
        ],
        [{ index: 6, width: 110 }],
      ],
    },
    {
      label:
        'multiple grid cells forced onto separate rows by column limit (width limited elements would fill exactly one row)',
      requests: [
        { minWidth: 100, maxWidth: 100 },
        { minWidth: 150, maxWidth: 150 },
        { minWidth: 100, maxWidth: 100 },
      ],
      parentWidth: 350,
      maxColumns: 2,
      result: [
        [
          { index: 0, width: 100 },
          { index: 1, width: 150 },
        ],
        [{ index: 2, width: 100 }],
      ],
    },
    {
      label: 'multiple grid cells forced onto separate rows (more than one full row)',
      requests: [
        { minWidth: 100, maxWidth: 100 },
        { minWidth: 150, maxWidth: 150 },
        { minWidth: 100, maxWidth: 100 },
        { minWidth: 150, maxWidth: 150 },
        { minWidth: 100, maxWidth: 100 },
        { minWidth: 100, maxWidth: 100 },
      ],
      parentWidth: 350,
      maxColumns: 2,
      result: [
        [
          { index: 0, width: 100 },
          { index: 1, width: 150 },
        ],
        [
          { index: 2, width: 100 },
          { index: 3, width: 150 },
        ],
        [
          { index: 4, width: 100 },
          { index: 5, width: 100 },
        ],
      ],
    },
    {
      label: 'multiple grid cells forced onto separate rows by column limit (no max widths)',
      requests: [{ minWidth: 10 }, { minWidth: 10 }, { minWidth: 100 }, { minWidth: 100 }],
      parentWidth: 300,
      maxColumns: 2,
      result: [
        [
          { index: 0, width: 150 },
          { index: 1, width: 150 },
        ],
        [
          { index: 2, width: 150 },
          { index: 3, width: 150 },
        ],
      ],
    },
    {
      label: 'multiple grid cells forced onto separate rows by column limit (different maxColumns value)',
      requests: [{ minWidth: 10 }, { minWidth: 10 }, { minWidth: 100 }, { minWidth: 100 }],
      parentWidth: 300,
      maxColumns: 3,
      result: [
        [
          { index: 0, width: 25 },
          { index: 1, width: 25 },
          { index: 2, width: 250 },
        ],
        [{ index: 3, width: 300 }],
      ],
    },
  ];

  for (const c of cases) {
    // eslint-disable-next-line jest/valid-title
    test(c.label, () => {
      const actualResult = placeGridCells(c.requests, {
        parentWidth: c.parentWidth,
        maxColumns: c.maxColumns,
      });
      expect(actualResult).toEqual(c.result);
    });
  }
});
