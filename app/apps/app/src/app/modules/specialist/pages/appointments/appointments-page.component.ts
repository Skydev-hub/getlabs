import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppointmentEntity, ComplexFilterCriterion, FilterCriteria } from '@app/ui';
import { addDays, format as formatDate, isValid, parse as parseDate, subDays } from 'date-fns';
import {
  AppointmentFilterCriterion,
  AppointmentsTableComponent,
  AppointmentTableColumn, CommonComplexFilterOptions,
} from '../../../shared/components/appointments-table/appointments-table.component';
import {DateRange} from '../../../shared/components/form/input/date-range-input/date-range-input.component';
import {isToday, isTomorrow, isYesterday} from '../../../shared/utils/date.utils';

class AppointmentsPageFilterCriteria extends FilterCriteria<AppointmentEntity, AppointmentFilterCriterion<any>> {
  public common = new ComplexFilterCriterion([CommonComplexFilterOptions.NotCancelledOption]);
}

@Component({
  templateUrl: './appointments-page.component.html',
  styleUrls: ['./appointments-page.component.scss']
})
export class AppointmentsPageComponent implements OnInit {

  public dateRange: DateRange;

  public Column = AppointmentTableColumn;

  public filterCriteria = new AppointmentsPageFilterCriteria();

  @ViewChild(AppointmentsTableComponent, { static: true })
  public appointmentsTableComponent: AppointmentsTableComponent;

  constructor(private router: Router, private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      try {
        this.dateRange = { start: parseDate(params.get('date'), 'yyyy-MM-dd', new Date()) };
      } finally {
        this.dateRange = this.dateRange && isValid(this.dateRange.start) ? this.dateRange : { start: new Date() };
      }
    });

    /* Set the specialist appointment view to view only non-cancelled appointments */
    this.appointmentsTableComponent.setFilterOption(this.filterCriteria.common, CommonComplexFilterOptions.NotCancelledOption);
  }

  navigateToDate(day: Date) {
    this.router.navigate(['.'], {
      relativeTo: this.route,
      queryParams: {
        date: formatDate(day, 'yyyy-MM-dd'),
      }
    });
  }

  previousDay() {
    this.navigateToDate(subDays(this.dateRange.start, 1));
  }

  nextDay() {
    this.navigateToDate(addDays(this.dateRange.start, 1));
  }

  isYesterday(): boolean {
    return isYesterday(this.dateRange.start);
  }

  isToday(): boolean {
    return isToday(this.dateRange.start);
  }

  isTomorrow(): boolean {
    return isTomorrow(this.dateRange.start);
  }

}
