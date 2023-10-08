import {DOCUMENT, isPlatformBrowser} from '@angular/common';
import {Directive, EventEmitter, Inject, Input, OnDestroy, OnInit, Output, PLATFORM_ID} from '@angular/core';
import { fromEvent, Observable, Subscription } from 'rxjs';
import { debounceTime, filter, takeUntil } from 'rxjs/operators';

export interface DocumentMouseLeaveListenerOptions {
  unsubscribe$?: Observable<void>;
}

@Directive({
  selector: '[appDocumentLeaveListener]',
})
export class DocumentMouseLeaveListenerDirective implements OnInit, OnDestroy {
  @Input()
  options: DocumentMouseLeaveListenerOptions;

  @Input()
  debounce: number = 0;

  @Output()
  documentMouseLeave = new EventEmitter<void>();

  mouseLeave$: Subscription;

  unsubscribe$: Subscription;

  constructor(
    @Inject(DOCUMENT) private readonly document: Document,
    @Inject(PLATFORM_ID) private readonly platformId: Object,
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    /* Register a listener that detects whenever the user's mouse leaves the browser window */
    this.subscribeToMouseEvents();

    /* If an unsubscribe observable has been provided, we will subscribe to it so we know when to unsubscribe the above
     * mouse listener. */
    if (this.options && this.options.unsubscribe$) {
      this.unsubscribe$ = this.options.unsubscribe$.subscribe(() => {
        this.mouseLeave$.unsubscribe();
        this.mouseLeave$ = null;
      });
    }
  }

  ngOnDestroy(): void {
    if (this.mouseLeave$) {
      this.mouseLeave$.unsubscribe();
    }

    if (this.unsubscribe$) {
      this.unsubscribe$.unsubscribe();
    }
  }

  private subscribeToMouseEvents() {
    this.mouseLeave$ = fromEvent(this.document.body, 'mouseleave').pipe(
      /* Filter all cases where the mouse position is not above the viewport. */
      filter(($event: MouseEvent) => {
        return $event.y <= 0;
      }),

      /* Debounce all events by the specified amount of time. */
      debounceTime(this.debounce),

      /* Once a mouseenter event occurs, spike this observable. */
      takeUntil(fromEvent(this.document.body, 'mouseenter'))
    ).subscribe({
      next: () => this.documentMouseLeave.emit(),
      complete: () => {
        /* Complete will be triggered by the takeUntil condition above.  Unsubscribe and resubscribe this observable. */
        this.mouseLeave$.unsubscribe();
        this.subscribeToMouseEvents();
      }
    })
  }
}
