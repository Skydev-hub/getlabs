import { AfterContentInit, ContentChildren, Directive, Host, Input, OnDestroy, OnInit, QueryList } from '@angular/core';
import { GoogleMap, MapMarker } from '@angular/google-maps';
import { BehaviorSubject, combineLatest, Observable, of, ReplaySubject, Subscription } from 'rxjs';
import { distinctUntilKeyChanged, filter, map, shareReplay, startWith, switchMap, take } from 'rxjs/operators';
import { max, min } from '../utils/math.utils';

const BoundPresets = {
  'ContiguousUsa': { east: -66.94, west: -124.39, north: 49.38, south: 25.82 },
};

type MapBounds = google.maps.LatLngBoundsLiteral | keyof typeof BoundPresets | true;

/**
 * Directive that assists with setting various properties of the google-map component in a consumer-friendly manner.  This
 * directive supports the configuration of the 'bounds' and 'zoom' properties with a few enhancements that make it
 * increasingly useful.
 *
 * For 'bounds', consumers may supply either of the below values:
 * - LatLngBoundsLiteral - object literal that defines the boundaries to be set by the map.
 * - Presets (string) - preset bound values that reflect commonly-used boundaries.  The only possible values is
 * 'ContiguousUsa' - sets the bounds to contain the entire contiguous USA
 * - true (boolean) - Automatically calculate the bounds to contain all of the MapMarker instances set as child elements
 * of the consuming google-map component.
 *
 * For 'zoom', consumers may specify an integer directly indicating the zoom level (see
 * https://developers.google.com/maps/documentation/javascript/reference/map for more information on acceptable values).
 *
 * If both 'bounds' and 'zoom' are set, this directive will first apply the supplied bounds, then adjust the zoom level
 * to the supplied value.
 */
@Directive({
  selector: '[appGoogleMapsOptionExt]'
})
export class GoogleMapsOptionsExtDirective implements OnInit, AfterContentInit, OnDestroy {

  @ContentChildren(MapMarker)
  public mapMarkers: QueryList<MapMarker>;

  @Input()
  public set bounds(bounds: MapBounds) {
    /* Don't bother setting bounds if this value is undefined. */
    if (!bounds) {
      return;
    }

    this.bounds$.next(bounds);
  }

  public get bounds() {
    /* Convert to a LatLngBoundsLiteral object as applicable. */
    const bounds = this.googleMap.getBounds();

    return bounds && {
      north: bounds.getNorthEast().lat(),
      east: bounds.getNorthEast().lng(),
      south: bounds.getSouthWest().lat(),
      west: bounds.getSouthWest().lng(),
    };
  }

  @Input()
  public set zoom(zoom: number) {
    /* Set the zoom level on the embedded map instance (the angular wrapper does not expose setZoom) when
     * the map is ready. */
    this.zoom$.next(zoom);
  }

  public get zoom() {
    return this.googleMap.zoom;
  }

  private readonly mapInit$: Observable<void>;

  private readonly bounds$: ReplaySubject<MapBounds> = new ReplaySubject<MapBounds>();

  private readonly zoom$: BehaviorSubject<number> = new BehaviorSubject<number>(null);

  private readonly subscriptions: Subscription[] = [];

  constructor(@Host() private readonly googleMap: GoogleMap) {
    this.mapInit$ = this.googleMap.idle.pipe(
      take(1),
      shareReplay(1),
    );
  }

  ngOnInit(): void {
    this.subscriptions.push(this.zoom$.pipe(
      /* Only react to actual number values... */
      filter(val => typeof val === 'number'),
    ).subscribe(val => this.googleMap.googleMap.setZoom(val)));
  }

  ngAfterContentInit(): void {
    /* Emit a value from markerInit$ to indicate that the markers can now be safely queried (via their
     * corresponding observable). */
    this.subscriptions.push(combineLatest([this.bounds$, this.mapInit$]).pipe(
      /* Ensures that we wait until both values are populated until we emit an event, but that further emissions
       * are only predicated on changes in the bounds$ observable. */
      distinctUntilKeyChanged(0),

      /* Remove the void value emitted by mapInit$ */
      map(([bounds, _void]) => {
        return bounds;
      }),

      /* Create an inner observable that handles the meat of creating a LatLngBoundsLiteral value.  We use switchMap
       * to ensure that only one bounds observable operation is occurring at a time, which is especially useful in
       * cases where new bounds values are emitted, but we're waiting for map markers to become available */
      switchMap(bounds => bounds === true ?
        /* Inner observable waits for markers to become available, and creates dynamic bounds based on the
         * resolved locations. */
        this.mapMarkers.changes.pipe(
          /* Does not emit current value on subscribe */
          startWith(this.mapMarkers),

          /* Only consider cases where we have at least one marker */
          filter(markers => !!markers.length),

          /* Map the resolved marker locations into bounds */
          map((markers: QueryList<MapMarker>) => markers.reduce((collector: google.maps.LatLngBoundsLiteral, mapMarker) => {
              /* Deliberately initialized on first iteration to allow fallthough logic to execute should the
               * tracked set of markers be 0. */
              collector = collector || { east: null, west: null, north: null, south: null };

              collector.east = max(mapMarker.getPosition().lng(), collector.east);
              collector.west = min(mapMarker.getPosition().lng(), collector.west);
              collector.north = max(mapMarker.getPosition().lat(), collector.north);
              collector.south = min(mapMarker.getPosition().lat(), collector.south);

              return collector;
            }, null)
          ),

        ) : of(typeof bounds === 'string' ? BoundPresets[bounds] : bounds)
      )
    ).subscribe(bounds => {
      this.googleMap.fitBounds(bounds);

      /* If the zoom is set, we will need to re-apply the zoom value here */
      if (typeof this.zoom$.value === 'number') {
        this.zoom$.next(this.zoom$.value);
      }
    }));
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
