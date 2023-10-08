import { CouponEntity } from '@app/ui';
import PaymentIntent = stripe.paymentIntents.PaymentIntent;

export enum PaymentAdjustmentType {
  COUPON = 'COUPON',
  CREDITS = 'CREDITS',
  OTHER = 'OTHER',
}

export class PaymentAdjustmentDto {
  paymentIntent: PaymentIntent;
  adjustments: PaymentAdjustment<any>[];
}

export interface CouponPaymentAdjustmentData {
  coupon: CouponEntity;
}

export interface PaymentAdjustment<T> {
  amount: number;
  type: PaymentAdjustmentType;
  data?: T;
}
