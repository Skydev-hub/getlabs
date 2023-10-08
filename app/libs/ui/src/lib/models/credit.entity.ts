import { Type } from 'class-transformer';
import { isAfter, isBefore } from 'date-fns';
import { DateRangeEmbed } from './date-range.embed';

export enum CreditSourceEnum {
  Referral = 'Referral',
  ExcessRefund = 'ExcessRefund',
  Other = 'Other',
}

export const CreditSourceLabels = {
  [CreditSourceEnum.Referral]: 'Client Referral',
  [CreditSourceEnum.ExcessRefund]: 'Excess Refund',
  [CreditSourceEnum.Other]: 'Other',
};

export class CreditEntity {

  public id: string;

  public source: CreditSourceEnum;

  public originalAmount: number;

  public currentAmount: number;

  @Type(() => DateRangeEmbed)
  public validDateRange: DateRangeEmbed;

  public notes: string;

  getAppliedAmount() {
    return this.originalAmount - this.currentAmount;
  }

  isCreditActive() {
    const now = new Date();

    return (!this.validDateRange || (
        (!this.validDateRange.startDate || isAfter(now, this.validDateRange.startDate)) &&
        (!this.validDateRange.endDate || isBefore(now, this.validDateRange.endDate)))
    );
  }
}
