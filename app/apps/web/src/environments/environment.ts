import { environment as env } from '@app/shared/environments';
import { EnvironmentInterface } from './environment.interface';

export const environment: EnvironmentInterface = {
  ...env, ...{
    // Add getlabs-web specific vars here
  },
};
