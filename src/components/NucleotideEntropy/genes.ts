import jsonRefData from '../../data/refData.json';

export const genes = jsonRefData.genes.concat({
  name: 'All',
  startPosition: 0,
  endPosition: 29903,
  aaSeq: '',
});
