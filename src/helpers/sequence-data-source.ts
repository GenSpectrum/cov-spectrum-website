export type SequenceDataSource = 'gisaid' | 'open';
function isSequenceDataSource(s: unknown): s is SequenceDataSource {
  return s === 'gisaid' || s === 'open';
}

export let sequenceDataSource: SequenceDataSource = 'gisaid'; // The default is gisaid
if (process.env.REACT_APP_SEQUENCE_DATA_SOURCE) {
  const _sequenceSource = process.env.REACT_APP_SEQUENCE_DATA_SOURCE.toLowerCase();
  if (!isSequenceDataSource(_sequenceSource)) {
    throw new Error('Unknown sequence data source: ' + _sequenceSource);
  }
  sequenceDataSource = _sequenceSource;
}
