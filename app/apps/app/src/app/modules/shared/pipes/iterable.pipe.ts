import {Pipe, PipeTransform} from '@angular/core';

/**
 * Allows inline iteration over otherwise non-iterable objects (i.e. enums, key/value objects that don't conform to ngFor, etc.)
 */
@Pipe({
  name: 'iterable'
})
export class IterablePipe implements PipeTransform {
  transform(obj: any): any {
    return Object.values(obj);
  }
}
