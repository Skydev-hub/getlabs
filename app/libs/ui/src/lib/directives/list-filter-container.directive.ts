import { Directive, Input, OnInit, Type } from '@angular/core';
import { BehaviorSubject, combineLatest, merge, Observable, of, partition, Subscription } from 'rxjs';
import { filter, map, pairwise, scan, shareReplay, switchMap } from 'rxjs/operators';
import { isEqual, clone, isNil, castArray } from 'lodash-es';
import { PagedResponseDto } from '../models';
import { CrudService } from '../services';
import { CrudResolverService } from '../services/crud-resolver.service';

export interface FilterCriterionOptions<T = any> {
  logicOperation?: 'AND' | 'OR';
  options?: T[] | Observable<T[]>;
  comparator?: (objPropVal: T, filterVal: T) => boolean;
  getQueryVal?: (obj: T) => any;
  anchorLabel?: string;
}

export class FilterCriterion<T, K> {
  public selectedValue: T;
  public options$: Observable<T[]>;

  private _optionsSubject$ = new BehaviorSubject<T[]>([]);
  private _subscriptions: { [key: string]: Subscription } = {};

  constructor(
    private _filterableValue: ((obj: K) => T | T[]) | keyof K,
    public getLabel: (obj: T) => string,
    protected filterCriterionOptions: FilterCriterionOptions<T> = {}
  ) {
    /* Set the filtering options according to a merged result of the supplied values and our defaults. */
    this.filterCriterionOptions = {
      logicOperation: 'OR',
      ...this.filterCriterionOptions,
    };

    this.options$ = this._optionsSubject$.asObservable();

    /* Subscribe to the options observable internally, so that we can keep a single avenue present of updating the internally-maintained
     * set of options. */
    this._subscriptions.optionsSub = this.options$.subscribe(() => {
      /* If the currently-selected option is found within the supplied set, we should ensure that it remains selected. */
      this.selectedValue = this._optionsSubject$.value.find(option => isEqual(option, this.selectedValue));
    });

    /* If the consumer has supplied a default set of options, initialize those now. */
    if (this.filterCriterionOptions.options) {
      this.setOptions(this.filterCriterionOptions.options);
    }
  }

  public clear() {
    this.selectedValue = null;
  }

  public setOptions(value: T[] | Observable<T[]>) {
    /* If an existing options subscription exists, unsubscribe now. */
    if (this._subscriptions.optionsInputSub) {
      this._subscriptions.optionsInputSub.unsubscribe();
    }

    this._subscriptions.optionsInputSub = (value instanceof Observable ? value : of(value))
      .subscribe(options => this._optionsSubject$.next(options || []));
  }

  /**
   * To be used by front-end-based filtering implementations
   */
  public updateOptions(objs: K[]): void {
    const res = objs.reduce((collector: T[], obj) => {
      /* Extract the filterable values from the filterable object */
      const filterableVal: T[] = this.getFilterableValue(obj) || [];

      /* Determine if these value already exists in the collector.  If not - add them... */
      filterableVal.forEach(val => {
        if (!collector.find(collected => isEqual(val, collected))) {
          collector.push(val);
        }
      });

      return collector;
    }, []);

    /* Update the set of filter options with the retrieved set of filterable values. */
    this.setOptions(res);
  }

  public getFilterableValue(obj: K): T[] {
    const filterableValue = typeof this._filterableValue === 'function' ?  this._filterableValue(obj) : obj[this._filterableValue as string];
    return !isNil(filterableValue) ? castArray(filterableValue) : null;
  }

  public getLogicOperation() {
    return this.filterCriterionOptions.logicOperation;
  }

  public matchesFilter(obj: K, appliedOptions: T[]) {
    /* If the consumer has requested that this filter's selected options be applied in an 'AND' manner, then we should use the 'every' array
     * assessment method over some. */
    const operation = this.getLogicOperation() === 'AND' ? Array.prototype.every : Array.prototype.some;

    return !appliedOptions.length || operation.call(appliedOptions, option => this._matchesFilter(obj, option));
  }

  public getEntityFieldName(): string {
    return typeof this._filterableValue === 'string' ? this._filterableValue : null;
  }

  public getQueryValue(filterableValue: T) {
    /* If the consumer has specified a getQueryVal option method, then we will invoke that method to translate the supplied
     * filterableValue into a RPC-friendly value. */
    return this.filterCriterionOptions.getQueryVal ? this.filterCriterionOptions.getQueryVal(filterableValue) : filterableValue;
  }

