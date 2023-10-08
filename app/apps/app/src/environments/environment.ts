import { environment as env } from '@app/shared/environments';
/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
import 'zone.js/plugins/zone-error'; // Included with Angular CLI.
import { EnvironmentInterface } from './environment.interface';

export const environment: EnvironmentInterface = {
  ...env, ...{
    hipaaTrainingDoc: 'docs/Getlabs-HIPAA-Training_11-10-2019.pdf',
    bbpTrainingDoc: 'docs/Getlabs-Bloodborne-Pathogens-Training_11-16-2019.pdf',

    // Stripe Publishable Key, see https://stripe.com/docs/stripe-js/reference#including-stripejs
    stripeKey: 'pk_test_W4NDy3ANRtIwxDo4AA9iMvso00ZcUgo7LR',

    // HelloSign Client ID
    helloSignClientId: '07efaf1827ef54e3de9b8811a50ab989',

    // Default timezone for the scheduler component, should one not be identifiable
    defaultTimezone: 'America/Phoenix',
  },
};


