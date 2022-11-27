import React from 'react';
import { PprettyRequest } from '../../data/ppretty/ppretty-request';

export interface DeregistrationHandle {
  deregister(): void;
}

/**
 * This class collects data from multiple plots in order to create a grid of plots with ppretty.
 */
export class PprettyGridExportManager {
  private registered = new Set<PprettyRequest>();

  constructor(private mergePprettyRequests: (requests: PprettyRequest[]) => PprettyRequest) {}

  register(data: PprettyRequest): DeregistrationHandle {
    this.registered.add(data);
    return {
      deregister: () => {
        this.registered.delete(data);
      },
    };
  }

  getMergedRequest(): PprettyRequest | null {
    if (this.registered.size === 0) {
      return null;
    }
    return this.mergePprettyRequests([...this.registered]);
  }
}

export const PprettyGridExportManagerContext = React.createContext(
  new PprettyGridExportManager(() => {
    throw new Error('Please create an own PprettyGridExportManager instead of using the default context.');
  })
);
