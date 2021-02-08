/**
 * This is a very simple wrapper for a fetch request that makes cancellations easier. If a request is aborted,
 * it ensures that subsequent promise handlers will not be called.
 */
export class CancelableRequest {
  static cancelableFetch(resource, init) {
    if (!init) {
      init = {};
    }

    const controller = new AbortController();
    init.signal = controller.signal;

    const request = new CancelableRequest();
    request._promise = fetch(resource, init);
    request._isCanceled = false;
    request._controller = controller;
    return request;
  }

  /**
   * @private
   */
  constructor() {
    /** @type {Promise<Response>} */
    this._promise = undefined;

    this._isCanceled = undefined;

    this._controller = undefined;
  }

  /**
   *
   * @param resolve
   * @return {Promise<*>}
   */
  then(resolve) {
    return this._promise.then(x => {
      if (!this._isCanceled) {
        return resolve(x);
      }
    });
  }

  /**
   *
   * @param reject
   * @return {Promise<unknown>}
   */
  catch(reject) {
    return this._promise.catch(err => {
      if (!this._isCanceled) {
        return reject(err);
      }
    });
  }

  cancel() {
    this._controller.abort();
    this._isCanceled = true;
  }
}
