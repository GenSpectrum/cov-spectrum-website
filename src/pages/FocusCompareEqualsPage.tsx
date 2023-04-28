import { useExploreUrl } from '../helpers/explore-url';
import {
  useMultipleSelectorsFromExploreUrl,
  useSingleSelectorsFromExploreUrl,
} from '../helpers/selectors-from-explore-url-hook';
import React, { useState } from 'react';
import { formatVariantDisplayName } from '../data/VariantSelector';
import { GridCell, PackedGrid } from '../components/PackedGrid';
import { useQuery } from '../helpers/query-hook';
import { DateCountSampleData } from '../data/sample/DateCountSampleDataset';
import { MultiVariantTimeDistributionLineChart } from '../widgets/MultiVariantTimeDistributionLineChart';
import { NamedCard } from '../components/NamedCard';
import { AnalysisMode } from '../data/AnalysisMode';
import { VariantMutationComparison } from '../components/VariantMutationComparison';
import { FullSampleAggEntry, FullSampleAggEntryField } from '../data/sample/FullSampleAggEntry';
import { _fetchAggSamples } from '../data/api-lapis';
import { Utils } from '../services/Utils';
import { useDeepCompareMemo } from '../helpers/deep-compare-hooks';
import { DivisionModal } from '../components/DivisionModal';
import { createDivisionBreakdownButton } from './FocusSinglePage';

