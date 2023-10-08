export enum AwardType {
  OneTimeReferrerCreditAward = 'OneTimeReferrerCreditAward',
}

export class AwardCampaignEntity {
  public awardType: AwardType;

  public name: string;

  public award: number;
}
