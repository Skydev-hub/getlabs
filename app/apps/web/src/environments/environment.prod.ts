import { environment as env } from '@app/shared/environments';
import { EnvironmentInterface } from './environment.interface';

export const environment: EnvironmentInterface = {
  ...env, ...{
    // Add getlabs-web specific vars here
  },

  /* Must be located here for the moment, as there's a bug(?) in the pre-ivy compiler that effectively delays the completion of the
   * environment file swap until AFTER module decorators are invoked.  This must be removed once we migrate to angular 9+ / ivy.
   * See https://github.com/angular/angular-cli/issues/12190#issuecomment-616569687 for more information. */
  googleMapsKey: "AIzaSyBNIf-NHxsBBWCsq1e7uHe2NpFPdQxhvYc",
};
