import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { ActivatedRoute, Router } from '@angular/router';
import { LabCompany, LabLocationEntity, LabLocationService, Markets, PagedResponseDto, PlacesService } from '@app/ui';
import { PlaceAutocompleteResult } from '@google/maps';
import { Position } from 'geojson';
import { isEqual } from 'lodash-es';
import { Observable, of, Subject } from 'rxjs';
import { catchError, debounceTime, share, startWith, switchMap, takeUntil, tap } from 'rxjs/operators';
import { LabCompanyMetaService } from '../providers/lab-company-meta/lab-company-meta.service';

const Phoenix: Position = Markets.Phoenix;

@Component({
  templateUrl: './labs-page.component.html',
  styleUrls: ['./labs-page.component.scss'],
})
export class LabsPageComponent implements OnInit, OnDestroy {
  // Location for the default location or user's location if they give it to us
  location: Position = Phoenix;

  // Specifies which lab company to tailer the page to
  lab: LabCompany;

  address = new FormControl();

  autocomplete$: Observable<PlaceAutocompleteResult[]> = null;

  locations$: Observable<PagedResponseDto<LabLocationEntity>>;

  currentLocation$: Subject<{ lat: number; lng: number }> = new Subject();

  tab: 'list' | 'map' = 'list';

  LabCompany = LabCompany;

  private unsubscribe$ = new Subject<void>();

  constructor(
    private readonly placesService: PlacesService,
    private readonly labLocationService: LabLocationService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly labCompanyMeta: LabCompanyMetaService
  ) {}

  ngOnInit(): void {
    this.route.data.pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe(data => {
      this.lab = data.lab;
      this.updateLabs(Phoenix[0], Phoenix[1]);

      /* Update meta details for the corresponding lab (or lack thereof) */
      this.labCompanyMeta.setMeta(this.lab);
    });

    this.autocomplete$ = this.address.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      switchMap(value => {
        if (value !== '') {
          return this.autocomplete(value);
        } else {
          this.updateLabs(Phoenix[0], Phoenix[1]);
          return of(null);
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  goToLocation(location: LabLocationEntity) {
    this.router.navigateByUrl(`/labs/${location.lab}/${location.slug}`);
  }

  useBrowserLocation() {
    navigator.geolocation.getCurrentPosition(
      position => {
        this.address.setValue(null);
        this.updateLabs(position.coords.latitude, position.coords.longitude);
        this.currentLocation$.next({ lat: position.coords.latitude, lng: position.coords.longitude });
      },
      () => {
        console.warn('Unable to retrieve location data');
      }
    );
  }

  autocomplete(address: string) {
    return this.placesService.autocomplete(address).pipe(
      catchError((_) => {
        return of(null);
      })
    );
  }

  getAutocompleteAddressLabel(result: PlaceAutocompleteResult): string {
    return result && result.description ? result.description : '';
  }

  onSelectedAutocompleteAddress(event: MatAutocompleteSelectedEvent) {
    const result: PlaceAutocompleteResult | 'my-location' = event.option.value;

    if (result) {
      if (result === 'my-location') {
        this.useBrowserLocation();
      } else {
        this.placesService.place(result.place_id).subscribe((place) => {
          const coordinates = place.geometry.location;
          this.updateLabs(coordinates.lat, coordinates.lng);
          this.currentLocation$.next({ lat: coordinates.lat, lng: coordinates.lng });
        });
      }
    } else {
      this.updateLabs(Phoenix[0], Phoenix[1]);
    }
  }

  updateLabs(lat: number, lng: number) {
    this.locations$ = this.labLocationService
      .list({
        limit: isEqual([lat, lng], Phoenix) ? '150' : '10',
        lab: this.lab ? this.lab : [LabCompany.LabCorp, LabCompany.SonoraQuest, LabCompany.QuestDiagnostics],
        near: [lat, lng].join(',')
      })
      .pipe(
        share(),
        tap(() => {
          this.location = [lat, lng];
        })
      );
  }

  getIconUrl(lab: LabCompany): string {
    switch (lab) {
      case LabCompany.LabCorp:
        return '/assets/icons/location-pin-icon-labcorp.svg';
      case LabCompany.SonoraQuest:
        return '/assets/icons/location-pin-icon-sonora-quest.svg';
      case LabCompany.QuestDiagnostics:
        return '/assets/icons/location-pin-icon-quest-diagnostics.svg';
      default:
        return undefined;
    }
  }
}
