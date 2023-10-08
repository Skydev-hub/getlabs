import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'mapPinLabel'
})
export class MapPinLabelPipe implements PipeTransform {
  transform(value: any): google.maps.MarkerLabel {
    return {
      text: String(value),
      color: '#ffffff',
      fontFamily: 'sofia-pro',
      fontSize: '16px',
      fontWeight: '600'
    };
  }

}
