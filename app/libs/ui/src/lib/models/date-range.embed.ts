import { Type } from 'class-transformer';

export class DateRangeEmbed {
  @Type(() => Date)
  public startDate?: Date;

  @Type(() => Date)
  public endDate?: Date;
}
