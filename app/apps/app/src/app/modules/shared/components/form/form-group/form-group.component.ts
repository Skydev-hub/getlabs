import {Component, Input, OnInit, Optional} from '@angular/core';
import {FormContainerDirective} from '@app/ui';

@Component({
  selector: 'app-form-group',
  templateUrl: './form-group.component.html',
  styleUrls: ['./form-group.component.scss'],
  host: {
    '[class.h-hide]': 'this.isGroupHidden()'
  }
})
export class FormGroupComponent implements OnInit {

  @Input()
  label: string;

  @Input()
  formGroupName: string;

  constructor(@Optional() public formContainer: FormContainerDirective) { }

  ngOnInit() {
  }

  isGroupHidden() {
    return this.formContainer && this.formContainer.isHideDisabled() && this.formContainer.getControl(this.formGroupName).disabled;
  }

}
