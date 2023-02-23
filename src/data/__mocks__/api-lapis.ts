import { NextcladeDatasetInfo } from '../NextcladeDatasetInfo';

export async function fetchAllHosts(): Promise<string[]> {
  return Promise.resolve(['mockHost']);
}

export function getCurrentLapisDataVersionDate(): Date | undefined {
  return undefined;
}

export async function fetchNextcladeDatasetInfo(): Promise<NextcladeDatasetInfo> {
  return { name: 'mockName', tag: null };
}
