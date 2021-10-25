export interface Dataset<Selector, Payload> {
  getSelector(): Selector;

  getPayload(): Payload;
}
