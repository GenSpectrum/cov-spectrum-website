export type LapisInformation = {
  apiVersion: number | undefined;
  dataVersion: number;
  deprecationDate: string | undefined;
  deprecationInfo: string | undefined;
};

export type LapisResponse<T> = {
  info: LapisInformation;
  errors?: any[];
  data: T;
};
