import { CurrencyPipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import { CouponEntity, DiscountType } from '@app/ui';

@Pipe({
  name: 'discount',
})
export class DiscountPipe implements PipeTransform {

  transform(coupon: CouponEntity): string | null {
    const currency = new CurrencyPipe('en-US');
    switch (coupon.discountType) {
      case DiscountType.Absolute:
        return `${ currency.transform(coupon.discount / 100) } off`;
      case DiscountType.Percentage:
        return `${ coupon.discount }% off`;
      default:
        return '--';
    }
  }

}