  public destroy() {
    Object.values(this._subscriptions).forEach(subscription => subscription.unsubscribe());
  }

  public getAnchorLabel() {
    return (this.filterCriterionOptions && this.filterCriterionOptions.anchorLabel) || null;
  }

  protected _matchesFilter(obj: K, filterVal: T) {
    const objCoercedFilterVals = this.getFilterableValue(obj);

    return !!objCoercedFilterVals && objCoercedFilterVals.some(objCoercedFilterVal => {
      return this.filterCriterionOptions.comparator ?
        this.filterCriterionOptions.comparator(objCoercedFilterVal, filterVal) : isEqual(objCoercedFilterVal, filterVal);
    });
  }
}

/**
 * Describes a single complex criterion property value
 */
interface ComplexFilterCriterionValueProperty<K> {
  value: any[] | any;
  comparator?: (objPropVal: any, filterVal: any) => boolean;
}

/**
 * Local object type for generally describing the object hierarchy forming the resulting filters
 */
interface StagedFilters {
  [key: string]: Set<any> | StagedFilters;
}

/**
 * Describes multiple complex criterion values for a single criterion on a given entity.
 */
export type ComplexFilterCriterionValuesProperties<K> = {
  [key in keyof K]?: ComplexFilterCriterionValueProperty<K> | ComplexFilterCriterionValuesProperties<any>;
}

/**
 * Container type for describing the available options for a single criterion on a given entity, with a label to provide
 * user-friendly strings.
 */
export interface ComplexFilterCriterionValues<K> {
  properties: ComplexFilterCriterionValuesProperties<K>;
  label?: string;
}

/**
 * Extension of FilterCriterionOptions to add options that are relevant to complex filter criteria
 */
export interface ComplexFilterCriterionOptions<T> extends FilterCriterionOptions<T> {
  showAllOptions?: boolean;
}

/**
 * One key difference between ComplexFilterCriterion and FilterCriterion - the various options are known before ComplexFilterCriterion
 * is created, while the various options are not known before FilterCriterion is created.  Thus, all displayed options of
 * ComplexFilterCriterion must be a subset of the options initially supplied to its constructor.
 */
export class ComplexFilterCriterion<K> extends FilterCriterion<ComplexFilterCriterionValues<K>, K> {
  constructor(
    protected allOptions: ComplexFilterCriterionValues<K>[],
    options?: ComplexFilterCriterionOptions<ComplexFilterCriterionValues<K>>
  ) {
    super((obj: K) => {
        /* Iterate through the set of filter options, and attempt to find an option that lines up with the given object. */
        return this.allOptions.filter(filterOption => {
          /* For each filter option, we shall inspect the properties map set and determine if the supplied object's values at the
           * corresponding keys are congruent. */
        return Object.keys(filterOption.properties).every(propertyName => {
          const filterPropertyDef: ComplexFilterCriterionValueProperty<K> = filterOption.properties[propertyName];

          return Array.isArray(filterPropertyDef.value) ?
            filterPropertyDef.value.some(filterPropertyValue => this.__matchesProperty(obj[propertyName], filterPropertyValue, filterPropertyDef.comparator)) :
            this.__matchesProperty(obj[propertyName], filterPropertyDef.value, filterPropertyDef.comparator);
        })
      });
    },
      filterOption => filterOption.label,
      {
        logicOperation: 'AND',
          ...options,
      });

    /* If showAllOptions is specified as part of the supplied option set, instantiate it now. */
    if (options && options.showAllOptions) {
      this.setOptions(this.allOptions);
    }
  }

  public setOptions(value: ComplexFilterCriterionValues<K>[] | Observable<ComplexFilterCriterionValues<K>[]>) {
    /* The supplied options must be a subset of those supplied to this class' constructor. */
    super.setOptions((value instanceof Observable ? value : of(value)).pipe(
      map(filterOptions => filterOptions.filter(filterOption =>
        /* Filter out all options that do not appear in the set of options supplied with the class constructor */
        this.allOptions.some(configFilterOption =>
          isEqual(configFilterOption, filterOption)
      )))
    ));
  }

  private __matchesProperty(objPropVal: any, filterPropVal: any, comparator?: (objPropVal: any, filterPropVal: any) => boolean) {
    return comparator ? comparator(objPropVal, filterPropVal) : isEqual(objPropVal, filterPropVal);
  }
}