import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { SvgVennDiagram } from '../components/SvgVennDiagram';
import { NucleotideEntropyMultiChart } from '../components/NucleotideEntropy/NucleotideEntropyMultiChart';
import { ErrorAlert } from '../components/ErrorAlert';
import { WidgetWrapper } from '../components/WidgetWrapper';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography component='span'>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    'id': `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export const FocusCompareEqualsPage = () => {
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const exploreUrl = useExploreUrl()!;
  const [showVariantTimeDistributionDivGrid, setShowVariantTimeDistributionDivGrid] = useState(false);

  const { ldvsSelectors } = useMultipleSelectorsFromExploreUrl(exploreUrl);
  const { ldsSelector } = useSingleSelectorsFromExploreUrl(exploreUrl);
  const variantDateCounts = useQuery(
    signal =>
      Promise.all(ldvsSelectors.map(ldvsSelector => DateCountSampleData.fromApi(ldvsSelector, signal))),
    [ldvsSelectors]
  );
  const wholeDateCountWithDateFilter = useQuery(
    signal => DateCountSampleData.fromApi(ldsSelector, signal),
    [ldsSelector]
  );

  // --- Prepare data for sub-division plots ---
  const splitField = !exploreUrl?.location.country ? 'country' : 'division';
  const generateSplitData = (splitField: 'division' | 'country', plotField: FullSampleAggEntryField) => {
    return {
      // Note: The typings are not entirely correct. The data entries only contain splitField, plotField and count.
      getData: (signal: AbortSignal) =>
        Promise.all([
          _fetchAggSamples(ldsSelector, [splitField, plotField], signal), // whole
          ...ldvsSelectors.map(ldvsSelector =>
            _fetchAggSamples(ldvsSelector, [splitField, plotField], signal)
          ), // variant
        ]),
      splitData: (data: FullSampleAggEntry[][]) => {
        const [wholeData, ...variantDatasets] = data;
        const variantDivisionMaps: Map<string, any[]>[] = [];
        variantDatasets.forEach(variantData => {
          const variantDivisionMap = new Map<string, any[]>();
          variantDivisionMaps.push(variantDivisionMap);
          [...Utils.groupBy(variantData, d => d[splitField]).entries()].forEach(([division, data]) => {
            variantDivisionMap.set(
              division ?? 'Unknown',
              data.map(d => ({
                [plotField]: d[plotField],
                count: d.count,
              }))
            );
          });
        });
        return [...Utils.groupBy(wholeData, d => d[splitField]).entries()]
          .sort((a, b) => (a[0] ?? 'zzz').localeCompare(b[0] ?? 'zzz'))
          .map(([division, data]) => ({
            division: division ?? 'Unknown',
            data: {
              variant: variantDivisionMaps.map((variantDivisionMap, i) => ({
                selector: {
                  ...ldvsSelectors[i],
                  location: {
                    ...ldvsSelectors[i].location,
                    [splitField]: division,
                  },
                },
                payload: variantDivisionMap.get(division ?? 'Unknown') ?? [],
              })),
              whole: {
                selector: {
                  ...ldsSelector,
                  location: {
                    ...ldsSelector.location,
                    [splitField]: division,
                  },
                },
                payload: data.map(d => ({
                  [plotField]: d[plotField],
                  count: d.count,
                })) as FullSampleAggEntry[],
              },
            },
          }));
      },
    };
  };

  const splitSequencesOverTime = useDeepCompareMemo(
    () => generateSplitData(splitField, 'date'),
    [splitField, ldvsSelectors, ldsSelector]
  );

  // --- Rendering ---

  // Error handling
  const allErrors = [variantDateCounts.error, wholeDateCountWithDateFilter.error].filter(
    e => !!e
  ) as string[];
  if (allErrors.length > 0) {
    return <ErrorAlert messages={allErrors} />;
  }

  return (
    <>
      {/* Code similar to VariantHeader */}
      <div className='pt-10 lg:pt-0 ml-1 md:ml-3 w-full relative'>
        <div className='flex'>
          <div className='flex-grow flex flex-row flex-wrap items-end'>
            <h1 className='md:mr-2'>
              Comparing {exploreUrl.variants?.map(s => formatVariantDisplayName(s)).join(' vs. ')}
            </h1>
          </div>
        </div>
      </div>
      {/* Main content */}
      <div>
        <PackedGrid maxColumns={2}>
          {variantDateCounts.data && wholeDateCountWithDateFilter.data && (
            <GridCell minWidth={600}>
              {/* HACK(by Chaoran): This is to add an "Export" button without actually implementing a Widget. */}
              <WidgetWrapper
                getShareUrl={async () => ''}
                title={'Sequences over time'}
                toolbarChildren={[
                  createDivisionBreakdownButton('SequencesOverTime', setShowVariantTimeDistributionDivGrid),
                ]}
                height={300}
              >
                <MultiVariantTimeDistributionLineChart
                  variantSampleSets={variantDateCounts.data}
                  wholeSampleSet={wholeDateCountWithDateFilter.data}
                  analysisMode={AnalysisMode.CompareEquals}
                />
              </WidgetWrapper>

              {ldvsSelectors.length === 2 ? (
                <NamedCard title='Nucleotide mutations'>
                  <SvgVennDiagram
                    selectors={ldvsSelectors}
                    domain='nuc'
                    numberOfvariants={ldvsSelectors.length}
                  />
                </NamedCard>
              ) : ldvsSelectors.length === 3 ? (
                <NamedCard title='Nucleotide mutations'>
                  <SvgVennDiagram
                    selectors={ldvsSelectors}
                    domain='nuc'
                    numberOfvariants={ldvsSelectors.length}
                  />
                </NamedCard>
              ) : ldvsSelectors.length === 4 ? (
                <NamedCard title='Nucleotide mutations'>
                  <SvgVennDiagram
                    selectors={ldvsSelectors}
                    domain='nuc'
                    numberOfvariants={ldvsSelectors.length}
                  />
                </NamedCard>
              ) : (
                ''
              )}
            </GridCell>
          )}
          {ldvsSelectors.length === 2 ? (
            <GridCell minWidth={600}>
              <NamedCard title='Amino acid changes'>
                <Box sx={{ width: '100%' }}>
                  <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs
                      value={value}
                      onChange={handleChange}
                      aria-label='basic tabs example'
                      centered
                      variant='fullWidth'
                    >
                      <Tab label='Chart' {...a11yProps(0)} style={{ borderStyle: 'none' }} />
                      <Tab label='Table' {...a11yProps(1)} style={{ borderStyle: 'none' }} />
                    </Tabs>
                  </Box>
                  <TabPanel value={value} index={0}>
                    <SvgVennDiagram
                      selectors={ldvsSelectors}
                      domain='aa'
                      numberOfvariants={ldvsSelectors.length}
                    />
                  </TabPanel>
                  <TabPanel value={value} index={1}>
                    <VariantMutationComparison selectors={ldvsSelectors} />
                  </TabPanel>
                </Box>
              </NamedCard>
            </GridCell>
          ) : ldvsSelectors.length === 3 ? (
            <GridCell minWidth={600}>
              <NamedCard title='Amino acid changes'>
                <SvgVennDiagram
                  selectors={ldvsSelectors}
                  domain='aa'
                  numberOfvariants={ldvsSelectors.length}
                />
              </NamedCard>
            </GridCell>
          ) : ldvsSelectors.length === 4 ? (
            <GridCell minWidth={600}>
              <NamedCard title='Amino acid changes'>
                <SvgVennDiagram
                  selectors={ldvsSelectors}
                  domain='aa'
                  numberOfvariants={ldvsSelectors.length}
                />
              </NamedCard>
            </GridCell>
          ) : (
            ''
          )}
          <GridCell>
            <NamedCard title='Nucleotide Entropy'>
              <NucleotideEntropyMultiChart
                selectors={ldvsSelectors}
                />
            </NamedCard>
          </GridCell>
        </PackedGrid>
      </div>

      {/* The division breakdown plots */}
      {showVariantTimeDistributionDivGrid && (
        <DivisionModal
          getData={splitSequencesOverTime.getData}
          splitData={splitSequencesOverTime.splitData}
          generate={(division, d) => (
            <NamedCard title={division}>
              <div style={{ height: '300px' }}>
                <MultiVariantTimeDistributionLineChart
                  variantSampleSets={d.variant}
                  wholeSampleSet={d.whole}
                  analysisMode={AnalysisMode.CompareEquals}
                />
              </div>
            </NamedCard>
          )}
          show={showVariantTimeDistributionDivGrid}
          handleClose={() => setShowVariantTimeDistributionDivGrid(false)}
          header='Sequences over time'
        />
      )}
    </>
  );
};
