import { CouponEntity } from '@app/ui';

export class AppliedCouponDto {
  paymentIntent: stripe.paymentIntents.PaymentIntent;
  coupon: CouponEntity;
}
