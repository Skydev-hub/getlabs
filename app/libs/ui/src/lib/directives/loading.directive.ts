import { Directive, ElementRef, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

@Directive({
  selector: '[appLoading], [loading]',
  host: {
    '[class.h-hide]': '(behavior === "hide" && isLoading()) || (behavior === "show" && !isLoading())',
    '[class.loading]': 'isLoading()',
    '[class.loading--text-left]': '(loadingStyle === "text-left")',
    '[class.loading--text-right]': '(loadingStyle === "text-right")',
  },
})
export class LoadingDirective implements OnInit, OnChanges {
  // Loosely based on angular2-promise-buttons package

  // TODO: Remove when all [appLoading] instances are migrated to [loading]
  /* eslint-disable-next-line @angular-eslint/no-input-rename */
  @Input('appLoading')
  set appLoading(input: Subscription | Promise<any> | boolean) {
    this.input = input;
  }

  get appLoading() {
    return this.input;
  }

  @Input('loading')
  public input: Subscription | Promise<any> | boolean;

  @Input()
  behavior: 'button' | 'show' | 'hide' = 'button';

  @Input()
  loadingStyle: 'default' | 'text-right' | 'text-left' = 'default';

  loading$ = new BehaviorSubject(false);

  private promise: Promise<any>;

  private fakePromiseResolveFn: () => void;

  constructor(
    // TODO: Remove once all button instances are of ButtonComponent
    private readonly elementRef: ElementRef
  ) {}

  isLoading(): boolean {
    return Boolean(this.loading$.getValue());
  }

  ngOnInit() {
    this.loading$.pipe(distinctUntilChanged()).subscribe((status) => {
      // TODO: Remove once all button instances are of ButtonComponent
      if (this.elementRef.nativeElement.tagName === 'BUTTON') {
        this.elementRef.nativeElement.disabled = status;
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.input || changes.appLoading) {
      switch (true) {
        case this.input instanceof Subscription:
          this.promise = new Promise((resolve) => (this.input as Subscription).add(resolve));
          break;
        case this.input instanceof Promise:
          this.promise = this.input as Promise<any>;
          break;
        case typeof this.input === 'boolean':
          this.promise = this.promiseFromBoolean(this.input as boolean);
          break;
        default:
          this.promise = null;
      }

      this.initPromiseHandler();
    }
  }

  private promiseFromBoolean(val: boolean): Promise<boolean> {
    if (val) {
      return new Promise<boolean>((resolve) => {
        this.fakePromiseResolveFn = resolve;
      });
    } else {
      if (this.fakePromiseResolveFn) {
        this.fakePromiseResolveFn();
      }

      return this.promise;
    }
  }

  private initPromiseHandler() {
    if (this.promise) {
      this.loading$.next(true);
      this.promise.finally(() => {
        this.loading$.next(false);
      });
    }
  }
}
