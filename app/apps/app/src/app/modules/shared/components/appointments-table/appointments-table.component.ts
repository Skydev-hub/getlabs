import { Component, Input, OnDestroy, OnInit, Output, ViewChild, EventEmitter } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import {
  append,
  AppointmentEntity,
  AppointmentStatus,
  AuthService,
  ComplexFilterCriterionValues,
  FilterCriteria,
  FilterCriterion,
  FilterCriterionOptions,
  filterFalsy,
  FilterSet,
  ListFilterContainerDirective,
  PagedResponseDto,
} from '@app/ui';
import { format } from 'date-fns';
import { isEqual, isNil } from 'lodash-es';
import { BehaviorSubject, combineLatest, EMPTY, merge, Observable, of, Subject, timer } from 'rxjs';
import { catchError, debounce, distinctUntilChanged, filter, map, scan, shareReplay, startWith, switchMap, tap } from 'rxjs/operators';
import { isToday, isTomorrow, isYesterday } from '../../utils/date.utils';
import { DateRange } from '../form/input/date-range-input/date-range-input.component';

export enum AppointmentTableColumn {
  Date = 'Date',
  Identifier = 'identifier',
  Status = 'status',
  Market = 'market',
  Time = 'time',
  Patient = 'patient',
  Specialist = 'specialist',
  DeliveryLocation = 'delivery-location',
  Laboratory = 'laboratory',
}

enum ViewModes {
  ListView = 'ListView',
  MapView = 'MapView',
}

export interface AppointmentSearchParams {
  range?: DateRange;
  query?: string;
  instant?: boolean;
}

export interface AppointmentsTableOptions {
  onFilterChange?: (filterSet: FilterSet<any, AppointmentEntity>[]) => boolean;
}

/**
 * Contains complex filter criteria options that are deemed to be reasonably common.  A better solution would be
 * to make the team and specialist AppointmentsPageComponents inherit from a common parent component that provides
 * this filter option (along with a wide variety of other common functionality), but we don't have time for that
 * at the moment.
 */
export const CommonComplexFilterOptions: { [key: string]: ComplexFilterCriterionValues<AppointmentEntity> } = {
  NotCancelledOption: {
    properties: {
      status: {
        value: Object.values(AppointmentStatus).filter((status) => status !== AppointmentStatus.Cancelled && status !== AppointmentStatus.Incomplete),
      },
    },
    label: 'Not Cancelled',
  },
};

/* Subclass exists for the pure and simple reason of supplying 'AppointmentEntity' as the object type backing the list of objects. */
export class AppointmentFilterCriterion<T> extends FilterCriterion<T, AppointmentEntity> {
  constructor(
    _filterableValue: ((objs: AppointmentEntity) => T) | keyof AppointmentEntity,
    getLabel: (option: T) => string,
    options?: FilterCriterionOptions<T>
  ) {
    super(_filterableValue, getLabel, options);
  }
}

@Component({
  selector: 'app-appointments-table',
  templateUrl: './appointments-table.component.html',
  styleUrls: ['./appointments-table.component.scss'],
})
export class AppointmentsTableComponent implements OnInit, OnDestroy {
  @Input()
  set day(day: Date | DateRange) {
    const result = day
      ? {
          start: day instanceof Date ? day : day.start,
          end: day instanceof Date ? null : day.end || null,
        }
      : null;

    this._dayInput$.next(result);
  }

  get day(): Date | DateRange {
    return this.dateRangeControl.value;
  }

  @Input()
  public columns: string[] = [];

  @Input()
  public filterCriteria: FilterCriteria<AppointmentEntity, AppointmentFilterCriterion<any>>;

  @Input()
  public options: AppointmentsTableOptions;

  @Output()
  public dayChange: EventEmitter<DateRange> = new EventEmitter<DateRange>();

  public toggleControl = new FormControl(ViewModes.ListView);

  public formGroup: FormGroup;

  public _total = 0;

  public data$: Observable<AppointmentEntity[]>;

  public scrollDisabled = false;

  public Column = AppointmentTableColumn;

  public AppointmentEntityType = AppointmentEntity;

  public isYesterday = isYesterday;

  public isToday = isToday;

  public isTomorrow = isTomorrow;

  public ViewModes = ViewModes;

  private _dayInput$ = new Subject<DateRange>();

  private _search$: BehaviorSubject<AppointmentSearchParams> = new BehaviorSubject<AppointmentSearchParams>({});

