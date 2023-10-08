import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AppointmentEntity, AppointmentStatus, ComplexFilterCriterion, FilterCriteria, MarketService, SpecialistUser, SpecialistUserService } from '@app/ui';
import { addDays, format as formatDate, isSameDay, isValid, parse as parseDate, subDays } from 'date-fns';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  AppointmentFilterCriterion,
  AppointmentsTableComponent,
  AppointmentsTableOptions,
  AppointmentTableColumn,
  CommonComplexFilterOptions,
} from '../../../shared/components/appointments-table/appointments-table.component';
import { DateRange } from '../../../shared/components/form/input/date-range-input/date-range-input.component';
import { StatusPipe } from '../../../shared/pipes/status.pipe';

/* Defines the effective modes we will use for querying appointments from the backend */
enum DateSelectionMode {
  CyclicalNavigator = 'CyclicalNavigator',
  Range = 'Range',
}

/* Defines the initialization logic that will be used to set the initial value of the selected date criteria
 * according to each respective mode. */
const DateSelectionModes: { [key in DateSelectionMode]: { getInitValue: (dateRange: DateRange) => DateRange } } = {
  [DateSelectionMode.CyclicalNavigator]: {
    getInitValue: (dateRange) => {
      return { start: dateRange.start, end: null };
    },
  },

  [DateSelectionMode.Range]: {
    getInitValue: (dateRange) => {
      return { start: dateRange.start, end: addDays(dateRange.start, 5) };
    },
  },
};

/* Defines the various criteria that we will use to filter appointments */
class AppointmentsTableFilterCriteria extends FilterCriteria<AppointmentEntity, AppointmentFilterCriterion<any>> {
  public specialist = new AppointmentFilterCriterion<SpecialistUser>(
    'specialist',
    (specialist) => (specialist ? `${specialist.firstName} ${specialist.lastName}` : 'No Assigned Specialist'),
    {
      getQueryVal: (specialist) => (specialist && specialist.id) || false,
      anchorLabel: 'Specialist',
    }
  );

  public status = new AppointmentFilterCriterion<AppointmentStatus>('status', (status) => StatusPipe.getStatusString(status), {
    options: Object.values(AppointmentStatus),
    anchorLabel: 'Status',
  });

  /* Custom filtering column that takes various common situations into consideration. */
  public common = new ComplexFilterCriterion<AppointmentEntity>(
    [
      CommonComplexFilterOptions.NotCancelledOption,
      {
        properties: {
          labOrderDetails: {
            labOrderFiles: {
              id: {
                value: true,
              },
            },
          },
        },
        label: 'Lab Order Uploaded',
      },
      {
        properties: {
          isMedicare: {
            value: true,
          },
        },
        label: 'Medicare Appointments',
      },
    ],
    {
      showAllOptions: true,
      anchorLabel: 'Common',
    }
  );
}

@Component({
  templateUrl: './appointments-page.component.html',
  styleUrls: ['./appointments-page.component.scss'],
})
export class AppointmentsPageComponent implements OnInit, OnDestroy {
  public Column = AppointmentTableColumn;

  public dateSelectionMode: DateSelectionMode = DateSelectionMode.CyclicalNavigator;

  public DateSelectionMode = DateSelectionMode;

  public tableFilters = new AppointmentsTableFilterCriteria();

  @ViewChild(AppointmentsTableComponent, { static: true })
  public appointmentsTableComponent: AppointmentsTableComponent;

  public appointmentTableOptions: AppointmentsTableOptions = {
    onFilterChange: (filterSets) => {
      /* If the filter collection ever contains both a status filter and the complex filter criterion's 'not cancelled' option, we should
       * remove the filter option on 'not cancelled' to avoid confusion. */
      const complexIdx = filterSets.findIndex(
        (filterSet) => filterSet.criterion === this.tableFilters.common && filterSet.appliedOptions.includes(CommonComplexFilterOptions.NotCancelledOption)
      );

      if (complexIdx > -1 && filterSets.some((filterSet) => filterSet.criterion === this.tableFilters.status)) {
        /* Annoying nuance required as the logic that responds to and handles filter changes is highly asynchronous */
        setTimeout(() => {
          this.appointmentsTableComponent.unsetFilterOption(filterSets[complexIdx].criterion, CommonComplexFilterOptions.NotCancelledOption);
        }, 0);

        /* Signal that an update of the linked data set is not necessary, as we have pushed an update to the supplied filters, which
         * will come back through the observable chain to this callback. */
        return false;
      }

      /* If we get here, it means that the currently-set batch of filters is OK and does not pose any conflicts */
      return true;
    },
  };

  public dateRangeControl = new FormControl({
    start: new Date(),
    end: addDays(new Date(), 5),
  });

  private subscriptions: Subscription[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private readonly specialistUserService: SpecialistUserService,
    private readonly marketService: MarketService
  ) {}

  get dateRange() {
    return this.dateRangeControl.value;
  }

  set dateRange(dateRange: DateRange) {
    this.dateRangeControl.setValue(dateRange);
  }

  ngOnInit() {
    this.subscriptions.push(
      this.route.queryParamMap.subscribe((params) => {
        try {
          this.dateRangeControl.setValue({ start: parseDate(params.get('date'), 'yyyy-MM-dd', new Date()) });
        } finally {
          if (!this.dateRangeControl.value || !isValid(this.dateRangeControl.value.start)) {
            this.dateRangeControl.setValue({ start: new Date() });
          }
        }
      })
    );

    // /* Whenever the set market changes, we will need to update the currently-known set of appointments. */
    this.subscriptions.push(
      this.marketService.getActiveMarkets$().subscribe(() => {
        this.appointmentsTableComponent.setQueryParameters({ instant: true });

        /* Since we need to retrieve specialist information from the backend to populate the set of specialist criteria, we
         * must perform this data population within an injectable context. */
        // TODO: This should fetch all users, not be hard limited to a specific number
        this.tableFilters.specialist.setOptions(
          this.specialistUserService.list({ limit: '100' }).pipe(
            map((response) => response.data),
            map((response) => {
              /* Add a 'null' value for expressing no assigned specialist cases. */
              response.unshift(null);
              return response;
            })
          )
        );
      })
    );
  }

  navigateToDate(day: Date) {
    this.router.navigate(['.'], {
      relativeTo: this.route.parent,
      queryParams: {
        date: formatDate(day, 'yyyy-MM-dd'),
      },
    });
  }

  setDateSelectionMode(dateSelectionMode: DateSelectionMode) {
    /* Update the current date selection mode */
    this.dateSelectionMode = dateSelectionMode;

    /* Update the current control value to an acceptable value for the new selection mode */
    this.dateRangeControl.setValue(DateSelectionModes[this.dateSelectionMode].getInitValue(this.dateRangeControl.value));
  }

  previousDay() {
    this.navigateToDate(subDays(this.dateRange.start, 1));
  }

  nextDay() {
    this.navigateToDate(addDays(this.dateRange.start, 1));
  }

  isYesterday(): boolean {
    return isSameDay(this.dateRange.start, subDays(new Date(), 1));
  }

  isToday(): boolean {
    return isSameDay(this.dateRange.start, new Date());
  }

  isTomorrow(): boolean {
    return isSameDay(this.dateRange.start, addDays(new Date(), 1));
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
