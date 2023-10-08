import { CreditSourceEnum } from './credit.entity';
import { DateRangeEmbed } from './date-range.embed';

export class IssueCreditDto {

  public amount: number;

  public source: CreditSourceEnum;

  public validDateRange?: DateRangeEmbed;

  public notes?: string;
}

export class CreditBalanceDto {
  balance: number;
}