  @ViewChild(ListFilterContainerDirective, { static: true })
  private listFilterContainerDirective: ListFilterContainerDirective<any, AppointmentEntity>;

  private paramsSubject$ = new BehaviorSubject<{ [key: string]: string | string[] }>({});

  constructor(public readonly auth: AuthService, formBuilder: FormBuilder) {
    this.formGroup = formBuilder.group({
      query: [''],
      range: formBuilder.group({
        start: [null],
        end: [null],
      }),
    });

    /* These items need to be placed in the constructor, as the 'day' input binding runs before ngOnInit, which means
     * that the current day property supplied by parent components would not be included on the initial subscription
     * execution of the _search$ subject in ngOnInit */
    this.dateRangeControl.valueChanges.subscribe((val) => {
      this.dayChange.emit(val);
    });

    /* Whenever the day input binding changes, or whenever the user interacts with the form, we will need to update our query parameters
     * to reflect our query parameters to reflect the changed value. */
    merge(
      this._dayInput$.asObservable().pipe(
        /* Filter out any cases where the inbound date value is equivalent to that of the date range selector */
        filter((dateRange) => !isEqual(dateRange, this.dateRangeControl.value)),

        /* Whenever the day value updates from the input binding, we will need to update the date range control as well... however,
         * since we have logic specifically tied to the in-form adjustment of the date range control, this activity must not emit
         * a change event. */
        tap((dateRange) => {
          this.dateRangeControl.setValue(dateRange, { emitEvent: false });
        }),

        /* Map the updated day to the entire updated form. */
        map(() => this.formGroup.value)
      ),
      this.formGroup.valueChanges
    ).subscribe((value) => {
      this._setQueryParameters(value);
    });
  }

  get search() {
    return this.formGroup.get('query');
  }

  get dateRangeControl(): FormGroup {
    return this.formGroup.get('range') as FormGroup;
  }

  ngOnInit(): void {
    if (!this.day) {
      throw new TypeError("The input 'day' must an instance of Date or DateRange.");
    }

    /* The data we display will be the result of the ListFilterContainerDirective component's filtering against the retrieved
     * appointment rows.  Therefore, we will use an observable supplied by the aforementioned directive as our effective
     * output stream. */
    this.data$ = this.listFilterContainerDirective
      .getDataStream(
        this.paramsSubject$.asObservable().pipe(
          tap(() => (this.scrollDisabled = true))
          // shareReplay(),
        ),
        (filterSets) => {
          /* If the onFilterChange callback is not supplied, or if it is supplied and the invocation returns true, we must initiate
           * a refresh on the current data set by updating the API parameters set (this mechanism effectively prevents
           * ListFilterContainerDirective from refreshing the linked data set on filter change - we handle refreshing the linked data set by
           * pushing an update through the API parameters vector, which allows us to avoid double-invocations of the API) */
          if (!this.options || !this.options.onFilterChange || this.options.onFilterChange(filterSets)) {
            this.load();
          }

          /* Returning false indicates that the filter update itself will not trigger a data refresh - this will come from the parameters
           * observable. */
          return false;
        }
      )
      .pipe(
        catchError(() =>
          of({
            result: {
              data: [],
              total: 0,
            },
            params: {
              offset: 0,
            },
            filters: [],
          })
        ),

        scan(
          (accumulator: { collectedResults: AppointmentEntity[]; lastResponse: PagedResponseDto<AppointmentEntity> }, responseDetails) => {
            /* If the response indicates a null result, that means that a retrieval operation is in progress - take this as a cue to
             * clear the accumulator, as we will need to clearly indicate on the UI that an operation is in progress. */
            if (!responseDetails.result) {
              accumulator.collectedResults = null;
            } else {
              /* If the response has a non-zero offset, we will need to set the accumulator accordingly. */
              accumulator.collectedResults =
                responseDetails.params.offset && parseInt(responseDetails.params.offset, 10)
                  ? append(accumulator.collectedResults, responseDetails.result.data)
                  : responseDetails.result.data;
              this._total = responseDetails.result.total || 0;

              /* Re-enable the ability to scroll... */
              this.scrollDisabled = false;

              accumulator.lastResponse = responseDetails.result;
            }

            return accumulator;
          },
          { collectedResults: [], lastResponse: null }
        ),

        switchMap((resultsDescriptor) => {
          /* Update the operating observable to one that additionally emits whenever the view mode is toggled. */
          return combineLatest([
            of(resultsDescriptor),
            // as is required to keep IntelliJ from thinking that we're using a deprecated signature (any could be inferred as SchedulerLike)
            this.toggleControl.valueChanges.pipe(startWith(this.toggleControl.value as ViewModes)),
          ]);
        }),

        tap((emissions) => {
          const resultsDescriptor = emissions[0];
          const viewMode: ViewModes = emissions[1];

          /* If the current display mode is the map view, and the fetch response indicates that additional results are available
           * beyond the current response set, we will need to re-invoke the API retrieval to retrieve all results. */
          if (
            viewMode === ViewModes.MapView &&
            resultsDescriptor.collectedResults &&
            resultsDescriptor.lastResponse.total > resultsDescriptor.collectedResults.length
          ) {
            this.load(resultsDescriptor.collectedResults.length);
          }
        }),

        map((resultsDescriptor) => resultsDescriptor[0].collectedResults),

        /* Share this observable so that toggling in between the map and list views doesn't result in a potentially unnecessary
         * invocation. */
        shareReplay()
      );

    this._search$
      .pipe(
        distinctUntilChanged(),
        debounce((params) => (params === null || params.instant ? EMPTY : timer(400)))
      )
      .subscribe(() => {
        this.load();
      });

    this.load();
  }

