import { fetchAllHosts } from '../data/api-lapis';

export class HostService {
  static allHosts: Promise<string[]> = fetchAllHosts();
}
