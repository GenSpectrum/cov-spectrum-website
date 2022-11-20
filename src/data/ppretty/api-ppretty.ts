import { PprettyFileFormat, PprettyRequest } from './ppretty-request';

const HOST = process.env.REACT_APP_PPRETTY_HOST;
const saveEndpoint = HOST + '/save';
const getEndpoint = HOST + '/get';

export const getPlotUrl = async (req: PprettyRequest, format: PprettyFileFormat): Promise<string> => {
  const requestStr = JSON.stringify(req);
  const requestHash = await hashRequest(requestStr);
  const plotPath = `${requestHash.substring(0, 2)}/${requestHash.substring(2, 4)}/${requestHash}.${format}`;

  // Check if the plot was already generated
  if (!(await checkIfPlotExists(plotPath))) {
    // Trigger the generation of the plot
    const saveResponseData = await generatePlot(requestStr);
    const saveResponseUrl = `${saveResponseData.path}.${format}`;
    if (saveResponseUrl !== plotPath) {
      throw new Error(
        'Unexpected error: ppretty returned the path "' +
          saveResponseUrl +
          '", but "' +
          plotPath +
          '" was expected.'
      );
    }
  }

  return getEndpoint + '/' + plotPath;
};

/**
 * Send a HEAD request to <$getEndpoint + path> to check whether the plot exists
 */
const checkIfPlotExists = async (path: string): Promise<boolean> => {
  const url = getEndpoint + '/' + path;
  const res = await fetch(url, { method: 'HEAD' });
  return res.ok;
};

const generatePlot = async (requestStr: string): Promise<{ path: string }> => {
  const res = await fetch(saveEndpoint, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: requestStr,
  });
  if (!res.ok) {
    throw new Error('Error generating ppretty plot');
  }
  return (await res.json()) as { path: string };
};

const hashRequest = async (str: string): Promise<string> => {
  const textAsBuffer = new TextEncoder().encode(str);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', textAsBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};
