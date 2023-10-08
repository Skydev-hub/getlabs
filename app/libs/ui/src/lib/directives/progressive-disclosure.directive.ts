import { AfterContentInit, ContentChildren, Directive, EventEmitter, Output, QueryList } from '@angular/core';
import { ProgressiveDisclosureElementDirective } from './progressive-disclosure-element.directive';

export interface AcknowledgementStatus {
  current: ProgressiveDisclosureElementDirective;
  next?: ProgressiveDisclosureElementDirective;
}

@Directive({
  selector: '[appProgressiveDisclosure]',
})
export class ProgressiveDisclosureDirective implements AfterContentInit {
  @ContentChildren(ProgressiveDisclosureElementDirective)
  private elements: QueryList<ProgressiveDisclosureElementDirective>;

  @Output()
  public disacknowledge = new EventEmitter<AcknowledgementStatus>();

  @Output()
  public acknowledge = new EventEmitter<AcknowledgementStatus>();

  ngAfterContentInit(): void {
    this.elements.first.open();
  }

  public acknowledgeElement(element: ProgressiveDisclosureElementDirective) {
    /* On acknowledge, iterate to the next item, open it, and then close this item. */
    element.close();

    const next = this.findNextElement(element);

    if (next) {
      next.open();
    }

    this.acknowledge.emit({
      current: element,
      next
    });
  }

  public disacknowledgeElement(element: ProgressiveDisclosureElementDirective) {
    this.disacknowledge.emit({
      current: element,
      next: this.findNextElement(element)
    });
  }

  private findNextElement(element: ProgressiveDisclosureElementDirective) {
    let next = null;

    this.elements.find((elem, idx, arr) => {
      if (elem === element && idx < arr.length - 1) {
        next = arr[idx + 1];
        return true;
      }
    });

    return next;
  }
}
