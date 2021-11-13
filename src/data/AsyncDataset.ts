export class AsyncDataset<Selector, Payload> {
  constructor(
    public readonly selector: Selector,
    public readonly payload: Payload | undefined,
    public readonly status: 'initial' | 'pending' | 'fulfilled' | 'rejected'
  ) {}
}
