import { DOCUMENT } from '@angular/common';
import { Component, ElementRef, Inject, Input, OnDestroy, OnInit, PLATFORM_ID, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-site-message',
  templateUrl: './site-message.component.html',
  styleUrls: ['./site-message.component.scss'],
  host: {
    '[class.app-site-message__fixed]': 'this.fix'
  }
})
export class SiteMessageComponent implements OnInit, OnDestroy {

  @Input()
  public fix: boolean = false;

  @Input()
  public lifecycleParent: OnDestroy;

  private dismissed = false;

  constructor(
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document,
    private elem: ElementRef,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) { }

  ngOnInit() {
    /* If fix is set to true, we will need to creatively pre-pend this component to the top of <body> */
    if (this.fix) {
      /* Retrieve the parent element - this will be used to identify when the original parent of this node has been removed... */
      const parent = this.elem.nativeElement.parentElement;

      /* Create a mutation observer - this observer will watch body... whenever the subtree of body changes, this mutation observer will
       * check to see if the parent of this element has been removed.  If so, then this element must also be removed. */
      const obs = new MutationObserver(() => {
        if (!this.document.body.contains(parent.parentElement)) {
          /* There is no angular-friendly means by which element removal is supported; instead, we have to invoke this method
           * with the dom element directly in hand.  I have confirmed that this indeed invokes the angular destroy hook. */
          this.elem.nativeElement.remove();
          obs.disconnect();
        }
      });

      /* Add this element to the top of the body tag... */
      this.renderer.insertBefore(this.document.body, this.elem.nativeElement, this.document.body.firstChild);

      /* Observe the parent element. */
      obs.observe(this.document.body, {
        childList: true,
        subtree: true
      });
    }
  }

  close() {
    if (!this.dismissed) {
      this.renderer.removeChild(this.elem.nativeElement.parentElement, this.elem.nativeElement);
      this.dismissed = true;
    }

    /* It is not possible to destroy a component from within itself... that's garbage IMO, but not much we can do to accommodate that save implementing
     * some silly workarounds.  If we use site-message extensively in the future, we will need to create an enveloping component that can manage this
     * on its own. */
  }

  ngOnDestroy(): void {
    this.close();
  }
}
