import { LapisSelector } from '../data/LapisSelector';
import { SamplingStrategy } from '../data/SamplingStrategy';
import {
  DateRangeSelector,
  formatDateRangeSelector,
  SpecialDateRangeSelector,
} from '../data/DateRangeSelector';
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
import { createHtmlPortalNode, HtmlPortalNode, OutPortal } from 'react-reverse-portal';
import { GridContent } from '../components/GridPlot/GridContent';
import { AxisPortals } from '../components/GridPlot/common';
import { GridXAxis, GridYAxis } from '../components/GridPlot/GridAxis';
import { MutationsGrid } from '../components/GridPlot/MutationsGrid';
import { sequenceTypes } from '../data/SequenceType';
import { MdLocationPin, MdCalendarToday } from 'react-icons/md';
import { VscListTree } from 'react-icons/vsc';
import { IoReturnDownBackOutline } from 'react-icons/io5';
import { addDefaultHostAndQc } from '../data/HostAndQcSelector';
import { NewFocusPageCommandPanelModal } from '../components/NewFocusPageCommandPanel';
import { GrowthAdvantageGrid } from '../components/GridPlot/GrowthAdvantageGrid';
import { AlmostFullscreenModal } from '../components/AlmostFullscreenModal';
import { FocusSinglePageContent } from './FocusSinglePage';
import { useSingleSelectorsFromLapisSelector } from '../helpers/selectors-from-explore-url-hook';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import DateRangePicker from '../components/DateRangePicker';
import { PlaceSelect } from '../components/PlaceSelect';
import { encodeLocationSelectorToSingleString, LocationSelector } from '../data/LocationSelector';

type FigureType = 'prevalence' | 'aa-mutations' | 'nuc-mutations' | 'growth-advantage';
type TmpEntry = { nextcladePangoLineage: string | null; count: number };
type TmpEntry2 = { nextcladePangoLineage: string; nextcladePangoLineageFullName: string; count: number };

type Props = {
  fullScreenMode: boolean;
  setFullScreenMode: (fullscreen: boolean) => void;
};

type Size = 'size1' | 'size2' | 'size3' | 'all';
const sizes: { id: Size; label: string; approxNumberPlots: number }[] = [
  { id: 'size1', label: 'S', approxNumberPlots: 4 },
  { id: 'size2', label: 'M', approxNumberPlots: 8 },
  { id: 'size3', label: 'L', approxNumberPlots: 16 },
  { id: 'all', label: 'All', approxNumberPlots: Infinity },
];
const sizeMap = new Map(sizes.map(s => [s.id, s]));

type CursorStatus = {
  row: number;
  column: number;
};

