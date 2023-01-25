import { ExternalLink } from './ExternalLink';
import React, { useCallback, useState } from 'react';
import { qcFieldsAndLabels, QcFieldType, QcSelector } from '../data/QcSelector';
import { Utils } from '../services/Utils';
import { Button, ButtonVariant } from '../helpers/ui';
import { useExploreUrl } from '../helpers/explore-url';
import Select from 'react-select';
import { HostSelector } from '../data/HostSelector';
import { HostService } from '../services/HostService';
import { useQuery } from '../helpers/query-hook';
import Loader from './Loader';
import { HUMAN } from '../data/api-lapis';
import DateRangePicker from '../components/DateRangePicker';
import {
  DateRangeSelector,
  defaultSubmissionDateRangeSelector,
  SpecialDateRangeSelector,
} from '../data/DateRangeSelector';

type Props = {
  onClose: () => void;
};

const toSelectOption = (s: string) => ({ label: s, value: s });

export const AdvancedFiltersPanel = ({ onClose }: Props) => {
  const { setHostAndQc, host: initialHost, qc: initialQc } = useExploreUrl() ?? {};
  const [host, setHost] = useState<HostSelector>(initialHost ?? []);
  const [qcSelector, setQcSelector] = useState<QcSelector>(initialQc ?? {});

  const [submissionDateRangeSelector, setSubmissionDateRangeSelector] = useState<DateRangeSelector>(
    new SpecialDateRangeSelector('AllTimes')
  );

  const save = useCallback(() => {
    if (!setHostAndQc) {
      return;
    }
    setHostAndQc(host, qcSelector, submissionDateRangeSelector);

    onClose();
  }, [host, qcSelector, setHostAndQc, onClose, submissionDateRangeSelector]);

  const onChangeDate = (dateRangeSelector: DateRangeSelector) => {
    setSubmissionDateRangeSelector(dateRangeSelector);
  };

  return (
    <>
      <Host setHost={setHost} host={host} />
      <div className='mt-4 mb-4'>
        <h2>Submission date</h2>

        <DateRangePicker dateRangeSelector={submissionDateRangeSelector} onChangeDate={onChangeDate} />
        <Button
          variant={ButtonVariant.SECONDARY}
          className='w-25 mt-4'
          onClick={() => setSubmissionDateRangeSelector(defaultSubmissionDateRangeSelector)}
        >
          Clear filter
        </Button>
      </div>
      <SequenceQuality setQcSelector={setQcSelector} qcSelector={qcSelector} />
      <Button variant={ButtonVariant.SECONDARY} className='w-full mt-2' onClick={save}>
        Save
      </Button>
    </>
  );
};

function Host(props: { setHost: (host: string[]) => void; host: string[] }) {
  const { data: allHosts } = useQuery(
    () => HostService.allHosts.then(hs => hs.sort((a, b) => a.localeCompare(b))),
    []
  );

  const changeHostSelect = useCallback((selected: ReadonlyArray<{ label: string; value: string }>) => {
    props.setHost(selected.map(option => option.value));
  }, []);

  if (!allHosts) {
    return (
      <>
        <h2>Hosts</h2>
        <div style={{ height: 200 }}>
          <Loader />
        </div>
      </>
    );
  }

  return (
    <>
      <h2>Hosts</h2>
      <button className='underline cursor-pointer mr-2' onClick={() => props.setHost(allHosts)}>
        Select all
      </button>
      {' | '}
      <button className='underline cursor-pointer ml-2' onClick={() => props.setHost([HUMAN])}>
        Select human
      </button>
      {' | '}
      <button
        className='underline cursor-pointer ml-2'
        onClick={() => props.setHost(allHosts.filter(h => h !== HUMAN))}
      >
        Select non-human
      </button>
      <Select
        isMulti
        closeMenuOnSelect={false}
        options={allHosts.map(toSelectOption)}
        value={props.host.map(toSelectOption)}
        placeholder='Select hosts...'
        onChange={changeHostSelect}
        className='mt-2'
      />
      <div className='mt-2'>By default, only sequences obtained from human hosts are used.</div>
    </>
  );
}

function SequenceQuality(props: {
  setQcSelector: React.Dispatch<React.SetStateAction<QcSelector>>;
  qcSelector: QcSelector;
}) {
  const setQcValue = useCallback(
    (field, type: QcFieldType, valueString?: string) => {
      props.setQcSelector(prev => ({
        ...prev,
        [field]: type === 'integer' ? Utils.safeParseInt(valueString) : Utils.safeParseFloat(valueString),
      }));
    },
    [props.setQcSelector]
  );

  return (
    <>
      <h2>Sequence quality</h2>
      Here, you can filter the sequences by the QC (quality control) metrics calculated by{' '}
      <ExternalLink url='https://clades.nextstrain.org/'>Nextclade</ExternalLink>. In general, 0 to 29 is
      considered as good, 30 to 99 is mediocre, and over 100 is bad. For more information, please check out{' '}
      <ExternalLink url='https://docs.nextstrain.org/projects/nextclade/en/latest/user/algorithm/07-quality-control.html'>
        Nextclade's documentation
      </ExternalLink>
      .
      <div>
        <button className='underline cursor-pointer mr-2' onClick={() => props.setQcSelector({})}>
          Select all
        </button>
        {' | '}
        <button
          className='underline cursor-pointer mr-2'
          onClick={() => props.setQcSelector({ nextcladeQcOverallScoreTo: 29 })}
        >
          Select good
        </button>
        {' | '}
        <button
          className='underline cursor-pointer mr-2'
          onClick={() => props.setQcSelector({ nextcladeQcOverallScoreTo: 99 })}
        >
          Select good and mediocre
        </button>
        {' | '}
        <button
          className='underline cursor-pointer mr-2'
          onClick={() => props.setQcSelector({ nextcladeQcOverallScoreFrom: 100 })}
        >
          Select only bad
        </button>
      </div>
      {qcFieldsAndLabels.map(({ label, fromField, toField, type }) => (
        <div className='py-2' key={label}>
          {label}:{' '}
          <input
            className='border w-24'
            type='number'
            value={props.qcSelector[fromField] ?? ''}
            onChange={e => setQcValue(fromField, type, e.target.value)}
          />{' '}
          -{' '}
          <input
            className='border w-24'
            type='number'
            value={props.qcSelector[toField] ?? ''}
            onChange={e => setQcValue(toField, type, e.target.value)}
          />
        </div>
      ))}
    </>
  );
}
