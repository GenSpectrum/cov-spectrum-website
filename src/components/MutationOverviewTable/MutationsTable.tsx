import { encodeLocationSelectorToSingleString, LocationSelector } from '../../data/LocationSelector';
import { mutationColumnsProperties } from '../../data/mutationsOnCollectionPageData';
import { addVariantSelectorToUrlSearchParams, VariantSelector } from '../../data/VariantSelector';
import { HashLink } from 'react-router-hash-link';
import { DateRangeSelector } from '../../data/DateRangeSelector';
import { dateRangeUrlFromSelector } from '../../data/DateRangeUrlEncoded';
import { SequenceType } from '../../data/SequenceType';
import { useBaselineMutationTableData, useMutationTableData } from './hooks';
import Loader from '../Loader';
import { MUTATIONS_HASH_LINK } from '../../pages/FocusSinglePage';

export type SingleMutationsTableProps = {
  variants: { query: VariantSelector; name: string; description: string }[];
  locationSelector: LocationSelector;
  mutationType: SequenceType;
  dateRangeSelector: DateRangeSelector;
};

type NameCellProps = {
  query: VariantSelector;
  locationSelector: LocationSelector;
  name: string;
  baseline: boolean;
  dateRangeSelector: DateRangeSelector;
};

const NameCell = ({ query, locationSelector, name, baseline, dateRangeSelector }: NameCellProps) => {
  const urlParams = new URLSearchParams();
  addVariantSelectorToUrlSearchParams(query, urlParams);

  const placeString = encodeLocationSelectorToSingleString(locationSelector);

  const suffix = baseline ? '&analysisMode=CompareEquals&' : `#${MUTATIONS_HASH_LINK}`;
  const targetUrl = `/explore/${encodeURIComponent(placeString)}/AllSamples/${dateRangeUrlFromSelector(
    dateRangeSelector
  )}/variants?${urlParams.toString()}${suffix}`;

  function scrollAfterWaiting(element: HTMLElement) {
    setTimeout(() => {
      element.scrollIntoView({ behavior: 'smooth' });
    }, 2000);
  }

  return (
    <div style={{ display: 'block' }}>
      <HashLink to={targetUrl} className='overflow-hidden' scroll={scrollAfterWaiting}>
        <button className='underline break-words overflow-hidden w-full'>{name}</button>
      </HashLink>
    </div>
  );
};

const columnNames: string[] = mutationColumnsProperties.map(item => item.label);

export const SingleMutationsTable = ({
  variants,
  locationSelector,
  mutationType,
  dateRangeSelector,
}: SingleMutationsTableProps) => {
  const mutationData = useMutationTableData(variants, locationSelector, dateRangeSelector, mutationType);

  if (!mutationData) {
    return <Loader />;
  }

  return (
    <>
      <div>
        The following table gives an overview of the mutations of the variants in this collection. For each
        variant, it shows the mutations that are present in more than 90% of the sequences, in 60-90% of the
        sequences, in 30-60% of the sequences, and in 5-30% of the sequences.
      </div>
      <table>
        <thead>
          <tr>
            <td>Name</td>
            {columnNames.map(name => (
              <td key={name}>{name}</td>
            ))}
          </tr>
        </thead>
        <tbody>
          {mutationData.map(item => (
            <tr key={item.name}>
              <td>
                <NameCell
                  query={item.query}
                  locationSelector={locationSelector}
                  name={item.name}
                  baseline={false}
                  dateRangeSelector={dateRangeSelector}
                />
              </td>
              {item.columns.map((column, i) => {
                return <td key={i}>{column}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

export type BaselineMutationsTableProps = {
  variants: { query: VariantSelector; name: string; description: string }[];
  mutationType: SequenceType;
  locationSelector: LocationSelector;
  baselineVariant: VariantSelector;
  dateRangeSelector: DateRangeSelector;
};

export const BaselineMutationsTable = ({
  variants,
  mutationType,
  locationSelector,
  baselineVariant,
  dateRangeSelector,
}: BaselineMutationsTableProps) => {
  const baselineMutationTableData = useBaselineMutationTableData(
    variants,
    locationSelector,
    dateRangeSelector,
    baselineVariant,
    mutationType
  );

  if (!baselineMutationTableData) {
    return <Loader />;
  }

  const headers: string[] = ['Additional', 'Missing'];

  return (
    <>
      <div>
        The following table compares the mutations of the variants in the collection to the nearly-fixed
        mutations of the baseline (which we define as those mutations that are present in over 90% of the
        sequences). The "additional" mutations are mutations of the variants that are not nearly-fixed in the
        baseline but present in over 90% of the sequences of the variant, in 60-90% of the sequences of the
        variant, etc. The "missing" mutations are nearly-fixed mutations of the baseline that are not present
        in over 90% of the sequences of the variant, not present in 60-90% of the sequences of the variant,
        etc.
      </div>
      <table data-testid='baseline-mutation-table'>
        <thead>
          <tr>
            <td></td>
            {headers.map(header => (
              <td key={header} colSpan={4}>
                {header}
              </td>
            ))}
          </tr>
          <tr>
            <td>Name</td>
            {columnNames.map((name, i) => (
              <td key={`${name}-${i}`}>{name}</td>
            ))}
            {columnNames.map((name, i) => (
              <td key={`${name}/${i}`}>{name}</td>
            ))}
          </tr>
        </thead>
        <tbody>
          {baselineMutationTableData.map(item => (
            <tr key={item.name}>
              <td>
                <NameCell
                  query={item.query}
                  locationSelector={locationSelector}
                  name={item.name}
                  baseline={true}
                  dateRangeSelector={dateRangeSelector}
                />
              </td>
              {item.additionalMutationColumns.map((additionalMutationColumn, i) => (
                <td key={`additional-${i}`}>{additionalMutationColumn}</td>
              ))}
              {item.missingMutationColumns.map((missingMutationColumn, i) => (
                <td key={`additional-${i}`}>{missingMutationColumn}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};
