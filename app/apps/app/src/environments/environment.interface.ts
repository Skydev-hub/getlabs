import { EnvironmentInterface as BaseEnvironmentInterface } from '@app/shared/environments';

export interface EnvironmentInterface extends BaseEnvironmentInterface {
  hipaaTrainingDoc: string;
  bbpTrainingDoc: string;
  stripeKey: string;
  helloSignClientId: string;
  defaultTimezone: string;
}
