import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { AfterContentInit, Directive, DoCheck, ElementRef, HostListener, Inject, Input, OnDestroy, PLATFORM_ID, Renderer2 } from '@angular/core';

export type sizes = 'xs' | 's' | 'm' | 'l' | 'xl';

@Directive({
  /* eslint-disable-next-line @angular-eslint/directive-selector */
  selector: '[appStickyBlock]',
  host: {
    '[class.sticky-block]': 'this.isFixed',
    '[attr.min-size]': 'this.minSize',
    '[attr.max-size]': 'this.maxSize',
  },
})
export class StickyBlockDirective implements AfterContentInit, DoCheck, OnDestroy {
  @Input()
  minSize: sizes;

  @Input()
  maxSize: sizes;

  @Input()
  offset = 0;

  isFixed: boolean = false;

  attachmentOffset: number;

  placeholder: any;

  constructor(
    private readonly elementRef: ElementRef,
    private readonly renderer2: Renderer2,
    /* eslint-disable-next-line @typescript-eslint/ban-types */
    @Inject(PLATFORM_ID) private readonly platformId: Object,
    @Inject(DOCUMENT) private readonly document: Document
  ) {}

  ngAfterContentInit(): void {
    /* If the top offset of this element is 0, then we should just apply the sticky behaviour immediately, as the element was
     * likely intended to be fixed to the top of the screen all the time. */
    this.isFixed = this.elementRef.nativeElement.offsetTop + this.offset === 0;

    /* If we're not dealing with an always-fixed element, let's add a placeholder element that has the same height as the sticky element,
     * so that our content does not shift around unexpectedly. */
    if (isPlatformBrowser(this.platformId)) {
      /* Create a placeholder element, and set its height to be equal to the element to which this directive is attached. */
      this.placeholder = this.document.createElement('div');

      this.renderer2.setStyle(this.placeholder, 'height', this.elementRef.nativeElement.clientHeight + 'px');
      this.renderer2.setAttribute(this.placeholder, 'class', 'sticky-placeholder');

      /* If we have a next sibling, we will append the placeholder before the next sibling (as renderer2 does not expose an insertAfter method.
       * Otherwise, we will need to append this element as a child to the parent container. */
      if (this.elementRef.nativeElement.nextSibling) {
        this.renderer2.insertBefore(this.elementRef.nativeElement.parentElement, this.placeholder, this.elementRef.nativeElement.nextSibling);
      } else {
        this.renderer2.appendChild(this.elementRef.nativeElement.parentElement, this.placeholder);
      }
    }
  }

  ngDoCheck(): void {
    const refHeight = this.elementRef.nativeElement.offsetHeight + 'px';

    /* On every digest iteration, we will check to see if we need to resize the placeholder according to the current size of the
     * tagged element */
    if (this.placeholder && this.placeholder.style.height !== refHeight) {
      this.renderer2.setStyle(this.placeholder, 'height', refHeight);
    }
  }

  @HostListener('window:scroll', ['$event'])
  // @HostBinding('class.header-fixed')
  scroll() {
    /* Ignore SSR envs */
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    /* Set the attachment offset if it is not yet defined.  This gives us a very useful point of reference when 're-attaching' the nav bar */
    this.attachmentOffset = !this.isFixed ? this.elementRef.nativeElement.offsetTop + this.offset : this.attachmentOffset;

    /* If the top of the viewport is below the top of the element, it needs to become fixed. */
    this.isFixed = !this.attachmentOffset || window.pageYOffset > this.attachmentOffset;
  }

  ngOnDestroy(): void {
    /* Remove the dynamically-added placeholder element reference */
    if (this.placeholder) {
      this.renderer2.removeChild(this.elementRef.nativeElement.parentElement, this.placeholder);
      this.renderer2.destroyNode(this.placeholder);
    }
  }
}
