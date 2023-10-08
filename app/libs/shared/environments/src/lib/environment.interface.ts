export interface EnvironmentInterface {
  // Switch app to production mode with minimal debugging and logging if true
  production: boolean;

  // Release version, generally the git commit hash (normally only available in production and taken from VERSION env var during compilation)
  version: string;

  // Base domains the app is allowed to run on (do not include sub-domains here such as app.getlabs.com, use getlabs.com instead)
  // The configuration service detects the longest matching domain and uses that as a base for generating URLs for things like API endpoints
  // and inter-app traversal links
  domains: string[];

  // Self-explanatory section
  recaptchaV3SiteKey: string;
  googleTagManagerId: string;
  googleMapsKey: string,
  sentryDsn: string,

  // The advertised price of the service in dollars (eg. 49.99)
  advertisedPrice: number;

  // If false all AB tests will show whichever test is set as the default
  enableABTesting: boolean;
}
