import { LapisSelector } from '../data/LapisSelector';
import { SamplingStrategy } from '../data/SamplingStrategy';
import { SpecialDateRangeSelector } from '../data/DateRangeSelector';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useResizeDetector } from 'react-resize-detector';
import { useHistory, useLocation } from 'react-router';
import { Button } from 'react-bootstrap';
import { SequencesOverTimeGrid } from '../components/GridPlot/SequencesOverTimeGrid';

type FigureType = 'prevalence' | 'mutations';

type Props = {
  fullScreenMode: boolean;
  setFullScreenMode: (fullscreen: boolean) => void;
};

export const NewFocusPage = ({ fullScreenMode, setFullScreenMode }: Props) => {
  const [figureType, setFigureType] = useState<FigureType>('prevalence');
  const { width, height, ref } = useResizeDetector<HTMLDivElement>();

  const history = useHistory();
  const params = useUrlParams();

  const selector: LapisSelector = {
    location: {},
    variant: {},
    dateRange: new SpecialDateRangeSelector('Past6M'),
    samplingStrategy: SamplingStrategy.AllSamples,
    host: undefined,
    qc: {},
  };

  // Fullscreen
  const toggleFullscreen = useCallback(() => {
    setFullScreenMode(!fullScreenMode);
    if (fullScreenMode) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  }, [fullScreenMode, setFullScreenMode]);

  // Keyboard shortcuts
  const handleKeyPress = useCallback(
    event => {
      switch (event.key) {
        case 'p':
          setFigureType('prevalence');
          break;
        case 'm':
          setFigureType('mutations');
          break;
        case 'f':
          toggleFullscreen();
          break;
      }
    },
    [toggleFullscreen]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  // View
  return (
    <>
      {/* TODO What to do about small screens? */}
      <div
        key={fullScreenMode.toString()}
        style={{
          // Subtracting the header  TODO It's not good to have these constants here
          height: fullScreenMode ? '100vh' : 'calc(100vh - 72px - 2px)',
        }}
        className='flex flex-column'
      >
        {/* The config bar */}
        <div
          style={{ height: 50 }}
          className='border-b-2 border-solid border-gray-200 flex flex-row items-center px-4'
        >
          {fullScreenMode && (
            <div style={{ color: '#F18805', fontWeight: 'bold', fontSize: '1.75rem', marginRight: 10 }}>
              CS
            </div>
          )}
          <Button
            size='sm'
            className='mx-2'
            disabled={figureType === 'prevalence'}
            onClick={() => setFigureType('prevalence')}
          >
            [P]revalence
          </Button>
          <Button
            size='sm'
            className='mx-2'
            disabled={figureType === 'mutations'}
            onClick={() => setFigureType('mutations')}
          >
            [M]utations
          </Button>
          <div className='flex-grow-1' />
          <Button size='sm' className='mx-2' onClick={() => toggleFullscreen()}>
            [F]ullscreen
          </Button>
        </div>
        {/* The main area */}
        <div className='flex-grow p-4' ref={ref}>
          {width && height && (
            <>
              {figureType === 'prevalence' && (
                <SequencesOverTimeGrid
                  selector={selector}
                  pangoLineage={params.pangoLineage}
                  width={width}
                  height={height}
                  setPangoLineage={pangoLineage =>
                    setParams(history, { ...params, pangoLineage: pangoLineage.replace('*', '') })
                  }
                />
              )}
              {figureType === 'mutations' && <>missing</>}
            </>
          )}
        </div>
      </div>
    </>
  );
};

type UrlParams = {
  pangoLineage: string;
};

const useUrlParams = (): UrlParams => {
  const queryString = useLocation().search;
  const query = useMemo(() => new URLSearchParams(queryString), [queryString]);

  const params = useMemo(() => {
    return {
      pangoLineage: query.get('pangoLineage') ?? 'B',
    };
  }, [query]);

  return params;
};

const setParams = (history: any, params: UrlParams) => {
  // TODO properly type "history"
  history.push(`/focus?${new URLSearchParams(params).toString()}`);
};
