import { Pipe, PipeTransform } from '@angular/core';
import { Address } from '@app/ui';

@Pipe({
  name: 'directionsUrl'
})
export class DirectionsUrlPipe implements PipeTransform {
  transform(value: Address, place?: string): string | null {
    if (!value) {
      return null;
    }

    const url = new URL('https://www.google.com/maps/dir/?api=1');

    url.searchParams.append('destination', value.composed);

    if (place) {
      url.searchParams.append('destination_place_id', place);
    }

    return url.href;
  }
}
