/**
 * In a PromiseQueue, only one promise will be evaluated at the same time. If one promise gets rejected, all subsequent
 * promises will be rejected as well.
 */
export class PromiseQueue {
  private blocker: Promise<any> | undefined = undefined;
  private blockerResolve: ((value: any) => void) | undefined = undefined;

  private running = 0;

  constructor(private parallelLimit: number) {
    if (parallelLimit < 1) {
      throw new Error('parallelLimit may not be below 1.');
    }
  }

  async addTask<T>(task: () => Promise<T>): Promise<T> {
    while (this.running >= this.parallelLimit) {
      await this.blocker;
    }
    this.running++;
    this.blocker = new Promise(resolve => (this.blockerResolve = resolve));
    try {
      return await task();
    } catch (e) {
      throw e;
    } finally {
      this.running--;
      this.blockerResolve!(undefined);
    }
  }
}

export function promiseAllSettledQueued<T>(promiseSuppliers: (() => Promise<T>)[], batchSize: number) {
  const promiseQueue = new PromiseQueue(batchSize);
  return Promise.allSettled(
    promiseSuppliers.map(promiseSupplier => promiseQueue.addTask(() => promiseSupplier()))
  );
}
