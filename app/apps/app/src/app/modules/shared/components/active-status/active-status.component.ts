import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-active-status',
  templateUrl: './active-status.component.html',
  styleUrls: ['./active-status.component.scss']
})
export class ActiveStatusComponent {
  @Input()
  active: boolean;

  @Input()
  trueText = 'Active';

  @Input()
  falseText = 'Inactive';
}
