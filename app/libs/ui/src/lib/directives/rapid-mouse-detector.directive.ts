import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Directive, EventEmitter, Inject, Input, OnDestroy, OnInit, Output, PLATFORM_ID } from '@angular/core';
import { fromEvent, Observable, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

export interface RapidMouseDetectorOptions {
  filter?: ($event: MouseEvent) => boolean;
  unsubscribe$?: Observable<void>;
}

@Directive({
  /* eslint-disable-next-line @angular-eslint/directive-selector */
  selector: '[rapidMouseDetection]',
})
export class RapidMouseDetectorDirective implements OnInit, OnDestroy {
  @Input()
  options: RapidMouseDetectorOptions;

  @Output()
  rapidMouseMove = new EventEmitter<void>();

  /* Expressed as pixels/sec */
  private readonly modalThreshold = 12000;

  private lastMovementTime: number;

  private mouseMove$: Subscription;

  private unsubscribe$: Subscription;

  constructor(
    /* eslint-disable-next-line @typescript-eslint/ban-types */
    @Inject(PLATFORM_ID) private readonly platformId: Object,
    @Inject(DOCUMENT) private readonly document: Document
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    /* Register the mouse move listener via an observable-ish method. */
    this.mouseMove$ = fromEvent(this.document, 'mousemove')
      .pipe(
        /* Do not execute if the the consumer indicates that it should not be invoked, if the user is not running in the platform browser, or if
         * the movement vector has a non-upward orientation. */
        filter(($event: MouseEvent) => $event.movementY < 0 && isPlatformBrowser(this.platformId) && this.filter($event))
      )
      .subscribe(($event) => this.onMouseMove($event));

    /* If the consumer has supplied an unsubscribe observable, we'll need to ensure we unsubscribe when it emits. */
    if (this.options && this.options.unsubscribe$) {
      this.unsubscribe$ = this.options.unsubscribe$.subscribe(() => this.mouseMove$.unsubscribe());
    }
  }

  public onMouseMove($event: MouseEvent) {
    /* Determine the time delta since the last event. */
    const currentTime = new Date().getTime();
    const timeDelta = currentTime - (this.lastMovementTime || currentTime);

    /* If the time delta is greater than 0, we can continue with calculating speed. */
    if (timeDelta > 0) {
      /* First, we need to calculate the distance the user traveled since the last update.  lmao pythagorean theorem. */
      const distanceDelta = Math.sqrt(Math.pow(Math.abs($event.movementX), 2) + Math.pow(Math.abs($event.movementY), 2));

      /* Divide by the t to determine speed */
      const speed = distanceDelta / (timeDelta / 1000);

      /* If the speed is above the threshold, display the modal. */
      if (speed > this.modalThreshold) {
        this.rapidMouseMove.emit();
      }
    }

    /* Update the last-known movement time. */
    this.lastMovementTime = currentTime;
  }

  ngOnDestroy(): void {
    /* Unsubscribe the mouse move subscription... */
    if (this.mouseMove$) {
      this.mouseMove$.unsubscribe();
    }

    if (this.unsubscribe$) {
      this.unsubscribe$.unsubscribe();
    }
  }

  private filter(event: MouseEvent) {
    return this.options && this.options.filter ? this.options.filter(event) : true;
  }
}
