/**
 * In a PromiseQueue, only one promise will be evaluated at the same time. If one promise gets rejected, all subsequent
 * promises will be rejected as well.
 */
export class PromiseQueue {
  private prev: Promise<any> | undefined = undefined;

  async addTask<T>(task: () => Promise<T>): Promise<T> {
    while (this.prev !== undefined) {
      await this.prev;
    }
    this.prev = task();
    const result = await this.prev;
    this.prev = undefined;
    return result;
  }
}
