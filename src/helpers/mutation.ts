import { SequenceType } from '../data/SequenceType';
import { sortNucMutationList } from './nuc-mutation';
import { sortAAMutationList } from './aa-mutation';

export const sortMutationList = (sequenceType: SequenceType, mutations: string[]): string[] => {
  if (sequenceType === 'aa') {
    return sortAAMutationList(mutations);
  } else {
    return sortNucMutationList(mutations);
  }
};
