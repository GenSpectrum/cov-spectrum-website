import { Country } from '../services/api-types';
import { getPangolinLineagesByDate, SamplingStrategy } from '../services/api';
import { useEffect, useState } from 'react';
import { Utils } from '../services/Utils';
import { globalDateCache, UnifiedIsoWeek } from '../helpers/date-cache';
import _ from 'lodash';

interface Props {
  country: Country;
  samplingStrategy: SamplingStrategy;
}

export const VariantOverviewPlot = ({ country, samplingStrategy }: Props) => {
  // Choose the initial set of variants:
  // Load the number of samples of all pango lineages through time.
  const [pangolinLineagesByWeek, setPangolinLineagesByWeek] = useState<
    Map<string, Map<UnifiedIsoWeek, number>> | undefined
  >(undefined);
  const [selectedPangolinLineages, setSelectedPangolinLineages] = useState<string[] | undefined>(undefined);

  // How many variants do we want to show at most?
  const numberInitialVariants = 10;

  useEffect(() => {
    getPangolinLineagesByDate({ country, samplingStrategy }).then(values => {
      // Idea 1:
      // 1. Calculate the proportion of the variants in each week
      // 2. Sum up the proportions for each variant
      // 3. Sort by the summed-up proportions and choose the top variants
      // ==> This way, we can maximize the overall covered area with a fixed number of variants without
      //     rollup variants.
      const values2 = values
        .filter(r => r.pangolinLineage)
        .map(r => ({
          ...r,
          pangolinLineage: r.pangolinLineage!,
          date: globalDateCache.getDay(r.date),
        }));
      const weekTotals = Utils.aggregateMap(
        Utils.groupBy(values2, r => r.date.isoWeek),
        xs => _.sumBy(xs, x => x.count)
      );
      const pangolinLineagesProportionsWeekMap = new Map<string, Map<UnifiedIsoWeek, number>>();
      const pangolinLineages = Utils.aggregateMap(
        Utils.groupBy(values2, r => r.pangolinLineage),
        xs => {
          const weekMap = Utils.aggregateMap(
            Utils.groupBy(xs, r => r.date.isoWeek),
            xxs => _.sumBy(xxs, x => x.count) / weekTotals.get(xxs[0].date.isoWeek)!
          );
          pangolinLineagesProportionsWeekMap.set(xs[0].pangolinLineage, weekMap);
          return _.sum([...weekMap.values()]);
        }
      );
      const pangolinLineageSortedProportions = [...pangolinLineages.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
      setSelectedPangolinLineages(pangolinLineageSortedProportions.map(x => x[0]));
      setPangolinLineagesByWeek(pangolinLineagesProportionsWeekMap);
    });
  }, [country, samplingStrategy]);

  // Idea 2: Can we improve idea 1 by rolling up variants?
  // - If idea 1 is already good enough (e.g., the vast majority of the area is covered throughout time),
  // there is no need to improve.
  // - Do we further want to try to keep the number of "visible" variants small?

  if (!pangolinLineagesByWeek || !selectedPangolinLineages) {
    return <>Loading...</>;
  }

  console.log(pangolinLineagesByWeek, selectedPangolinLineages);

  const plotData = [];
  for (let pl of selectedPangolinLineages) {
    pangolinLineagesByWeek.get(pl); // TODO
  }

  return <></>;
};
