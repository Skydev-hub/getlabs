import {Component, Input} from '@angular/core';
import {LabCompany} from '../../models/user';

@Component({
  selector: 'app-lab-partner-inline-name',
  templateUrl: './lab-partner-inline-name.component.html'
})
export class LabPartnerInlineNameComponent {
  @Input()
  public labCompany: LabCompany;
}
