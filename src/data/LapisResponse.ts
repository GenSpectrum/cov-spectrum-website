export type LapisInformation = {
  apiVersion: number;
  dataVersion: number;
  deprecationDate: string;
  deprecationInfo: string;
};

export type LapisResponse<T> = {
  info: LapisInformation;
  errors: any[];
  data: T;
};
