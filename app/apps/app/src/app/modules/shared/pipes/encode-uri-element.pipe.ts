import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'encodeUriElement'
})
export class EncodeUriElementPipe implements PipeTransform {
  transform(value: string): any {
    return encodeURIComponent(value);
  }
}
