import { Pipe, PipeTransform } from '@angular/core';
import { formatDistance } from 'date-fns';

@Pipe({
  name: 'dateDistance'
})
export class DateDistancePipe implements PipeTransform {
  transform(value: Date) {
    return formatDistance(value, new Date(), { addSuffix: true });
  }
}
