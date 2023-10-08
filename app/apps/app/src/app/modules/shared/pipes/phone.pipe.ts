import { Pipe, PipeTransform } from '@angular/core';
import { CountryCode, parsePhoneNumber } from 'libphonenumber-js/min';

@Pipe({
  name: 'phone'
})
export class PhonePipe implements PipeTransform {
  transform(value: number | string, country?: CountryCode) {
    try {
      return parsePhoneNumber(String(value), country || 'US').formatNational();
    } catch (err) {
      return value;
    }
  }
}