export const NewFocusPage = ({ fullScreenMode, setFullScreenMode }: Props) => {
  const [figureType, setFigureType] = useState<FigureType>('prevalence');
  const [size, setSize] = useState<Size>('size2');
  const [cursor, setCursor] = useState<CursorStatus>({ row: 0, column: 0 });
  const [showLocationSelect, setShowLocationSelect] = useState(false);
  const [showCommandPanel, setShowCommandPanel] = useState(false);
  const [showVariantDetailsModal, setShowVariantDetailsModal] = useState(false);
  const { width, height, ref } = useResizeDetector<HTMLDivElement>();
  const [locationSelector, setLocationSelector] = useState<LocationSelector>({});
  const [dateRangeSelector, setDateRangeSelector] = useState<DateRangeSelector>(
    new SpecialDateRangeSelector('Past6M')
  );

  const history = useHistory();
  const params = useUrlParams();

  const selector: LapisSelector = useMemo(
    () =>
      addDefaultHostAndQc({
        location: locationSelector,
        variant: {},
        dateRange: dateRangeSelector,
        samplingStrategy: SamplingStrategy.AllSamples,
      }),
    [dateRangeSelector, locationSelector]
  );

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

  const { allSubLineages } = useMemo(() => {
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
      })
      .groupBy(e => e.nextcladePangoLineage);
    const allSubLineages: { nextcladePangoLineage: string; count: number }[] = [];
    for (const [nextcladePangoLineage, d] of lineagesData.data) {
      const count = d.data.reduce((prev, curr) => prev + curr.count, 0);
      allSubLineages.push({ nextcladePangoLineage, count });
    }

    return { allSubLineages };
  }, [dataQuery, params.pangoLineage]);

  // Calculate grid size
  const { gridSizes, axisPortals } = useMemo(() => {
    if (!width || !height || !allSubLineages?.length) {
      return {};
    }
    const numberPlots = Math.min(allSubLineages.length, sizeMap.get(size)!.approxNumberPlots);
    const gridSizes = calculateGridSizes(width, height - 20, numberPlots);
    const axisPortals: AxisPortals = {
      x: new Array(gridSizes.numberCols).fill(undefined).map(_ => createHtmlPortalNode()),
      y: new Array(gridSizes.numberRows).fill(undefined).map(_ => createHtmlPortalNode()),
    };

    return { gridSizes, axisPortals };
  }, [width, height, allSubLineages?.length, size]);

  // Select lineages to display and create their portals
  const { filteredSubLineages, portals } = useMemo(() => {
    if (!gridSizes || !allSubLineages) {
      return {};
    }

    const numberPlots = gridSizes.numberRows * gridSizes.numberCols;
    const filteredSubLineages = allSubLineages
      .sort((a, b) => b.count - a.count)
      .slice(0, numberPlots)
      .map(d => d.nextcladePangoLineage)
      .sort(comparePangoLineages);

    // Portals
    const portals = new Map<string, HtmlPortalNode>();
    for (const subLineage of filteredSubLineages) {
      portals.set(subLineage, createHtmlPortalNode());
    }

    return { filteredSubLineages, portals };
  }, [gridSizes, allSubLineages]);

  // Fullscreen
  const toggleFullscreen = useCallback(() => {
    setFullScreenMode(!fullScreenMode);
    if (fullScreenMode) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  }, [fullScreenMode, setFullScreenMode]);

  // Navigation
  const setPangoLineage = useCallback(
    (pangoLineage: string) => {
      setShowCommandPanel(false);
      setParams(history, { ...params, pangoLineage: pangoLineage.replace('*', '') });
    },
    [history, params, setShowCommandPanel]
  );

  const goToParentLineage = useCallback(() => {
    const fullName =
      PangoLineageAliasResolverService.findFullNameUnsafeSync(params.pangoLineage) ?? params.pangoLineage;
    if (!fullName.includes('.')) {
      // We already reached the root
      return;
    }
    const lastDotIndex = fullName.lastIndexOf('.');
    const parentFullName = fullName.substring(0, lastDotIndex);
    const parent = PangoLineageAliasResolverService.findAliasUnsafeSync(parentFullName);
    setPangoLineage(parent);
  }, [params.pangoLineage, setPangoLineage]);

  const setCursorInsideGrid = useCallback(
    (newCursor: CursorStatus) => {
      if (!gridSizes || !filteredSubLineages) {
        return;
      }
      if (
        newCursor.row < -1 ||
        newCursor.row >= gridSizes.numberRows ||
        newCursor.column < 0 ||
        newCursor.column >= gridSizes.numberCols ||
        newCursor.row * gridSizes.numberCols + newCursor.column >= filteredSubLineages.length
      ) {
        return;
      }
      setCursor(newCursor);
    },
    [gridSizes, filteredSubLineages, setCursor]
  );

  let lineageOfCursor: string | undefined = undefined;
  if (cursor.row >= 0 && gridSizes) {
    const index = cursor.row * gridSizes.numberCols + cursor.column;
    lineageOfCursor = filteredSubLineages && filteredSubLineages[index];
  }
  const selectorsOfCursor = useSingleSelectorsFromLapisSelector({
    ...selector,
    variant: { nextcladePangoLineage: lineageOfCursor },
  });

  // Keyboard shortcuts
  const handleKeyPress = useCallback(
    event => {
      if (showLocationSelect || showCommandPanel || showVariantDetailsModal) {
        return;
      }
      if (event.metaKey || event.ctrlKey) {
        switch (event.key) {
          case 'k':
            setShowCommandPanel(true);
            break;
        }
      } else {
        switch (event.key) {
          case 'p':
            setFigureType('prevalence');
            break;
          case 'a':
            setFigureType('aa-mutations');
            break;
          case 'n':
            setFigureType('nuc-mutations');
            break;
          case 'r':
            setFigureType('growth-advantage');
            break;
          case 'f':
            toggleFullscreen();
            break;
          case 'ArrowUp':
            setCursorInsideGrid({ row: cursor.row - 1, column: cursor.column });
            event.preventDefault();
            break;
          case 'ArrowDown':
            setCursorInsideGrid({ row: cursor.row + 1, column: cursor.column });
            event.preventDefault();
            break;
          case 'ArrowLeft':
            setCursorInsideGrid({ row: cursor.row, column: cursor.column - 1 });
            event.preventDefault();
            break;
          case 'ArrowRight':
            setCursorInsideGrid({ row: cursor.row, column: cursor.column + 1 });
            event.preventDefault();
            break;
          case 'Enter':
            if (cursor.row === -1) {
              goToParentLineage();
            }
            if (lineageOfCursor) {
              setPangoLineage(lineageOfCursor);
            }
            break;
          case ' ':
            if (lineageOfCursor) {
              setShowVariantDetailsModal(true);
            }
            event.preventDefault();
            break;
        }
      }
    },
    [
      toggleFullscreen,
      cursor,
      goToParentLineage,
      lineageOfCursor,
      setPangoLineage,
      setCursorInsideGrid,
      showLocationSelect,
      showCommandPanel,
      setShowCommandPanel,
      showVariantDetailsModal,
      setShowVariantDetailsModal,
    ]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  // Misc
  const isCursorOnParent = cursor.row === -1;
  const isCursorOnLineage = useCallback(
    (index: number) => {
      if (!gridSizes) {
        return false;
      }
      const lineageRow = Math.floor(index / gridSizes.numberCols);
      const lineageCol = index % gridSizes.numberCols;
      return lineageRow === cursor.row && lineageCol === cursor.column;
    },
    [cursor.column, cursor.row, gridSizes]
  );

  useEffect(() => {
    setCursor({
      row: 0,
      column: 0,
    });
  }, [params.pangoLineage]);

  // View
  return (
    <>
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
              <div style={{ fontWeight: 'bold', fontSize: '1.75rem', marginRight: 10 }}>
                <span style={{ color: '#726b6b', marginRight: -5 }}>C</span>
                <span style={{ color: '#F18805' }}>S</span>
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
              disabled={figureType === 'aa-mutations'}
              onClick={() => setFigureType('aa-mutations')}
            >
              [A]A mutations
            </Button>
            <Button
              size='sm'
              className='mx-2'
              disabled={figureType === 'nuc-mutations'}
              onClick={() => setFigureType('nuc-mutations')}
            >
              [N]uc mutations
            </Button>
            <Button
              size='sm'
              className='mx-2'
              disabled={figureType === 'growth-advantage'}
              onClick={() => setFigureType('growth-advantage')}
            >
              G[r]owth advantage
            </Button>
            <OverlayTrigger
              trigger='click'
              rootClose={true}
              placement='bottom'
              show={showLocationSelect}
              onToggle={show => setShowLocationSelect(show)}
              overlay={
                <Popover style={{ maxWidth: 500 }}>
                  <Popover.Body>
                    <div className='bg-white p-3' style={{ width: 400 }}>
                      <PlaceSelect selected={locationSelector} onSelect={setLocationSelector} />
                    </div>
                  </Popover.Body>
                </Popover>
              }
            >
              <div className='flex items-center ml-8 cursor-pointer'>
                <span
                  className='inline-block rounded-full z-10 bg-red-500 text-white'
                  style={{
                    padding: 5,
                  }}
                >
                  <MdLocationPin />
                </span>
                <span
                  className='bg-red-300'
                  style={{
                    paddingLeft: 15,
                    marginLeft: -12,
                    paddingRight: 12,
                    borderTopRightRadius: 12,
                    borderBottomRightRadius: 12,
                  }}
                >
                  {encodeLocationSelectorToSingleString(locationSelector)}
                </span>
              </div>
            </OverlayTrigger>
            <OverlayTrigger
              trigger='click'
              rootClose={true}
              placement='bottom'
              overlay={
                <Popover style={{ maxWidth: 600 }}>
                  <Popover.Body>
                    <div className='bg-white p-3' style={{ width: 500 }}>
                      <DateRangePicker
                        dateRangeSelector={dateRangeSelector}
                        onChangeDate={setDateRangeSelector}
                      />
                    </div>
                  </Popover.Body>
                </Popover>
              }
            >
              <div className='flex items-center ml-4 cursor-pointer'>
                <span
                  className='inline-block rounded-full z-10 bg-yellow-500 text-white'
                  style={{
                    padding: 5,
                  }}
                >
                  <MdCalendarToday />
                </span>
                <span
                  className='bg-yellow-300'
                  style={{
                    paddingLeft: 15,
                    marginLeft: -12,
                    paddingRight: 12,
                    borderTopRightRadius: 12,
                    borderBottomRightRadius: 12,
                  }}
                >
                  {formatDateRangeSelector(dateRangeSelector)}
                </span>
              </div>
            </OverlayTrigger>
            <div className='flex items-center ml-8 cursor-pointer' onClick={() => setShowCommandPanel(true)}>
              <span
                className='inline-block rounded-full z-10 bg-indigo-500 text-white'
                style={{
                  padding: 5,
                }}
              >
                <VscListTree />
              </span>
              <span
                className='bg-indigo-300'
                style={{
                  paddingLeft: 15,
                  marginLeft: -12,
                  paddingRight: 12,
                  borderTopRightRadius: 12,
                  borderBottomRightRadius: 12,
                }}
              >
                {params.pangoLineage}
              </span>
            </div>
            <div className='flex-grow-1' />
            {sizes.map(s => (
              <Button
                size='sm'
                variant='info'
                className='mx-1'
                disabled={size === s.id}
                onClick={() => setSize(s.id)}
                key={s.id}
              >
                {s.label}
              </Button>
            ))}
            <Button size='sm' className='mx-2' onClick={() => toggleFullscreen()}>
              [F]ullscreen
            </Button>
          </div>
          {/* The main area */}
          <div
            className={`h-6 ${
              isCursorOnParent ? 'bg-blue-500' : 'bg-gray-200'
            } hover:bg-blue-500 cursor-pointer flex justify-center text-2xl`}
            style={{ width: 'calc(100% - 30px)', marginTop: 15, marginLeft: 15, marginRight: 15 }}
            onClick={() => goToParentLineage()}
          >
            <IoReturnDownBackOutline />
          </div>
          <div className='flex-grow p-4' ref={ref}>
            {gridSizes && filteredSubLineages ? (
              <>
                <GridFigure gridSizes={gridSizes} labels={filteredSubLineages} onLabelClick={setPangoLineage}>
                  {filteredSubLineages.map((subLineage, i) => (
                    <GridContent key={subLineage} label={subLineage} highlighted={isCursorOnLineage(i)}>
                      <OutPortal node={portals.get(subLineage)!} />
                    </GridContent>
                  ))}
                  <GridXAxis portals={axisPortals.x} />
                  <GridYAxis portals={axisPortals.y} />
                </GridFigure>
              </>
            ) : (
              <Loader />
            )}
          </div>
        </div>
        {figureType === 'prevalence' && gridSizes && filteredSubLineages && (
          <SequencesOverTimeGrid
            selector={selector}
            plotWidth={gridSizes.plotWidth - 12}
            pangoLineage={params.pangoLineage}
            portals={portals}
            axisPortals={axisPortals}
          />
        )}
        {sequenceTypes.map(
          sequenceType =>
            figureType === `${sequenceType}-mutations` &&
            gridSizes &&
            filteredSubLineages && (
              <MutationsGrid
                key={sequenceType}
                selector={selector}
                pangoLineage={params.pangoLineage}
                subLineages={filteredSubLineages}
                plotWidth={gridSizes.plotWidth - 12}
                portals={portals}
                sequenceType={sequenceType}
              />
            )
        )}
        {figureType === 'growth-advantage' && gridSizes && filteredSubLineages && (
          <GrowthAdvantageGrid
            selector={selector}
            pangoLineage={params.pangoLineage}
            subLineages={filteredSubLineages}
            plotWidth={gridSizes.plotWidth - 12}
            portals={portals}
          />
        )}
      </div>
      <NewFocusPageCommandPanelModal
        show={showCommandPanel}
        handleClose={() => setShowCommandPanel(false)}
        pangoLineage={params.pangoLineage}
        setPangoLineage={setPangoLineage}
      />
      <AlmostFullscreenModal
        show={showVariantDetailsModal}
        handleClose={() => setShowVariantDetailsModal(false)}
      >
        {selectorsOfCursor && <FocusSinglePageContent selectors={selectorsOfCursor} />}
      </AlmostFullscreenModal>
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
