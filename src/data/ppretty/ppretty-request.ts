export type PprettyRequest = {
  config: {
    plotName: string;
    plotType: 'line' | 'bar';
    dataSource?: string;
    sizeMultiplier?: number;
    sizeRatio?: number;
  };
  metadata: any;
  data: any;
};

export type PprettyFileFormat = 'png' | 'svg' | 'pdf';
export const pprettyFileFormats: PprettyFileFormat[] = ['png', 'svg', 'pdf'];
