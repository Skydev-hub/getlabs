import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LabCompany, LabLocationDetails, LabLocationEntity, LabLocationService, PagedResponseDto } from '@app/ui';
import { OpeningPeriod } from '@google/maps';
import { addDays, getISODay } from 'date-fns';
import { Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { LabCompanyMetaService } from '../../providers/lab-company-meta/lab-company-meta.service';

enum OpenStatus {
  Open,
  Closed,
  NotAvailable,
}

@Component({
  templateUrl: './location-details-page.component.html',
  styleUrls: ['./location-details-page.component.scss'],
})
export class LocationDetailsPageComponent implements OnInit, OnDestroy {
  location: LabLocationDetails;

  days: number[] = this.getSortedWeekdays();

  hours: OpeningPeriod[];

  nearby$: Observable<PagedResponseDto<LabLocationEntity>>;

  expandAbout: boolean = false;

  LabCompany = LabCompany;

  OpenStatus = OpenStatus;

  private unsubscribe$ = new Subject<void>();

  constructor(
    private readonly labLocationService: LabLocationService,
    private readonly route: ActivatedRoute,
    private readonly labCompanyMeta: LabCompanyMetaService
  ) {}

  ngOnInit() {
    this.route.data.pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
      this.location = data.location;

      if (!(this.location instanceof LabLocationEntity)) {
        throw new TypeError("The property 'location' is required");
      }

      /* Update meta details for the selected PSC */
      this.labCompanyMeta.setMeta(this.location.lab, this.location);

      this.nearby$ = this.labLocationService
        .list({
          limit: '4',
          lab: this.location.lab,
          near: [this.location.address.geocoding.coordinates[0], this.location.address.geocoding.coordinates[1]].join(',')
        })
        .pipe(
          map(results => {
            // We need 3 nearest locations, so request 4 and remove the first one since it should be the same location
            // as this page is already displaying

            results.data = results.data.slice(1);
            return results;
          })
        );
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  getSortedWeekdays(): number[] {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      days.push(getISODay(addDays(today, i)));
    }
    return days;
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

  isOpen(day: number): boolean {
    return this.location.hours.periods.some(period => period.open.day === day);
  }

  getOpeningTime(day: number): string | null {
    const period = this.location.hours.periods.find(p => p.open.day === day);
    return period && period.open ? period.open.time : null;
  }

  getClosingTime(day: number): string | null {
    const period = this.location.hours.periods.find(p => p.close.day === day);
    return period && period.close ? period.close.time : null;
  }

  getOpenStatus(day: number): OpenStatus {
    /* Negative cases - if the location's hours are not available at all, return the NotAvailable case.  Otherwise, query the day number
     * in the set of periods... */
    return !this.location.hours || !this.location.hours.periods || !this.location.hours.periods.length
      ? OpenStatus.NotAvailable
      : this.isOpen(day)
      ? OpenStatus.Open
      : OpenStatus.Closed;
  }
}
