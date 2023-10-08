import { AnalyticsEventDto } from '../models/analytics.dto';

/**
 * Defines the data that describes the PaymentRemittedEvent
 */
export interface PaymentRemittedEventData {
  amount: number;
}

/**
 * Defines an analytics event that describes a payment remission action.
 */
export class PaymentRemittedEvent extends AnalyticsEventDto {
  private static readonly eventName = 'PaymentRemitted';

  constructor(amount: number) {
    super(PaymentRemittedEvent.eventName, { amount });
  }
}
