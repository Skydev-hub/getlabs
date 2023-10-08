import { Component, Host } from '@angular/core';
import { ProgressiveDisclosureElementDirective } from '../../directives/progressive-disclosure-element.directive';
import { ProgressiveDisclosureDirective } from '../../directives/progressive-disclosure.directive';

@Component({
  selector: 'app-progressive-disclosure-acknowledge',
  templateUrl: './progressive-disclosure-acknowledge.component.html'
})
export class ProgressiveDisclosureAcknowledgeComponent {
  constructor(@Host() private readonly progressiveDisclosure: ProgressiveDisclosureDirective,
              @Host() private readonly progressiveDisclosureElement: ProgressiveDisclosureElementDirective) {}

  acknowledge() {
    this.progressiveDisclosure.acknowledgeElement(this.progressiveDisclosureElement);
  }
}
