import { Directive, Input } from '@angular/core';

@Directive({
  selector: '[appProgressiveDisclosureElement]',
  host: {
    '[class.progressive-disclosure--open]': 'this._isOpen',
    '[class.progressive-disclosure--closed]': '!this._isOpen'
  }
})
export class ProgressiveDisclosureElementDirective {
  @Input()
  sectionId: string = null;

  public _isOpen = false;

  public isOpen() {
    return this._isOpen;
  }

  public open() {
    /* Timeout required as we are modifying a variable that directly impacts an element's rendering state, and that may be
     * executed as a result of invoking this method via change detection */
    setTimeout(() => {
      this._isOpen = true;
    });
  }

  public close() {
    /* Timeout required as we are modifying a variable that directly impacts an element's rendering state, and that may be
     * executed as a result of invoking this method via change detection */
    setTimeout(() => {
      this._isOpen = false;
    });
  }
}
