import { HostSelector } from './HostSelector';
import { sequenceDataSource } from '../helpers/sequence-data-source';
import { HUMAN } from './api-lapis';
import { SamplingStrategy } from './SamplingStrategy';
import { DateRangeUrlEncoded } from './DateRangeUrlEncoded';
import { AnalysisMode } from './AnalysisMode';

export const defaultDateRange: DateRangeUrlEncoded = 'Past6M';

export const defaultSamplingStrategy: SamplingStrategy = SamplingStrategy.AllSamples;

export const defaultAnalysisMode: AnalysisMode = AnalysisMode.Single;

// TODO Temporary fix (see https://github.com/GenSpectrum/cov-spectrum-website/issues/674)
export const defaultHost: HostSelector = sequenceDataSource === 'open' ? [] : [HUMAN];
