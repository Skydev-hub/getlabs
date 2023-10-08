import { Component, Input, OnInit } from '@angular/core';
import { parse as parseDate } from 'date-fns';
import { ScheduleDay, SpecialistUser } from '@app/ui';

@Component({
  selector: 'app-team-specialist-schedule',
  templateUrl: './specialist-schedule.component.html',
  styleUrls: ['./specialist-schedule.component.scss']
})
export class SpecialistScheduleComponent implements OnInit {

  @Input()
  user: SpecialistUser;

  days: string[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  constructor() { }

  ngOnInit() {
    if (!(this.user instanceof SpecialistUser)) {
      throw new TypeError('The input \'user\' must be an instance of SpecialistUser');
    }
  }

  getScheduleDay(day: string): ScheduleDay {
    return this.user.schedule ? this.user.schedule[day] : null;
  }

  convertTimeToDate(time: string): Date {
    return parseDate(time, 'HH:mm', new Date());
  }

}
