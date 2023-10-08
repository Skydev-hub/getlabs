import { Pipe, PipeTransform } from '@angular/core';

/**
 * This pipe automatically truncates all numbers within a string that contain zero-value decimal places. All
 * numbers that have non-zero-value decimal places will be left unchanged.
 *
 * For example, if this pipe is applied against a string as below:
 * "Your appointment is $4.40, which includes a credit of $5.00".
 * The resulting output is as below:
 * "Your appointment is $4.40, which includes a credit of $5".
 */
@Pipe({
  name: 'truncateNumbers'
})
export class TruncateNumbersPipe implements PipeTransform {
  transform(value: string | number): any {
    /* If the inbound value is an instance of a number, we will convert it to a string for consistent handling. */
    const str = typeof value === 'number' ? '' + value : value;

    if (typeof str !== 'string') {
      throw new Error(`Cannot perform auto truncation on ${ value } - input value must be a string!`);
    }

    /* Use a regex find/replace to identify all figures that 0-value decimal points. */
    return str.replace(/\.(0+)\b/g, '');
  }
}
