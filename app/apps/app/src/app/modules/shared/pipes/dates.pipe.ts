import { formatDate } from '@angular/common';
import { Inject, Injectable, LOCALE_ID, Pipe, PipeTransform } from '@angular/core';

@Injectable()
@Pipe({
  name: 'dates'
})
export class DatesPipe implements PipeTransform {

  constructor(@Inject(LOCALE_ID) private locale: string) {}

  transform(dates: Date[], format?: string, separator?: string, unique?: boolean, timezone?: string, locale?: string);
  transform<T>(dates: T[], getDate: (val: T) => Date, format?: string, separator?: string, unique?: boolean, timezone?: string, locale?: string);
  transform<T>(dates: (Date | T)[], formatOrGetDate: ((val: T) => Date) | string, ...args: any[]): string {
    let format: string = formatOrGetDate as string;
    let getDate: (val: T) => Date;

    args = args || [];

    /* If we're dealing with a function, separate getDate and format out from the 2nd param and the first index of the array params respectively. */
    if (typeof formatOrGetDate === 'function') {
      getDate = formatOrGetDate;
      format = args.length ? args.splice(0, 1)[0] : null;
    }

    /* Extract the remainder of the parameters. */
    try {
      return dates.map((date: Date | T) => formatDate(!(date instanceof Date) ? getDate(date) : date, format,
          this.getArg(args, 3) || this.locale, this.getArg(args, 2)))
        .filter((el, i, a) => i === a.indexOf(el)).join(this.getArg(args, 0) || ' / ');
    } catch (error) {
      throw Error(`InvalidPipeArgument: '${ error.message }' for pipe 'DatesPipe'`);
    }

  }

  private getArg(args: any[], index: number) {
    return args.length > index ? args[index] : null;
  }
}
