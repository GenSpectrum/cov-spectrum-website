export type PprettyRequest = {
  config: {
    plotName: string;
    plotType: 'line' | 'bar';
  };
  metadata: any;
  data: any;
};

export type PprettyFileFormat = 'png' | 'svg' | 'pdf';
export const pprettyFileFormats: PprettyFileFormat[] = ['png', 'svg', 'pdf'];
