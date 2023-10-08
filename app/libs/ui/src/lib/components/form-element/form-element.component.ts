import { AfterViewInit, Component, ElementRef, Input, Optional, ViewChild } from '@angular/core';
import { FormContainerDirective } from '../../directives/form-container.directive';

// Increasing integer for generating unique ids for input components.
let nextUniqueId = 0;

@Component({
  selector: 'app-form-element',
  templateUrl: './form-element.component.html',
  styleUrls: ['./form-element.component.scss'],
  host: {
    '[class.error]': 'isError()',
    '[class.hide-disabled]': 'this.hideDisabled()',
  },
})
export class FormElementComponent implements AfterViewInit {
  @Input()
  label: string;

  @Input()
  error: string;

  @Input()
  optional: boolean = false;

  @Input()
  name: string;

  // @Optional()
  // @Host()
  // formContainer: FormContainerDirective;

  id: string;

  @ViewChild('content')
  private content: ElementRef;

  constructor(private el: ElementRef, @Optional() public formContainer: FormContainerDirective) {}

  ngAfterViewInit(): void {
    const input = this.el.nativeElement.querySelector('input,textarea,select');

    if (input) {
      const id = input.getAttribute('id');
      setTimeout(() => {
        if (id) {
          this.id = id;
        } else {
          this.id = `--input-id-${nextUniqueId++}`;
          input.setAttribute('id', this.id);
        }
      });
    }
  }

  isError(): boolean {
    return !!this.error;
  }

  hideDisabled(): boolean {
    return !!this.formContainer && !!this.name && this.formContainer.isHideDisabled() && this.formContainer.getControl(this.name).disabled;
  }
}
