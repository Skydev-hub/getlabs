import { environment as env } from '@app/shared/environments';
import { EnvironmentInterface } from './environment.interface';

export const environment: EnvironmentInterface = {
  ...env, ...{
    hipaaTrainingDoc: 'docs/Getlabs-HIPAA-Training_11-10-2019.pdf',
    bbpTrainingDoc: 'docs/Getlabs-Bloodborne-Pathogens-Training_11-16-2019.pdf',

    // Stripe Publishable Key, see https://stripe.com/docs/stripe-js/reference#including-stripejs
    stripeKey: 'pk_live_LYoNbgmCvIbPx24ai1hejFap00MyPTZkJY',

    // HelloSign Client ID
    helloSignClientId: '',

    // Default timezone for the scheduler component, should one not be identifiable
    defaultTimezone: 'America/Phoenix',

    /* Must be located here for the moment, as there's a bug(?) in the pre-ivy compiler that effectively delays the completion of the
     * environment file swap until AFTER module decorators are invoked.  This must be removed once we migrate to angular 9+ / ivy.
     * See https://github.com/angular/angular-cli/issues/12190#issuecomment-616569687 for more information. */
    googleMapsKey: 'AIzaSyBNIf-NHxsBBWCsq1e7uHe2NpFPdQxhvYc',
  },
};
