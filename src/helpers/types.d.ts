export interface DataDistributionConfiguration {
  country: Country;
  matchPercentage: number;
  mutations?: string[];
  variant?: string;
}

export interface Variant {
  mutations: string[];
  name: string;
}

export interface Mutation {}

export type Country = string;

export type Week = {
  firstDayInWeek: string;
  yearWeek: string;
};

// export type DistributionData = DistributionDataPoint[] | undefined;

type DistributionY = {
  count: number;
  proportion: {
    ciLower: number;
    ciUpper: number;
    confidenceLevel: number;
    value: number;
  };
};

export type VariantInternationalDistributionDataPoint = {
  x: {
    country: Country;
    week: Week;
  };
  y: DistributionY;
};

export type VariantTimeDistributionDataPoint = {
  x: Week;
  y: DistributionY;
};

export type VariantAgeDistributionDataPoint = {
  x: string;
  y: DistributionY;
};
