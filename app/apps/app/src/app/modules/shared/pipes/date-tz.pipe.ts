import { Injectable, Optional, Pipe, PipeTransform } from '@angular/core';
import { format as formatDate, utcToZonedTime } from 'date-fns-tz';
import { AuthService } from '@app/ui';

@Injectable()
@Pipe({
  name: 'dateTz'
})
export class DateTzPipe implements PipeTransform {

  private formats = {
    'short': 'M/d/yy, h:mm a',                  // eg. 6/15/15, 9:03 AM
    'mediumShort': 'MMM d, y, h:mm a',          // eg. Jun 15, 2015, 9:03 AM
    'medium': 'MMM d, y, h:mm:ss a',            // eg. Jun 15, 2015, 9:03:01 AM
    'long': 'MMMM d, y, h:mm:ss a z',           // eg. June 15, 2015 at 9:03:01 AM GMT+1
    'full': 'EEEE, MMMM d, y, h:mm:ss a zzzz',  // eg. Monday, June 15, 2015 at 9:03:01 AM GMT+01:00
    'shortDate': 'M/d/yy',                      // eg. 6/15/15
    'mediumDate': 'MMM d, y',                   // eg. Jun 15, 2015
    'longDate': 'MMMM d, y',                    // eg. June 15, 2015
    'fullDate': 'EEEE, MMMM d, y',              // eg. Monday, June 15, 2015
    'shortTime': 'h:mmaaaaa\'m\'',              // eg. 9:03 AM
    'mediumTime': 'h:mm:ss a',                  // eg. 9:03:01 AM
    'longTime': 'h:mm:ss a z',                  // eg. 9:03:01 AM GMT+1
    'fullTime': 'h:mm:ss a zzzz',               // eg. 9:03:01 AM GMT+01:00
  };

  constructor(@Optional() public auth: AuthService) {}

  transform(date: Date, format = 'mediumDate', timezone?: string): any {
    if (!timezone && this.auth) {
      const user = this.auth.getUser();
      timezone = user && user.timezone ? user.timezone : null;
    }

    return formatDate(
      utcToZonedTime(date, timezone),
      format in this.formats ? this.formats[format] : format,
      { timeZone: timezone });
  }

}
