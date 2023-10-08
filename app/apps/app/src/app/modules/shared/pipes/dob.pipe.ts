import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import { differenceInYears } from 'date-fns';
import { PatientUser } from '@app/ui';

@Pipe({
  name: 'dob'
})
export class DobPipe implements PipeTransform {
  transform(value: Date | PatientUser) {
    const dob = value instanceof PatientUser ? value.dob : value;

    if (!value) {
      return null;
    }

    let minorFlag = '';
    if (value instanceof PatientUser && value.isMinor) {
      minorFlag = value.isEligibleMinor ? 'Minor - ' : 'INELIGIBLE MINOR - ';
    }

    return `${ new DatePipe('en-US').transform(dob) } (${minorFlag}${ differenceInYears(new Date(), dob) })`;
  }
}
