import React from 'react';
import { GridContent, Props as GridContentProps } from './GridContent';
import { GridXAxis, GridYAxis, Props as GridAxisProps } from './GridAxis';
import { OutPortal } from 'react-reverse-portal';

type Props = {
  children: React.ReactNode;
  gridSizes: GridSizes;
  labels: string[];
  onLabelClick: (label: string) => void;
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

export const GridFigure = ({ children, gridSizes, labels, onLabelClick }: Props) => {
  const childrenAsArray: (React.ReactChild | {})[] = React.Children.toArray(children);
  const contentElements: Map<string, React.ReactElement<GridContentProps, typeof GridContent>> = new Map();
  let xAxisElement: React.ReactElement<GridAxisProps, typeof GridXAxis> | undefined = undefined;
  let yAxisElement: React.ReactElement<GridAxisProps, typeof GridYAxis> | undefined = undefined;
  for (const child of childrenAsArray) {
    if (childIsGridContent(child)) {
      contentElements.set(child.props.label, child);
    } else if (childIsGridXAxis(child)) {
      xAxisElement = child;
    } else if (childIsGridYAxis(child)) {
      yAxisElement = child;
    } else {
      console.warn('Found an invalid child type in GridFigure. It will be ignored.');
    }
  }

  const { plotWidth, numberCols, numberRows } = gridSizes;

  return (
    <>
      <div
        style={{
          display: 'grid',
          gridTemplateRows: `repeat(${numberRows}, ${plotWidth + 26}px) 30px`,
          gridTemplateColumns: `50px repeat(${numberCols}, ${plotWidth}px)`,
          justifyContent: 'center',
        }}
      >
        {/* X-Axis */}
        {new Array(numberCols).fill(undefined).map((_, i) => (
          <div
            key={`x-${i}`}
            style={{
              gridRowStart: Math.ceil(labels.length / numberCols) + 1,
              gridColumnStart: i + 2,
            }}
          >
            {xAxisElement?.props.portals[i] && <OutPortal node={xAxisElement?.props.portals[i]} />}
          </div>
        ))}

        {/* Y-Axis */}
        {new Array(numberRows).fill(undefined).map((_, i) => (
          <div
            key={`y-${i}`}
            style={{
              gridRowStart: i + 1,
              gridColumnStart: 1,
              paddingTop: 28,
            }}
          >
            {yAxisElement?.props.portals[i] && <OutPortal node={yAxisElement?.props.portals[i]} />}
          </div>
        ))}

        {/* Content in the middle */}
        {labels.map((label, i) => {
          const el = contentElements.get(label);
          return (
            <div
              key={label}
              className='border-2 border-solid border-black m-1 flex flex-column'
              style={{
                gridRowStart: Math.floor(i / numberCols) + 1,
                gridColumnStart: (i % numberCols) + 2,
              }}
            >
              <div
                className={`${
                  el?.props.highlighted ? 'bg-blue-500' : 'bg-gray-200'
                } hover:bg-blue-500 border-b-2 border-solid border-black pl-2 cursor-pointer`}
                onClick={() => onLabelClick(label)}
              >
                {label}
              </div>

              <div className='flex-1'>{el && el.props.children}</div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export type GridSizes = {
  plotWidth: number;
  numberCols: number;
  numberRows: number;
};

export const calculateGridSizes = (width: number, height: number, numberPlots: number): GridSizes => {
  // TODO Use a proper optimization method rather than this very stupid way of brute-forcing
  const plotHeightPadding = 32;
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
