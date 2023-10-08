import { Component, Host } from '@angular/core';
import { ProgressiveDisclosureElementDirective } from '../../directives/progressive-disclosure-element.directive';
import { ProgressiveDisclosureDirective } from '../../directives/progressive-disclosure.directive';

@Component({
  selector: 'app-progressive-disclosure-disacknowledge',
  templateUrl: './progressive-disclosure-disacknowledge.component.html'
})
export class ProgressiveDisclosureDisacknowledgeComponent {
  constructor(@Host() private readonly progressiveDisclosure: ProgressiveDisclosureDirective,
              @Host() private readonly progressiveDisclosureElement: ProgressiveDisclosureElementDirective) {}

  disacknowledge() {
    this.progressiveDisclosure.disacknowledgeElement(this.progressiveDisclosureElement);
  }
}
