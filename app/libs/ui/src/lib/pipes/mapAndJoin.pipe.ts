import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'mapAndJoin'
})
export class MapAndJoinPipe implements PipeTransform {
  transform(values: unknown[], key: string, separator: string = ', '): string {
    if (!Array.isArray(values) || values.length === 0) {
      return null;
    }
    return values.map(val => val[key]).filter(Boolean).join(separator);
  }
}
