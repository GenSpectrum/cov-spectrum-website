import { HostSelector } from './HostSelector';
import { HUMAN } from './api-lapis';
import { SamplingStrategy } from './SamplingStrategy';
import { DateRangeUrlEncoded } from './DateRangeUrlEncoded';
import { AnalysisMode } from './AnalysisMode';

export const defaultDateRange: DateRangeUrlEncoded = 'Past6M';

export const defaultSamplingStrategy: SamplingStrategy = SamplingStrategy.AllSamples;

export const defaultAnalysisMode: AnalysisMode = AnalysisMode.Single;

export const defaultHost: HostSelector = [HUMAN];
