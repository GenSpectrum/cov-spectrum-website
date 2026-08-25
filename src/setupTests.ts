import '@testing-library/jest-dom/vitest';
import { beforeAll, vi } from 'vitest';
import setupDayjs from './helpers/dayjsSetup';
import { TextEncoder } from 'util';

setupDayjs();

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
(globalThis as any).jest = vi;
vi.mock('taxonium-component', () => ({
  default: () => null,
}));

globalThis.fetch = vi
  .fn()
  .mockImplementation((...args) =>
    Promise.reject(
      'Make sure to not issue api calls in unit tests, ' +
        "maybe you need to explicitly use the manual API mocks in your test (vi.mock('../../../data/api');)?" +
        ' Args were: ' +
        JSON.stringify(args)
    )
  );

globalThis.TextEncoder = TextEncoder;

const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

const expectedConsoleNoise = [
  /react-test-renderer is deprecated/,
  /not wrapped in act\(\.\.\.\)/,
  /The current testing environment is not configured to support act\(\.\.\.\)/,
  /MUI X: A component is changing the uncontrolled value of a picker to be controlled/,
  /^no data$/,
  /Make sure to not issue api calls in unit tests/,
  /The width\(800\) and height\(800\) are both fixed numbers/,
  /Cannot read properties of undefined \(reading 'valueOf'\)/,
  /The above error occurred in one of your React components/,
];

function shouldSuppressConsoleMessage(args: unknown[]) {
  const message = args
    .map(arg => {
      if (arg instanceof Error) {
        return `${arg.message}\n${arg.stack ?? ''}`;
      }
      return typeof arg === 'string' ? arg : JSON.stringify(arg);
    })
    .join(' ');

  return expectedConsoleNoise.some(pattern => pattern.test(message));
}

beforeAll(() => {
  vi.spyOn(console, 'error').mockImplementation((...args) => {
    if (!shouldSuppressConsoleMessage(args)) {
      originalConsoleError(...args);
    }
  });
  vi.spyOn(console, 'warn').mockImplementation((...args) => {
    if (!shouldSuppressConsoleMessage(args)) {
      originalConsoleWarn(...args);
    }
  });
});
