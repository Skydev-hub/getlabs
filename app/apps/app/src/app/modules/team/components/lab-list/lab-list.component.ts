import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { getLabCompanies, LabLocationEntity, LabLocationService, MarketService } from '@app/ui';
import { BehaviorSubject, EMPTY, Observable, of, Subscription, timer } from 'rxjs';
import { catchError, debounce, distinctUntilChanged, finalize } from 'rxjs/operators';

@Component({
  selector: 'app-team-lab-list',
  templateUrl: './lab-list.component.html',
  styleUrls: ['./lab-list.component.scss']
})
export class LabListComponent implements OnInit, OnChanges, OnDestroy {
  @Input()
  public search: string = null;

  private _search$: BehaviorSubject<string> = new BehaviorSubject<string>(undefined);

  private _total = 0;

  private _data$: BehaviorSubject<LabLocationEntity[]> = new BehaviorSubject<LabLocationEntity[]>(undefined);

  public data$: Observable<LabLocationEntity[]> = this._data$.asObservable();

  public scrollDisabled = false;

  private subscriptions: Subscription[] = [];

  constructor(private readonly service: LabLocationService, private readonly marketService: MarketService) {}

  ngOnInit() {
    this._search$
      .pipe(
        distinctUntilChanged(),
        debounce(val => (val !== null ? timer(400) : EMPTY))
      )
      .subscribe(() => {
        this.load(true);
      });
    this.subscriptions.push(this.marketService.getActiveMarkets$().subscribe(() => this.load(true)));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.search) {
      this._search$.next(changes.search.currentValue);
    }
  }

  /**
   * If the start of the search query matches a single lab company's name pass the lab filter instead of the search query
   */
  getSearchParams(): { [key: string]: any } {
    const search = this._search$.getValue();
    if (search) {
      const labMatches = getLabCompanies()
        .filter(l => l.name.toLowerCase().startsWith(search.toLowerCase()))
        .map(l => l.lab);
      if (labMatches.length > 0) {
        return { lab: labMatches };
      }
      return { search: search };
    }
    return {};
  }

  load(reset?: boolean): void {
    if (!this.scrollDisabled) {
      this.scrollDisabled = true;
      if (reset) {
        this._data$.next(null);
      }
      const data = this._data$.getValue();
      this.service
        .list({
          limit: String(25),
          offset: String(data ? data.length : 0),
          ...this.getSearchParams()
        })
        .pipe(
          catchError(() => {
            return of({
              data: [],
              total: 0
            });
          }),
          finalize(() => (this.scrollDisabled = false))
        )
        .subscribe(resp => {
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

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
