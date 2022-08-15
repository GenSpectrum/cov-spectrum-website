export const CSVstringify = (data: any[]) => {
  const replacer = (key: any, value: any) => (value === null || value === undefined ? '' : value);
  const header = Object.keys(data[0]);
  const csv = [
    header.join(','),
    ...data.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(',')),
  ].join('\r\n');

  return csv;
};
