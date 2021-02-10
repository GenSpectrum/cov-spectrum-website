export interface DataDistributionConfiguration {
  country: string;
  matchPercentage: number;
  mutations?: string[];
  variant?: string;
}

export interface Variant {
  mutations: string[];
  name: string;
}

export type Country = string;
