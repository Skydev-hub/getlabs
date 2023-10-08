import { Transform, Type } from 'class-transformer';
import { parseISO } from 'date-fns';

export class Timeslot {
  key: string;

  @Type(() => Date)
  start: Date;

  @Type(() => Date)
  end: Date;

  price: number;

  booked?: boolean;

  priority?: boolean;
}

export class DaySlots {
  @Transform(params => {
    return parseISO(params.value.split('Z')[0]);
  })
  date: Date;

  @Type(() => Timeslot)
  slots: Timeslot[];
}

export interface AppointmentSchedule<T = DaySlots> {
  serviceable: boolean;
  data: T[];
  tz: string;
}
