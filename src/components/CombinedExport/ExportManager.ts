import React from 'react';

export interface RegisteredExport {
  label: string;
  doExport: () => void;
}

export interface DeregistrationHandle {
  deregister(): void;
}

export interface ExportManager {
  register(label: string, doExport: () => void): DeregistrationHandle;
  getRegistered(): Set<RegisteredExport>;
}

export class NormalExportManager {
  private registered = new Set<RegisteredExport>();

  register(label: string, doExport: () => void): DeregistrationHandle {
    const registeredExport = { label, doExport };
    this.registered.add(registeredExport);
    return {
      deregister: () => {
        this.registered.delete(registeredExport);
      },
    };
  }

  getRegistered(): Set<RegisteredExport> {
    return this.registered;
  }
}

export class NoopExportManager {
  constructor(private warnOnUse: boolean) {}

  register(_label: string, _doExport: () => void): DeregistrationHandle {
    if (this.warnOnUse) {
      console.warn(
        `NoopExportManager.register called (label: ${_label}). Did you forget ExportManagerContext.Provider?`
      );
    }
    return { deregister() {} };
  }

  getRegistered(): Set<RegisteredExport> {
    if (this.warnOnUse) {
      console.warn(`NoopExportManager.getRegistered called. Did you forget ExportManagerContext.Provider?`);
    }
    return new Set();
  }
}

export const ExportManagerContext = React.createContext<ExportManager>(new NoopExportManager(true));
