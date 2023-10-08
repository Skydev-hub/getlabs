import { Component, Input, OnInit } from '@angular/core';
import { MarketEntity, ScheduleDay } from '@app/ui';
import { parse as parseDate } from 'date-fns';

@Component({
  selector: 'app-team-market-schedule',
  templateUrl: './market-schedule.component.html',
  styleUrls: ['./market-schedule.component.scss'],
})
export class MarketScheduleComponent implements OnInit {

  @Input()
  market: MarketEntity;

  days: string[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  ngOnInit() {
    if (!(this.market instanceof MarketEntity)) {
      throw new TypeError('The input \'market\' must be an instance of MarketEntity');
    }
  }

  getScheduleDay(day: string): ScheduleDay {
    return this.market.schedule ? this.market.schedule[day] : null;
  }

  convertTimeToDate(time: string): Date {
    return parseDate(time, 'HH:mm', new Date());
  }

}