export class FilterCriteria<T,C extends FilterCriterion<any, T> = FilterCriterion<any, T>> {

  *[Symbol.iterator](): Iterator<C> {
    for (const objKey of Object.keys(this)) {
      if (this[objKey] instanceof FilterCriterion) {
        yield this[objKey];
      }
    }
  }

  public clearAll() {
    this.forEach(criterion => criterion.clear());
  }

  /**
   * To be used by front-end-based filtering implementations
   * @param obj
   */
  public updateCriteria(obj: T[]) {
    this.forEach(criterion => criterion.updateOptions(obj));
  }

  public forEach(cb: (criterion: C) => void) {
    for (const criterion of this) {
      cb(criterion);
    }
  }

  public addCriterion<K>(filterableValue: ((obj: T) => K) | keyof T, getLabel: (obj: K) => string, name = Object.keys(this).length.toString()) {
    this[name] = new FilterCriterion<K, T>(filterableValue, getLabel);
  }

  public destroyAll() {
    for (const criterion of this) {
      criterion.destroy();
    }
  }
}

export interface FilterSet<T, K> {
  criterion: FilterCriterion<T, K>;
  appliedOptions: T[];
}

export interface FilterResult<T,K> {
  result: PagedResponseDto<K>,
  params?: {
    [key: string]: any,
  }
  filters: FilterSet<T,K>[],
}


@Directive({
  selector: '[appListFilterContainer]'
})
export class ListFilterContainerDirective<T, K extends object> implements OnInit {

  constructor(private readonly crudResolverService: CrudResolverService) {}

  @Input()
  public type: Type<K>;

  private service: CrudService<K>;

  private _filtersSubject$ = new BehaviorSubject<FilterSet<T, K>[]>([]);
  private _filters$ = this._filtersSubject$.asObservable().pipe(shareReplay());

  ngOnInit(): void {
    /* Resolve the service corresponding to the tracked entity. */
    this.service = this.crudResolverService.getService(this.type);
  }

  getDataStream(paramStream$: Observable<{[key: string]: any} | K[]>,
                onFilterChange?: (filterSet: FilterSet<T,K>[]) => boolean,
  ): Observable<FilterResult<T,K>> {
    const [local, remote] = partition(combineLatest([
      paramStream$,
      this._filters$,
    ]), emission => {
      /* Array indicates that the consumer needs to manipulate local data. */
      return Array.isArray(emission[0]);
    });

    /* Type declaration required as the disambiguated type is embedded within the observable. The partition static operator above provides
     * the appropriate disambiguation for us. */
    return merge(this.configLocalStream(local as Observable<[K[], FilterSet<T,K>[]]>), this.configRemoteStream(remote, onFilterChange));
  }

  private convertSets(stagedFilters: StagedFilters, collector = {}) {
    /* Scan through each property on the current object level, and determine if we can convert it directly to an array, or if we need to
     * recurse a bit deeper into the object */
    Object.keys(stagedFilters).forEach(stagedFiltersKey => {
      const stagedFilter = stagedFilters[stagedFiltersKey];

      /* Instance of a set - transform this into an array immediately. */
      if (stagedFilter instanceof Set) {
        collector[stagedFiltersKey] = Array.from(stagedFilter);
        return;
      }

      /* Instance of StagedFilters - recurse into the object accordingly. */
      collector[stagedFiltersKey] = {};
      this.convertSets(stagedFilter, collector[stagedFiltersKey]);
    });

    return collector;
  }

  private configLocalStream(changeStream$: Observable<[K[], FilterSet<T,K>[]]>): Observable<FilterResult<T,K>> {
    return changeStream$.pipe(
      /* Every time the supplied source observable emits a new set of values, we need to apply the known filtering criteria
       * to the supplied vals... */
      map(emission => {
        const vals = emission[0];
        const filters = emission[1];

        /* If no filters are set, or no data is available, there is no need to assess further... */
        if (!filters.length || !vals || !vals.length) {
          return {
            result: {
              data: vals,
              total: (vals ? vals.length : 0)
            },
            filters,
          }
        }

        return {
          result: {
              data: vals && vals.filter(val => {
              /* Need to check each row against each filter criteria. */
              return filters.every(filterSet => {
                /* Each filter criteria defines the set of objects that are selected - compare the row against the selected objects. */
                return filterSet.criterion.matchesFilter(val, filterSet.appliedOptions);
              });
            }),
            total: (vals ? vals.length : 0),
          },
          filters,
        }
      })
    );
  }

