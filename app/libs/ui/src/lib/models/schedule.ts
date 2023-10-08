import { Type } from 'class-transformer';
import { SimpleDateTime } from './simple-date-time.embed';

export class ScheduleDay {
  disabled: boolean;

  // enabled() helper methods for forms
  get enabled(): boolean {
    return this.disabled !== true;
  }

  set enabled(val: boolean) {
    this.disabled = !val;
  }

  @Type(() => OperatingHours)
  hours: OperatingHours[];
}

export class OperatingHours {
  start: string;
  end: string;
}

export class BlackoutPeriod {
  @Type(() => SimpleDateTime)
  start: SimpleDateTime;

  @Type(() => SimpleDateTime)
  end: SimpleDateTime;
}

export class Schedule {
  @Type(() => ScheduleDay)
  monday?: ScheduleDay;

  @Type(() => ScheduleDay)
  tuesday?: ScheduleDay;

  @Type(() => ScheduleDay)
  wednesday?: ScheduleDay;

  @Type(() => ScheduleDay)
  thursday?: ScheduleDay;

  @Type(() => ScheduleDay)
  friday?: ScheduleDay;

  @Type(() => ScheduleDay)
  saturday?: ScheduleDay;

  @Type(() => ScheduleDay)
  sunday?: ScheduleDay;

  @Type(() => BlackoutPeriod)
  blackouts?: BlackoutPeriod[];

  exposeHours?: boolean;
}
