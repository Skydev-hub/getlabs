import { EnvironmentInterface } from './environment.interface';

export const environment: EnvironmentInterface = {
  production: false,
  version: undefined,
  domains: ['getlabs.io'],
  recaptchaV3SiteKey: "6LcUVtIUAAAAADuZ8iIcDlD9PAMr99A6wNUzTIsP",
  googleTagManagerId: 'GTM-5Q7XVFG',
  googleMapsKey: 'AIzaSyCwMxB7-f9D8l49fDHfxZFJada8tLIX16E',
  sentryDsn: '',
  advertisedPrice: 29.00,
  enableABTesting: false,
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
import 'zone.js/plugins/zone-error'; // Included with Angular CLI.
