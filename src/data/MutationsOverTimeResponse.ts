export type MutationsOverTimeDateRange = {
  dateFrom: string;
  dateTo: string;
};

export type MutationsOverTimeDataPoint = {
  count: number;
  coverage: number;
};

export type MutationsOverTimeResponse = {
  mutations: string[];
  dateRanges: MutationsOverTimeDateRange[];
  data: MutationsOverTimeDataPoint[][];
};
