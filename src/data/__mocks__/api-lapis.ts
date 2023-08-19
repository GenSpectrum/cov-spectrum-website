import { NextcladeDatasetInfo } from '../NextcladeDatasetInfo';

export async function fetchAllHosts(): Promise<string[]> {
  return Promise.resolve(['mockHost']);
}

export async function fetchLapisDataVersion(): Promise<string> {
  return 'mockVersion';
}

export async function fetchNextcladeDatasetInfo(): Promise<NextcladeDatasetInfo> {
  return { name: 'mockName', tag: null };
}
