import { Variant } from '../api-types';
import { LiteralSamplingStrategy } from '../api';

export type IntegrationSelector = {
  variant: Variant;
  matchPercentage: number;
  country: string | undefined | null;
  samplingStrategy: LiteralSamplingStrategy;
};

export interface Integration {
  name: string;
  isAvailable(selector: IntegrationSelector): boolean;
  open(selector: IntegrationSelector): void;
}
