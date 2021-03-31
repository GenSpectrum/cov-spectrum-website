import assert from 'assert';

export interface GridCellRequest {
  minWidth?: number;
  maxWidth?: number;
}

type StrictGridCellRequest = GridCellRequest & { minWidth: number };

export interface PlacedGridCell {
  index: number;
  width: number;
}

export function placeGridCells(
  _requests: GridCellRequest[],
  { parentWidth, maxColumns }: { parentWidth: number; maxColumns?: number }
): PlacedGridCell[][] {
  assert(Number.isSafeInteger(parentWidth) && parentWidth >= 0);
  assert(maxColumns === undefined || (Number.isSafeInteger(maxColumns) && maxColumns > 0));
  assert(
    _requests.every(
      request =>
        (request.minWidth === undefined ||
          (Number.isSafeInteger(request.minWidth) && request.minWidth > 0)) &&
        (request.maxWidth === undefined ||
          (Number.isSafeInteger(request.maxWidth) && request.maxWidth > 0)) &&
        (request.minWidth === undefined ||
          request.maxWidth === undefined ||
          request.minWidth <= request.maxWidth)
    )
  );

  const requests: StrictGridCellRequest[] = _requests.map(request => ({
    ...request,
    minWidth: request.minWidth ?? Math.min(request.maxWidth ?? parentWidth, parentWidth),
  }));

  if (!requests.length) {
    return [];
  }

  const rows: StrictGridCellRequest[][] = [];
  let currentRow = { items: [] as StrictGridCellRequest[], width: 0 };
  for (const request of requests) {
    if (
      (currentRow.items.length && currentRow.width + request.minWidth > parentWidth) ||
      (maxColumns && currentRow.items.length >= maxColumns)
    ) {
      rows.push(currentRow.items);
      currentRow = { items: [], width: 0 };
    }
    currentRow.items.push(request);
    currentRow.width += request.minWidth;
  }
  if (currentRow.items) {
    rows.push(currentRow.items);
  }

  let nextOutputIndex = 0;
  return rows.map(rowRequests => {
    const rowOutput = rowRequests.map(request => {
      const index = nextOutputIndex++;
      return { index, width: request.minWidth };
    });

    const getRowWidth = () => rowOutput.reduce((a, c) => a + c.width, 0);

    for (let iteration = 0; ; iteration++) {
      if (iteration === 50) {
        console.warn('max number of iterations reached');
        break;
      }

      const oldRowWidth = getRowWidth();
      if (oldRowWidth === parentWidth) {
        break;
      } else if (oldRowWidth > parentWidth) {
        assert(rowOutput.length === 1);
        rowOutput[0].width = parentWidth;
      } else if (rowOutput.every((v, i) => v.width === rowRequests[i].maxWidth)) {
        break;
      } else {
        const remainingWidth = parentWidth - oldRowWidth;
        const sumOfGrowableMinWidths = rowRequests
          .filter((v, i) => v.maxWidth === undefined || rowOutput[i].width < v.maxWidth)
          .reduce((a, c) => a + c.minWidth, 0);
        const addedWidths = rowRequests.map((v, i) => {
          const proportionalAddition = Math.floor((v.minWidth / sumOfGrowableMinWidths) * remainingWidth);
          return v.maxWidth === undefined
            ? proportionalAddition
            : Math.min(proportionalAddition, v.maxWidth - rowOutput[i].width);
        });
        assert(addedWidths.every(w => w >= 0 && Number.isSafeInteger(w)));
        if (addedWidths.every(w => w === 0)) {
          // Finish of last few pixels if all addedWidths got rounded down
          for (let i = 0; i < rowOutput.length && i < remainingWidth; i++) {
            const maxWidth = rowRequests[i].maxWidth;
            if (maxWidth === undefined || rowOutput[i].width < maxWidth) {
              rowOutput[i].width++;
            }
          }
        } else {
          for (const [i, w] of addedWidths.entries()) {
            rowOutput[i].width += w;
          }
        }
      }
    }

    return rowOutput;
  });
}
