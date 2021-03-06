import assert from 'assert';

export interface GridCellRequest {
  minWidth: number;
  maxWidth: number;
}

export interface PlacedGridCell {
  index: number;
  width: number;
}

export function placeGridCells(requests: GridCellRequest[], parentWidth: number): PlacedGridCell[][] {
  assert(Number.isSafeInteger(parentWidth));
  assert(
    requests.every(
      request =>
        Number.isSafeInteger(request.minWidth) &&
        request.minWidth > 0 &&
        Number.isSafeInteger(request.maxWidth) &&
        request.maxWidth > 0 &&
        request.minWidth <= request.maxWidth
    )
  );

  if (!requests.length) {
    return [];
  }

  const rows: GridCellRequest[][] = [];
  let currentRow = { items: [] as GridCellRequest[], width: 0 };
  for (const request of requests) {
    if (currentRow.items.length && currentRow.width + request.minWidth > parentWidth) {
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
      if (iteration === 1000) {
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
          .filter((v, i) => rowOutput[i].width < v.maxWidth)
          .reduce((a, c) => a + c.minWidth, 0);
        const addedWidths = rowRequests.map((v, i) => {
          const proportionalAddition = Math.floor((v.minWidth / sumOfGrowableMinWidths) * remainingWidth);
          return Math.min(proportionalAddition, v.maxWidth - rowOutput[i].width);
        });
        assert(addedWidths.every(w => w >= 0 && Number.isSafeInteger(w)));
        if (addedWidths.every(w => w === 0)) {
          // Finish of last few pixels if all addedWidths got rounded down
          for (let i = 0; i < rowOutput.length && i < remainingWidth; i++) {
            if (rowOutput[i].width < rowRequests[i].maxWidth) {
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
