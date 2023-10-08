import { CurrencyPipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'price',
})
export class PricePipe implements PipeTransform {
  transform(value: number) {
    if (!value) {
      return null;
    }

    return new CurrencyPipe('en-US').transform(value, 'USD', 'symbol', '1.0-2');
  }
}
