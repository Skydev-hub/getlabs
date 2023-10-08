import { Input, OnChanges, OnDestroy, OnInit, SimpleChanges, Directive } from '@angular/core';
import { CrudService, filterUndefinedHttpParams, MarketService } from '@app/ui';
import { BehaviorSubject, EMPTY, Observable, of, Subscription, timer } from 'rxjs';
import { catchError, debounce, distinctUntilChanged, finalize } from 'rxjs/operators';

/**
 * Abstract class that implements the vast majority of the TS-tier logic associated with displaying a simple entity list.
 */
@Directive()
/* eslint-disable-next-line @angular-eslint/directive-class-suffix, @typescript-eslint/ban-types */
export abstract class AbstractMarketSensitiveListComponent<E extends object> implements OnInit, OnChanges, OnDestroy {
  /**
   * Input binding for the freeform search field which is generally a feature of these views.
   */
  @Input()
  public search: string = null;

  protected _data$: BehaviorSubject<E[]> = new BehaviorSubject<E[]>(undefined);

  public data$: Observable<E[]> = this._data$.asObservable();

  public scrollDisabled = false;

  protected _total = 0;

  protected subscriptions: Subscription[] = [];

  protected _search$: BehaviorSubject<string> = new BehaviorSubject<string>(undefined);

  constructor(protected readonly marketService: MarketService) {}

  public ngOnInit(): void {
    /**
     * API invocations are performed in response to changes to the search criteria.
     */
    this.subscriptions.push(
      this._search$
        .pipe(
          distinctUntilChanged(),
          debounce((val) => (val !== null ? timer(400) : EMPTY))
        )
        .subscribe(() => {
          this.load(true);
        })
    );

    /**
     * API invocations are also performed in response to changes in the active market.
     */
    this.subscriptions.push(this.marketService.getActiveMarkets$().subscribe(() => this.load(true)));
  }

  /**
   * Invokes the linked CrudService's 'list' method while considering the current state of pagination.
   */
  public load(reset?: boolean): void {
    if (!this.scrollDisabled) {
      this.scrollDisabled = true;
      if (reset) {
        this._data$.next(null);
      }
      const data = this._data$.getValue();
      this.getService()
        .list(
          filterUndefinedHttpParams({
            limit: String(25),
            offset: String(data ? data.length : 0),
            search: this._search$.getValue(),
          })
        )
        .pipe(
          catchError(() => {
            return of({
              data: [],
              total: 0,
            });
          }),
          finalize(() => (this.scrollDisabled = false))
        )
        .subscribe((resp) => {
          this._data$.next([...(this._data$.getValue() || []), ...resp.data]);
          this._total = resp.total;
        });
    }
  }

  public ngOnChanges(changes: SimpleChanges): void {
    /* Whenever the search input binding changes, we will cascade that value to the search subject. */
    if (changes.search) {
      this._search$.next(changes.search.currentValue);
    }
  }

  public onScroll() {
    /* Can be called by child classes to effectively hit the API for subsequent entity result pages. */
    if (this._data$.getValue().length < this._total) {
      this.load();
    }
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  public abstract getService(): CrudService<E>;
}
