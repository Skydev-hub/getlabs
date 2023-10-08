import { Type } from 'class-transformer';

export enum DiscountType {
  Absolute = 'absolute',
  Percentage = 'percentage',
}

export enum CouponConditionEnum {
  FirstVisitOnly = 'first-visit-only',
}

export class CouponEntity {
  id: string;

  code: string;

  discount: number;

  discountType: DiscountType;

  isActive?: boolean;

  @Type(() => Date)
  validFrom?: Date;

  @Type(() => Date)
  validTo?: Date;

  @Type(() => Date)
  conditions?: CouponConditionEnum[];
}
