export const env = {
  isTesting: !!process.env.REACT_APP_IS_TESTING,
  sentryDsn: process.env.REACT_APP_SENTRY_DSN,
  sentryEnvironment: process.env.REACT_APP_SENTRY_ENVIRONMENT ?? 'other',
};
