export type LapisResponse<T> = {
  info: {
    apiVersion: number;
    dataVersion: number;
    deprecationDate: string;
    deprecationInfo: string;
  };
  errors: any[];
  data: T;
};
