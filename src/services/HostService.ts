import { sequenceDataSource } from '../helpers/sequence-data-source';
import { fetchAllHosts } from '../data/api-lapis';

export class HostService {
  static human = sequenceDataSource === 'gisaid' ? 'Human' : 'Homo sapiens';

  static allHosts: Promise<string[]> = fetchAllHosts();
}
