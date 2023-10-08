import { TitleCasePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'gender'
})
export class GenderPipe implements PipeTransform {

  transform(value: string): string | null {
    if (!value) {
      return null;
    }

    return new TitleCasePipe().transform(value);
  }

}
