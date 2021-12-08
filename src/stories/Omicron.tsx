import React, { useEffect, useState } from 'react';
import { FixedDateRangeSelector } from '../data/DateRangeSelector';
import {
  CountryDateCountSampleData,
  CountryDateCountSampleDataset,
} from '../data/sample/CountryDateCountSampleDataset';
import { globalDateCache } from '../helpers/date-cache';
import { VariantInternationalComparisonMap } from '../widgets/VariantInternationalComparisonMap';
import { ExternalLink } from '../components/ExternalLink';
import { VariantInternationalComparisonChart } from '../widgets/VariantInternationalComparisonChart';
import { SamplingStrategy } from '../data/SamplingStrategy';

const UpdateBox = ({
  title,
  url,
  description,
  source,
}: {
  title: string;
  url: string;
  description?: string;
  source: string;
}) => {
  return (
    <ExternalLink url={url}>
      <div className='bg-yellow-100 rounded-xl shadow px-4 py-2 my-4 cursor-pointer text-black'>
        <h2 className='underline'>{title}</h2>
        {description && <p>{description}</p>}
        <p className='text-gray-500'>{source}</p>
      </div>
    </ExternalLink>
  );
};

const SectionTitle = ({ title }: { title: string }) => {
  return (
    <>
      <hr className='pt-4' />
      <h2>{title}</h2>
    </>
  );
};

enum STATUS {
  WARNING = 'red-100',
  DEFAULT = 'yellow-100',
  SECONDARY = 'gray-100',
}

const StatusBox = ({
  title,
  description,
  type = STATUS.DEFAULT,
}: {
  title: string;
  description?: string;
  type?: STATUS;
}) => {
  return (
    <div className={`bg-${type} rounded-xl px-4 py-2 my-4`}>
      <h2 className=''>{title}</h2>
      {description && <p>{description}</p>}
    </div>
  );
};

const Omicron = () => {
  const [variantSampleSet, setVariantSampleSet] = useState<CountryDateCountSampleDataset | null>(null);
  const [wholeSampleSet, setWholeSampleSet] = useState<CountryDateCountSampleDataset | null>(null);

  const FROM_DATE = '2021-10-24';

  useEffect(() => {
    CountryDateCountSampleData.fromApi({
      location: {},
      variant: {
        pangoLineage: 'B.1.1.529*',
      },
      dateRange: new FixedDateRangeSelector({
        dateFrom: globalDateCache.getDay(FROM_DATE),
        dateTo: globalDateCache.today(),
      }),
      samplingStrategy: SamplingStrategy.AllSamples,
    }).then(r => {
      setVariantSampleSet(r);
    });
    CountryDateCountSampleData.fromApi({
      location: {},
      dateRange: new FixedDateRangeSelector({
        dateFrom: globalDateCache.getDay(FROM_DATE),
        dateTo: globalDateCache.today(),
      }),
      samplingStrategy: SamplingStrategy.AllSamples,
    }).then(r => {
      setWholeSampleSet(r);
    });
  }, []);

  return (
    <div className='mx-auto max-w-5xl px-4 py-2'>
      <h1>Tracking Omicron (B.1.1.529)</h1>
      <StatusBox
        title='A new variant of concern'
        description='Omicron was declared as a variant of concern (VOC) by the WHO on 26 November 2021. Not much about this
        variant is known yet. The many mutations of the variant raise the concern that it may be
        more contagious and escape vaccines and previous infections more likely than the currently dominant Delta
        variant.'
        type={STATUS.WARNING}
      />

      <SectionTitle title='Global spread' />
      <StatusBox
        title='Cases detected in multiple countries'
        description='Omicron cases have been detected in multiple countries. The below map shows its spread
        across the globe.'
        type={STATUS.SECONDARY}
      />
      {variantSampleSet && wholeSampleSet && (
        <>
          {/*I deactivated the plot for now because the values are currently unreliable.*/}
          <h2>Omicron share of all sequences over time, international comparison</h2>
          <div className='w-full h-96 my-4 mb-10'>
            <VariantInternationalComparisonChart
              preSelectedCountries={[]}
              variantInternationalSampleSet={variantSampleSet}
              wholeInternationalSampleSet={wholeSampleSet}
              logScale={false}
            />
          </div>
          <h2>Omicron total cases by location</h2>
          {/* <div className='space-x-1 bg-white'>
            <button
              key={'label'}
              className={`border-t-2 border-l-2 border-r-2 bg-white w-auto px-4 text-center text-sm outline-none rounded-t transform translate-y-0.5`}
              onClick={_ => console.log('click')}
            >
              <h3>Total number of cases</h3>
            </button>
            <button
              key={'label'}
              className={`border-t-2 border-l-2 border-r-2 w-auto px-4 text-center text-sm outline-none rounded-t transform translate-y-0.5
              
            `}
              onClick={_ => console.log('click')}
            >
              <h3 className='text-gray-500'>Share of all cases</h3>
            </button>
          </div> */}
          <div className='w-full mb-4 mt-0 md:mb-32 border-2 rounded-tl-xl rounded-tr-xl rounded-br-xl rounded-bl-xl'>
            <VariantInternationalComparisonMap
              variantInternationalSampleSet={variantSampleSet}
              wholeInternationalSampleSet={wholeSampleSet}
              withTimeline={false}
            />
          </div>
        </>
      )}

      <h2>Region pages</h2>
      <div className='flex flex-row flex-wrap justify-between mt-3 mb-10'>
        {['World', 'Africa', 'Europe', 'Asia', 'North America', 'South America', 'Oceania'].map(place => (
          <div className='mx-5'>
            <ExternalLink
              url={`/explore/${place}/AllSamples/AllTimes/variants?pangoLineage=B.1.1.529*`}
              newWindow={false}
            >
              {place}
            </ExternalLink>
          </div>
        ))}
      </div>

      <SectionTitle title='Resources' />
      <UpdateBox
        title='Classification of Omicron (B.1.1.529): SARS-CoV-2 Variant of Concern'
        url='https://www.who.int/news/item/26-11-2021-classification-of-omicron-(b.1.1.529)-sars-cov-2-variant-of-concern'
        source='World Health Organization'
      />
      <UpdateBox
        title='Nextstrain global build'
        url='https://nextstrain.org/ncov/gisaid/global'
        source='Nextstrain'
      />
    </div>
  );
};

export default Omicron;
