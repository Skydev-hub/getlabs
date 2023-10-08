import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { filterUndefinedHttpParams, MarketEntity, MarketService } from '@app/ui';
import { BehaviorSubject, EMPTY, Observable, of, timer } from 'rxjs';
import { catchError, debounce, distinctUntilChanged, finalize } from 'rxjs/operators';

@Component({
  selector: 'app-team-market-list',
  templateUrl: './market-list.component.html',
  styleUrls: ['./market-list.component.scss'],
})
export class MarketListComponent implements OnInit, OnChanges {

  @Input()
  public search: string = null;

  private _search$: BehaviorSubject<string> = new BehaviorSubject<string>(undefined);

  private _total = 0;

  private _data$: BehaviorSubject<MarketEntity[]> = new BehaviorSubject<MarketEntity[]>(undefined);

  public data$: Observable<MarketEntity[]> = this._data$.asObservable();

  public scrollDisabled = false;

  constructor(private service: MarketService) {
  }

  ngOnInit() {
    this._search$.pipe(
      distinctUntilChanged(),
      debounce(val => val !== null ? timer(400) : EMPTY),
    ).subscribe(() => {
      this.load(true);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.search) {
      this._search$.next(changes.search.currentValue);
    }
  }

  load(reset?: boolean): void {
    if (!this.scrollDisabled) {
      this.scrollDisabled = true;
      if (reset) {
        this._data$.next(null);
      }
      const data = this._data$.getValue();
      this.service.list(
        filterUndefinedHttpParams({
          limit: String(25),
          offset: String(data ? data.length : 0),
          search: this._search$.getValue(),
        }),
      ).pipe(
        catchError(() => {
          return of({
            data: [],
            total: 0,
          });
        }),
        finalize(() => this.scrollDisabled = false),
      ).subscribe(resp => {
        this._data$.next([...(this._data$.getValue() || []), ...resp.data]);
        this._total = resp.total;
      });
    }
  }

  onScroll() {
    if (this._data$.getValue().length < this._total) {
      this.load();
    }
  }

}