  private configRemoteStream(
    changeStream$: Observable<[{ [key: string]: any }, FilterSet<T,K>[]]>,
    onFilterChanged?: (filters: FilterSet<T,K>[]) => boolean
  ): Observable<FilterResult<T,K>> {
    /* Every time the supplied source observable emits a new set of values, we need to apply the known filtering criteria
     * to the supplied vals... */
    return changeStream$.pipe(
      scan((
        emissionSet: { previous: [{ [key: string]: any }, FilterSet<T,K>[]], current: [{ [key: string]: any }, FilterSet<T,K>[]] },
        emission
      ) => {
        /* Update the next/previous fields as appropriate */
        emissionSet.previous = emissionSet.current;
        emissionSet.current = emission;

        return emissionSet;
      }, { previous: null, current: null }),
      filter(emissionsSet => {
        /* We are specifically interested in whether or not the applied filters have changed.  If they have, we will need to invoke the
         * onFilterChanged callback before proceeding, the result of which will determine whether we should continue or we should
         * stop execution. */
        return !emissionsSet.previous || isEqual(emissionsSet.previous && emissionsSet.previous[1], emissionsSet.current[1]) ||
          !onFilterChanged || onFilterChanged(emissionsSet.current[1]);
      }),

      map(emissionsSet => emissionsSet.current),

      switchMap(emission => {
        const params = emission[0];
        const filters = emission[1];

        const transactionDetails = {
          params,
          filters
        };

        /* The result will be the outcome of invoking the appropriate crud query for the bound service. */
        return of({
          transaction: null,
          ...transactionDetails
        }, {
          transaction: this.service.list(params, {
            filters: this.convertSets(filters.reduce((collector: { [key: string]: Set<any> }, filterSet) => {

              filterSet.appliedOptions.forEach((appliedOption: (ComplexFilterCriterionValues<K> | any)) => {
                /* Retrieve the entity keys that will map to the values set by this filter set.  If the filter set criterion is
                 * an instance of ComplexFilterCriterion, then we can potentially be dealing with multiple keys. */
                const appliedOptionProps: ComplexFilterCriterionValuesProperties<K> = filterSet.criterion instanceof ComplexFilterCriterion ?
                  appliedOption.properties :
                  (filterSet.criterion.getEntityFieldName() && {
                    [filterSet.criterion.getEntityFieldName()]: {
                      value: appliedOption
                    }
                  }) || {};

                const __populateObjectProperties = (objCollector, appliedFilterOptionValuesProps: ComplexFilterCriterionValuesProperties<K>) => {
                  /* Iterate through the supplied values set to translate each value to a corresponding queryable value. */
                  Object.keys(appliedFilterOptionValuesProps).forEach(appliedFilterOptionValuePropKey => {
                    const appliedFilterOptionValueProp: ComplexFilterCriterionValueProperty<K> | ComplexFilterCriterionValuesProperties<K> =
                      appliedFilterOptionValuesProps[appliedFilterOptionValuePropKey];

                    /* If no entry for the specified property exists, create one now. */
                    if (!objCollector[appliedFilterOptionValuePropKey]) {
                      objCollector[appliedFilterOptionValuePropKey] = new Set();
                    }

                    /* If the value property is an embedded object, we will need to recurse into that in order to populate its embedded
                     * filter criteria accordingly */
                    if (!this.isComplexPropertyValue(appliedFilterOptionValueProp)) {
                      /* Sets are only appropriate for non-embedded cases... */
                      objCollector[appliedFilterOptionValuePropKey] = objCollector[appliedFilterOptionValuePropKey] instanceof Set ?
                        {} : objCollector[appliedFilterOptionValuePropKey];

                      __populateObjectProperties(objCollector[appliedFilterOptionValuePropKey], appliedFilterOptionValueProp);
                    } else {
                      /* Otherwise, we are dealing with a defined end value, and will populate it in the resulting field accordingly */
                      castArray(appliedFilterOptionValueProp.value).forEach(appliedFilterValue => {
                        objCollector[appliedFilterOptionValuePropKey].add(filterSet.criterion.getQueryValue(appliedFilterValue));
                      });
                    }
                  });
                };

                __populateObjectProperties(collector, appliedOptionProps);
              });

              return collector;
            }, {}))
          }),
          ...transactionDetails
        });
      }),
      filter(transactionDetails => {
        return !!transactionDetails.transaction || (!transactionDetails.params.offset || !parseInt(transactionDetails.params.offset, 10))
      }),
      switchMap(transactionDetails => (transactionDetails.transaction || of(null)).pipe(
        map(result => {
          return {
            result,
            params: transactionDetails.params,
            filters: transactionDetails.filters,
          }
        })
      )),
    );
  }

