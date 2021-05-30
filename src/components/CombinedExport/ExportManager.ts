import React from 'react';

export interface RegisteredExport {
  label: string;
  doExport: () => void;
}

export interface DeregistrationHandle {
  deregister(): void;
}

export class ExportManager {
  private registered = new Set<RegisteredExport>();

  constructor(private warnOnUse: boolean = false) {}

  register(label: string, doExport: () => void): DeregistrationHandle {
    if (this.warnOnUse) {
      console.warn(
        `register(label: ${label}) called on ExportManager with warnOnUse. Did you forget ExportManagerContext.Provider?`
      );
    }

    const registeredExport = { label, doExport };
    this.registered.add(registeredExport);
    return {
      deregister: () => {
        this.registered.delete(registeredExport);
      },
    };
  }

  getRegistered(): Set<RegisteredExport> {
    if (this.warnOnUse) {
      console.warn(
        `getRegistered() called on ExportManager with warnOnUse. Did you forget ExportManagerContext.Provider?`
      );
    }

    return this.registered;
  }
}

export const ExportManagerContext = React.createContext(new ExportManager(true));
