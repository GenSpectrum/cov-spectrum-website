import React, { useMemo } from 'react';
import { GridContent, Props as GridContentProps } from './GridContent';
import { GridXAxis, GridYAxis, Props as GridAxisProps } from './GridAxis';

type Props = {
  children: React.ReactNode;
  width: number;
  height: number;
};

function childIsGridContent(
  child: React.ReactChild | {}
): child is React.ReactElement<GridContentProps, typeof GridContent> {
  return typeof child === 'object' && (child as any).type === GridContent;
}

function childIsGridXAxis(
  child: React.ReactChild | {}
): child is React.ReactElement<GridAxisProps, typeof GridXAxis> {
  return typeof child === 'object' && (child as any).type === GridXAxis;
}

function childIsGridYAxis(
  child: React.ReactChild | {}
): child is React.ReactElement<GridAxisProps, typeof GridYAxis> {
  return typeof child === 'object' && (child as any).type === GridYAxis;
}

export const GridFigure = ({ children, width, height }: Props) => {
  const childrenAsArray: (React.ReactChild | {})[] = React.Children.toArray(children);
  const contentElements: React.ReactElement<GridContentProps, typeof GridContent>[] = [];
  let xAxisElement: React.ReactElement<GridAxisProps, typeof GridXAxis> | undefined = undefined;
  let yAxisElement: React.ReactElement<GridAxisProps, typeof GridYAxis> | undefined = undefined;
  for (const child of childrenAsArray) {
    if (childIsGridContent(child)) {
      contentElements.push(child);
    } else if (childIsGridXAxis(child)) {
      xAxisElement = child;
    } else if (childIsGridYAxis(child)) {
      yAxisElement = child;
    } else {
      console.warn('Found an invalid child type in GridFigure. It will be ignored.');
    }
  }

  // Calculate the number of rows and columns and the size of the sub-plots
  const { plotWidth, numberCols, numberRows } = useMemo(() => {
    return calculateGridSizes(width, height - 30, contentElements.length);
  }, [width, height, contentElements.length]);

  return (
    <>
      <div
        style={{
          display: 'grid',
          gridTemplateRows: `repeat(${numberRows}, ${plotWidth + 20}px) 30px`,
          gridTemplateColumns: `50px repeat(${numberCols}, ${plotWidth}px)`,
          justifyContent: 'center',
        }}
      >
        {/* X-Axis */}
        {new Array(numberCols).fill(undefined).map((_, i) => (
          <div
            style={{
              gridRowStart: Math.ceil(contentElements.length / numberCols) + 1,
              gridColumnStart: i + 2,
            }}
          >
            {xAxisElement?.props.children}
          </div>
        ))}

        {/* Y-Axis */}
        {new Array(numberRows).fill(undefined).map((_, i) => (
          <div
            style={{
              gridRowStart: i + 1,
              gridColumnStart: 1,
              paddingTop: 28,
            }}
          >
            {yAxisElement?.props.children}
          </div>
        ))}

        {/* Content in the middle */}
        {contentElements.map((el, i) => (
          <div
            className='border-2 border-solid border-black m-1 flex flex-column'
            style={{
              gridRowStart: Math.floor(i / numberCols) + 1,
              gridColumnStart: (i % numberCols) + 2,
            }}
          >
            <div
              className='bg-gray-200 hover:bg-blue-500 border-b-2 border-solid border-black pl-2 cursor-pointer'
              onClick={el.props.onLabelClick}
            >
              {el.props.label}
            </div>

            <div className='flex-1'>{el.props.children}</div>
          </div>
        ))}
      </div>
    </>
  );
};

const calculateGridSizes = (width: number, height: number, numberPlots: number) => {
  // TODO Use a proper optimization method rather than this very stupid way of brute-forcing
  const plotHeightPadding = 28;
  const plotWidthPadding = 10;
  let plotWidth = 0;
  let best = {
    plotWidth: 0,
    waste: width * height,
    numberCols: NaN,
    numberRows: NaN,
  };

  while (true) {
    plotWidth += 10;
    const waste =
      width * height - numberPlots * (plotWidth + plotWidthPadding) * (plotWidth + plotHeightPadding);
    const numberCols = Math.floor(width / (plotWidth + plotWidthPadding));
    const numberRows = Math.ceil(numberPlots / numberCols);
    if (
      waste < 0 ||
      (plotWidth + plotWidthPadding) * numberCols > width ||
      (plotWidth + plotHeightPadding) * numberRows > height
    ) {
      break;
    }
    if (waste < best.waste) {
      best = { plotWidth, waste, numberCols, numberRows };
    }
    if (waste === 0) {
      break;
    }
  }

  return {
    plotWidth: best.plotWidth,
    numberCols: Math.min(best.numberCols, numberPlots),
    numberRows: best.numberRows,
  };
};
