/**
 * Basic response DTO indicates the distinct_id used by mixpanel to track a given user.
 * May be either the mixpanel distinct id, or the user's id property.
 */
import { LabCompany, ReferralData, ReferralEmbed } from './user';
import { SearchParams } from "../utils";

export class AnalyticsResponseDto {
  distinct_id: string;
}

export class WebEntryResponseDto extends AnalyticsResponseDto {
  referral: ReferralEmbed;
}

/**
 * Defines the base interface from which all event data objects will be derived.
 */
export interface AnalyticsEventData {
  [key: string]: any;
}

/**
 * Defines the base interface from which all event classes will be derived.
 */
export interface IAnalyticsEvent<T extends AnalyticsEventData = AnalyticsEventData> {
  getName: () => string;
  getData?: () => AnalyticsEventData;
}

/**
 * AnalyticsEventDto is a simple IAnalyticsEvent implementation that is used to describe event objects dispatched by the
 * front end.
 */
export class AnalyticsEventDto<T extends AnalyticsEventData = AnalyticsEventData> implements IAnalyticsEvent<T> {
  constructor(private name: string, private data: AnalyticsEventData) {}

  public getName() {
    return this.name;
  }

  public getData() {
    return this.data;
  }
}

/**
 * AnalyticsAliasDto is a basic DTO that is used when a user is registered with getlabs; it effectively indicates the old
 * Mixpanel distinct id that maps to the id of the user in context when the alias endpoint is invoked.
 */
export class AnalyticsAliasDto {
  distinct_id: string;
}

export enum ReferrerType {
  SearchEngine = 'SEARCH_ENGINE',
  Direct = 'DIRECT',
  Partner = 'PARTNER',
  MarketingCampaign = 'MARKETING_CAMPAIGN',
  Refresh = 'REFRESH',
  InterAppTraversal = 'INTER_APP_TRAVERSAL',
  Peer = 'PEER',
  Other = 'OTHER',
}

export class WebEntryDto {
  referrerType: ReferrerType;
  referrer?: LabCompany;
  referrerUri: string;
  isCrawler: boolean;
  data: ReferralData;
  targetDestination: string;
  domain: string;
  queryParams: SearchParams;
}
