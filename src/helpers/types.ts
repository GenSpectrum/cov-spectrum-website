import { Country } from '../services/api-types';

export interface DataDistributionConfiguration {
  country: Country;
  matchPercentage: number;
  mutations: string[];
  variant?: string;
}
