import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'initials'
})
export class InitialsPipe implements PipeTransform {

  transform(value: string): any {
    const parts = String(value || '').split(' ');
    const initials = parts.length >= 2 ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase() : `${parts[0][0] || ''}`.toUpperCase();
    return initials || '??';
  }

}
