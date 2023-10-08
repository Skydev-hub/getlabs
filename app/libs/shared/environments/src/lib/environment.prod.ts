import { EnvironmentInterface } from './environment.interface';

export const environment: EnvironmentInterface = {
  production: true,
  version: process.env.VERSION,
  domains: ['getlabs.com', 'staging.getlabs.io'],
  recaptchaV3SiteKey: '6LfaV9IUAAAAAJyuQALSGcE3khiVNt4l9QrsP0lC',
  googleTagManagerId: 'GTM-T7F9R8K',
  googleMapsKey: 'AIzaSyBNIf-NHxsBBWCsq1e7uHe2NpFPdQxhvYc',
  sentryDsn: 'https://9f00bd810e204af4b618ecf7c2e790e8@o415827.ingest.sentry.io/5307492',
  advertisedPrice: 29.00,
  enableABTesting: true,
};
