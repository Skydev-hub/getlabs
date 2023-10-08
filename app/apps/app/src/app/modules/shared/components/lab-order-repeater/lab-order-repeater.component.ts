import { Component, ContentChild, Input, TemplateRef } from '@angular/core';
import { LabOrderDetailsEntity } from '@app/ui';

@Component({
  selector: 'app-lab-order-repeater',
  templateUrl: './lab-order-repeater.component.html',
  styleUrls: ['./lab-order-repeater.component.scss'],
  host: {
    '[class.lab-order-repeater__multiple]': 'this.labOrderDetails && this.labOrderDetails.length > 1',
  }
})
export class LabOrderRepeaterComponent {
  @Input()
  labOrderDetails: LabOrderDetailsEntity[];

  @ContentChild(TemplateRef, { static: true })
  templateRef: TemplateRef<any>;

  trackById(index: number, labOrderDetailsEntity: LabOrderDetailsEntity) {
    return labOrderDetailsEntity.id;
  }
}
