import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'aOrAn'
})
export class AOrAnPipe implements PipeTransform {

  transform(value: string): string {
    if (!value) {
      return;
    }
    const aOrAn = value.match(/^[aeiou].*/i) ? 'an' : 'a';
    return `${aOrAn} ${value}`;
  }

}