  load(offset?: number): void {
    if (!this.scrollDisabled) {
      this.scrollDisabled = true;

      const search = this._search$.getValue();

      const params = {
        limit: String(25),
        /* If offset is not defined, set the offset value to 0 */
        offset: String(typeof offset === 'number' ? offset : 0),
        search: search.query,
        range: encodeURIComponent(
          JSON.stringify({
            startDate: format(search.range.start, 'yyyy-MM-dd'),
            endDate: search.range.end ? format(search.range.end, 'yyyy-MM-dd') : undefined,
          })
        ),
      };

      this.paramsSubject$.next(
        Object.keys(params).reduce((collector, paramKey) => {
          if (!isNil(params[paramKey])) {
            collector[paramKey] = params[paramKey];
          }

          return collector;
        }, {})
      );
    }
  }

  /**
   * Triggers an API invocation with the result of the supplied parameters set that extends upon the
   * existing parameters set (i.e. in cases where the params object includes property keys that are
   * undefined, the value from the existing parameters set will survive).
   */
  private _setQueryParameters(params: AppointmentSearchParams) {
    this._search$.next({
      /* Undefined values will be filtered out of the params set; we will retain the last-known values for these items. */
      ...this._search$.value,
      ...Object.keys(params || {}).reduce((collector, paramKey) => {
        if (typeof params[paramKey] !== 'undefined') {
          collector[paramKey] = params[paramKey];
        }

        return collector;
      }, {}),
    });
  }

  /**
   * Triggers an API invocation with the result of the supplied parameters set that extends upon the
   * existing parameters set (i.e. in cases where the params object includes property keys that are
   * undefined, the value from the existing parameters set will survive).
   */
  setQueryParameters(params: AppointmentSearchParams) {
    params = params || {};

    /* Update the query controls with the updated parameters set. */
    this.formGroup.patchValue(filterFalsy(params), { emitEvent: false });

    /* Delegate to the private setQueryParams to handle actually invoking the next subject value. */
    this._setQueryParameters(params);
  }

  onScroll(rows: number) {
    if (rows < this._total) {
      this.load(rows);
    }
  }

  isColumnVisible(column: AppointmentTableColumn): boolean {
    return this.columns.includes(column);
  }

  /**
   * Simple abstraction to the same-named method on the embedded instance of ListFilterContainerDirective
   */
  setFilterOption<T = any>(filterCriterion: FilterCriterion<T, AppointmentEntity>, option: T) {
    this.listFilterContainerDirective.setFilterOption(filterCriterion, option);
  }

  /**
   * Simple abstraction to the same-named method on the embedded instance of ListFilterContainerDirective
   */
  unsetFilterOption<T = any>(filterCriterion: FilterCriterion<T, AppointmentEntity>, option: T) {
    this.listFilterContainerDirective.unsetFilterOption(filterCriterion, option);
  }

  ngOnDestroy(): void {
    /* Destroy all filter criteria */
    this.filterCriteria.destroyAll();
  }
}
