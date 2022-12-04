import { LapisSelector } from '../data/LapisSelector';
import { SamplingStrategy } from '../data/SamplingStrategy';
import { SpecialDateRangeSelector } from '../data/DateRangeSelector';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useResizeDetector } from 'react-resize-detector';
import { useHistory, useLocation } from 'react-router';
import { QueryStatus, useQuery } from '../helpers/query-hook';
import { _fetchAggSamples } from '../data/api-lapis';
import { PangoLineageAliasResolverService } from '../services/PangoLineageAliasResolverService';
import { SingleData } from '../data/transform/transform';
import { comparePangoLineages } from '../data/transform/common';
import Loader from '../components/Loader';
import { Button } from 'react-bootstrap';
import { SequencesOverTimeGrid } from '../components/GridPlot/SequencesOverTimeGrid';
import { calculateGridSizes, GridFigure } from '../components/GridPlot/GridFigure';
import { createHtmlPortalNode, HtmlPortalNode, InPortal, OutPortal } from 'react-reverse-portal';
import { GridContent } from '../components/GridPlot/GridContent';
import { AxisPortals } from '../components/GridPlot/common';
import { GridXAxis, GridYAxis } from '../components/GridPlot/GridAxis';

type FigureType = 'prevalence' | 'mutations';
type TmpEntry = { nextcladePangoLineage: string | null; count: number };
type TmpEntry2 = { nextcladePangoLineage: string; nextcladePangoLineageFullName: string; count: number };

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

  // Find the (sub-)lineages that should be shown
  const dataQuery: QueryStatus<TmpEntry2[]> = useQuery(
    signal =>
      (_fetchAggSamples(selector, ['nextcladePangoLineage'], signal) as Promise<TmpEntry[]>).then(
        async data => {
          const data2: TmpEntry2[] = [];
          for (let d of data) {
            if (d.nextcladePangoLineage) {
              data2.push({
                ...d,
                nextcladePangoLineage: d.nextcladePangoLineage!!,
                nextcladePangoLineageFullName:
                  (await PangoLineageAliasResolverService.findFullName(d.nextcladePangoLineage)) ??
                  d.nextcladePangoLineage,
              });
            }
          }
          return data2;
        }
      ),
    [selector]
  );

  const { subLineages, portals } = useMemo(() => {
    if (!dataQuery.data) {
      return {};
    }
    const pangoLineageCount = dataQuery.data;
    const currentLineage = params.pangoLineage;
    const currentLineageFullName =
      PangoLineageAliasResolverService.findFullNameUnsafeSync(currentLineage) ?? currentLineage;
    const lineagesData = new SingleData(pangoLineageCount)
      .filter(
        d =>
          d.nextcladePangoLineage === currentLineage ||
          d.nextcladePangoLineageFullName.startsWith(currentLineageFullName + '.')
      )
      .map(d => {
        let lineage;
        if (d.nextcladePangoLineage === currentLineage) {
          lineage = currentLineage;
        } else {
          // These are the sub-lineages
          const withoutPrefix = d.nextcladePangoLineageFullName.substring(currentLineageFullName.length + 1);
          const firstSub =
            withoutPrefix.indexOf('.') !== -1
              ? withoutPrefix.substring(0, withoutPrefix.indexOf('.'))
              : withoutPrefix;
          lineage =
            PangoLineageAliasResolverService.findAliasUnsafeSync(`${currentLineageFullName}.${firstSub}`) +
            '*';
        }
        return {
          nextcladePangoLineage: lineage,
          count: d.count,
        };
      });
    const subLineages = [...new Set(lineagesData.data.map(d => d.nextcladePangoLineage))].sort(
      comparePangoLineages
    );

    // Portals
    const portals = new Map<string, HtmlPortalNode>();
    for (const subLineage of subLineages) {
      portals.set(subLineage, createHtmlPortalNode());
    }

    return { subLineages, portals };
  }, [dataQuery, params.pangoLineage]);

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

  const { gridSizes, axisPortals } = useMemo(() => {
    if (!width || !height || !subLineages?.length) {
      return {};
    }
    const gridSizes = calculateGridSizes(width, height - 20, subLineages?.length);
    const axisPortals: AxisPortals = {
      x: new Array(gridSizes.numberCols).fill(undefined).map(_ => createHtmlPortalNode()),
      y: new Array(gridSizes.numberRows).fill(undefined).map(_ => createHtmlPortalNode()),
    };

    return { gridSizes, axisPortals };
  }, [width, height, subLineages?.length]);

  // View
  if (!subLineages) {
    return <Loader />;
  }

  return (
    <div key={fullScreenMode.toString()}>
      {/* TODO What to do about small screens? */}
      <div
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
          {gridSizes && (
            <>
              <GridFigure
                gridSizes={gridSizes}
                labels={subLineages}
                onLabelClick={pangoLineage =>
                  setParams(history, { ...params, pangoLineage: pangoLineage.replace('*', '') })
                }
              >
                {subLineages.map(subLineage => (
                  <GridContent label={subLineage}>
                    <OutPortal key={subLineage} node={portals.get(subLineage)!} />
                  </GridContent>
                ))}
                <GridXAxis portals={axisPortals.x} />
                <GridYAxis portals={axisPortals.y} />
              </GridFigure>
            </>
          )}
        </div>
      </div>
      {figureType === 'prevalence' && gridSizes && (
        <SequencesOverTimeGrid
          selector={selector}
          plotWidth={gridSizes.plotWidth - 12}
          pangoLineage={params.pangoLineage}
          portals={portals}
          axisPortals={axisPortals}
        />
      )}
      {figureType === 'mutations' &&
        gridSizes &&
        [...portals].map(([lineage, portal]) => (
          <InPortal node={portal} key={lineage}>
            <div
              style={{ width: gridSizes.plotWidth - 12, height: gridSizes.plotWidth - 12 }}
              className='text-center flex justify-center items-center'
            >
              Upcoming: the mutations of this lineage
            </div>
          </InPortal>
        ))}
    </div>
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
