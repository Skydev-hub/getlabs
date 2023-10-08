import { Pipe, PipeTransform } from '@angular/core';
import { LabCompany } from '../models/user';

@Pipe({
  name: 'lab'
})
export class LabPipe implements PipeTransform {

  transform(value: string): string | null {
    switch (value) {
      case LabCompany.LabCorp:
        return 'Labcorp';
      case LabCompany.QuestDiagnostics:
        return 'Quest Diagnostics';
      case LabCompany.SonoraQuest:
        return 'Sonora Quest';
      case LabCompany.LabXpress:
        return 'LabXpress';
      default:
        return '';
    }
  }

}
