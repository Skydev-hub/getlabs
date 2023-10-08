import { plainToClass } from 'class-transformer';
import { format, parse } from 'date-fns';

export class SimpleDateTime {
  date: string; // yyyy-mm-dd

  time: string; // hh:mm

  public static fromDate(date: Date) {
    /* If the inbound date is not valid, throw an exception. */
    if (!date) {
      throw new Error(`Cannot create instance of SimpleDateTime from a null/undefined data parameter.`);
    }

    /* Parse out the date/time components from the supplied date and return a new object */
    return plainToClass(SimpleDateTime, {
      date: format(date, 'yyyy-MM-dd'),
      time: format(date, 'HH:mm')
    });
  }

  public toDate() {
    /* If neither the date nor time are set, throw an exception. */
    if (!this.date && !this.time) {
      throw new Error(`Cannot convert SimpleDateTime object to Date object - at least one of the date/time properties must be set.`);
    }

    /* Parse a date from the current date/time fields.  Date is normalized to today is no date is supplied.
     * Time is normalized to midnight if no time is supplied. */
    return parse(`${this.date || format(new Date(), 'yyyy-MM-dd')} ${this.time || '00:00'}`, 'yyyy-MM-dd HH:mm', new Date());
  }
}
