import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'ampm',
})
export class AmPmPipe implements PipeTransform {
  transform(value: Date | number): any {
    /* If the inbound value is a number, we will simply extract the getHours value; otherwise, we will treat the
     * inbound number as a descriptor of hours. */
    return (value instanceof Date ? value.getHours() : value) < 12 ? 'AM' : 'PM';
  }
}
