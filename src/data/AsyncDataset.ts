export type AsyncDataset<Selector, Payload> = {
  readonly selector: Selector;
  payload: Payload | undefined;
  readonly status: AsyncStatus;
};

export type AsyncStatus = 'initial' | 'pending' | 'fulfilled' | 'rejected';

export enum AsyncStatusTypes {
  initial = 'initial',
  pending = 'pending',
  fulfilled = 'fulfilled',
  rejected = 'rejected',
}