  private isComplexPropertyValue(
    obj: ComplexFilterCriterionValuesProperties<K> | ComplexFilterCriterionValueProperty<K>
  ): obj is ComplexFilterCriterionValueProperty<K> {
    return typeof obj === 'object' && typeof (obj as ComplexFilterCriterionValueProperty<K>).value !== 'undefined'
  }

  setFilterOption(criterion: FilterCriterion<T, K>, option: T) {
    /* Find the entry corresponding to the supplied criterion. */
    let filterEntry = clone(this.getFilterSet(criterion));

    /* This operation will constitute a change in the set filters, which is expressed as a new emission from the
     * filters subject.  As a result, we need to shallow clone the filters set. */
    const filters = this._filtersSubject$.value.slice();

    /* If no filter entry for the supplied filter is found, we need to add one... */
    if (!filterEntry) {
      filterEntry = { criterion, appliedOptions: [] };
      filters.push(filterEntry);
    }

    /* If the supplied option is not already in the filter set, add it now. */
    if (!filterEntry.appliedOptions.includes(option)) {
      filterEntry.appliedOptions = filterEntry.appliedOptions.concat([option]);
    }

    filters[filters.findIndex(filterSet => isEqual(criterion, filterSet.criterion))] = filterEntry;

    this._filtersSubject$.next(filters);
  }

  unsetFilterOption(criterion: FilterCriterion<T, K>, option: T) {
    /* First, find the filter set corresponding to the supplied criterion. */
    const filterEntry = clone(this.getFilterSet(criterion));

    /* If the filter set could be retrieved, attempt to remove the supplied option from the defined set. */
    if (!filterEntry) {
      return;
    }

    const idx = filterEntry.appliedOptions.findIndex(appliedOption => appliedOption === option);

    if (idx > -1) {
      filterEntry.appliedOptions = filterEntry.appliedOptions.slice();
      filterEntry.appliedOptions.splice(idx, 1);
    }

    /* Shallow clone the filter collection, and apply the updated criterion. */
    const filters = this._filtersSubject$.value.slice();

    /* If the removal action resulted in entirely clearing this filter set criterion's options, remove the filter entry from the tracked
     * set. */
    Array.prototype.splice.apply(filters, [
      filters.findIndex(filterSet => isEqual(criterion, filterSet.criterion)),
      1,
      ...(filterEntry.appliedOptions.length ? [filterEntry] : [])
    ]);

    /* Change in filters - emit a new filter collection (via a shallow-copy). */
    this._filtersSubject$.next(filters);
  }

  getFilterSets$(): Observable<FilterSet<T, K>[]> {
    return this._filters$;
  }

  isSet(criterion: FilterCriterion<T, K>, option: T) {
    /* Retrieve the set of filters corresponding to the supplied criterion */
    const filterSet = this.getFilterSet(criterion);

    /* Evaluate whether or not the supplied option is set */
    return !!filterSet && filterSet.appliedOptions.some(selectedOption => isEqual(selectedOption, option));
  }

  getFilterChanges$(criterion: FilterCriterion<T, K>) {
    /* Create a new observable that emits whenever the supplied filter criterion changes. */
    return this._filtersSubject$.asObservable().pipe(
      pairwise(),
      filter((filterVals) =>  {
        /* Extract the current/previous filter sets from the filterable value. */
        const previousFilterSet = this.getFilterSet(criterion, filterVals[0]);
        const currentFilterSet = this.getFilterSet(criterion, filterVals[1]);

        /* Compare the two filter sets recursively. */
        return !isEqual(previousFilterSet, currentFilterSet);
      }),
      map(comparableFilters => this.getFilterSet(criterion, comparableFilters[1]).appliedOptions)
    );
  }

  private getFilterSet(criterion: FilterCriterion<T, K>, filterSets?: FilterSet<T, K>[]) {
    return (filterSets || this._filtersSubject$.value).find(filterSet => filterSet.criterion === criterion);
  }
}
