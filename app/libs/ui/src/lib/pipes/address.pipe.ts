import { Pipe, PipeTransform } from '@angular/core';
import { Address } from '../models/user';

@Pipe({
  name: 'address'
})
export class AddressPipe implements PipeTransform {
  transform(value: Address, format?: 'zip' | 'state' | 'city' | 'full'): string | null {
    if (!value) {
      return null;
    }

    const parts = [];

    switch (format) {
      case 'zip':
        parts.push(value.zipCode);
        break;
      case 'state':
        parts.push(value.state, value.zipCode);
        break;
      case 'city':
        parts.push(value.city, value.state, value.zipCode);
        break;
      case 'full':
      default:
        parts.push([value.street, value.unit].filter(Boolean).join(' '), value.city, value.state, value.zipCode);
    }

    return parts.filter(Boolean).join(', ');
  }
}
