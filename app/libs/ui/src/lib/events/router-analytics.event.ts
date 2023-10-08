import { parse as qsParse } from 'querystring';
import { parse } from 'url';
import { PartnerMetadataHelper } from '../decorators';
import { PeerReferralData, ReferralData, ReferrerType } from '../models';
import { AnalyticsEventData, AnalyticsEventDto } from '../models/analytics.dto';
import { ConfigurationService } from '../services';
import { getPeerReferrerCode } from '../utils/referrer.utils';

/**
 * Defines event data for RouterAnalyticsEvent.
 */
export interface RouterAnalyticsEventData extends AnalyticsEventData {
  targetDestination: string;
  isRedirected: boolean;
  redirectedDestination: string;
  source: string;
}

/**
 * Defines an analytics event that describes an app routing action.
 */
export class RouterAnalyticsEvent extends AnalyticsEventDto {
  private static readonly EventName = 'Router';

  constructor(data: RouterAnalyticsEventData) {
    super(`${ RouterAnalyticsEvent.EventName }:${ data.targetDestination.replace(/\//g, ':') }`, data);
  }
}

export interface ReferrerDescriptor {
  type: ReferrerType;
  data: { [key: string]: any }
}

/**
 * A set of constants that are used internally to identify various types of referrers.
 */
const IdKeys = {
  GL_CAMPAIGN: 'glCampaign',
  GL_CAMPAIGN_TYPE: 'glCampaignType',
  GL_AD_GROUP: 'glAdGroup',
  GL_KEYWORD: 'glKeyword',
  GL_PARTNER: 'ref',
  GL_PEER: 'r',
};

/**
 * Defines a given web referral vector (the method by which the user arrived at getlabs).
 */
// TODO - maybe some work left to do with this w.r.t. naming & use of this class vs. ReferrerType
export class ReferrerTypeDesc {

  /**
   * Represents referrers that are search engines.
   */
  public static [ReferrerType.SearchEngine] = new ReferrerTypeDesc(ReferrerType.SearchEngine, (() => {
    return [
      'google', 'bing', 'yahoo', 'duckduckgo', 'aol',
    ].map(searchEngine => {
      /* Form regex for this search engine. */
      return new RegExp(`^http[s]?:\\/\\/[^\\/]*${ searchEngine }\\..*`);
    });
  })(), uri => {
    return { searchEngine: parse(uri).hostname };
  });

  /**
   * Represents cases where users come to getlabs directly (i.e. direct URL invocation)
   */
    // TODO needs to be deprioritized as a last resort... use priority method instead
  public static [ReferrerType.Direct] = new ReferrerTypeDesc(ReferrerType.Direct, (config, uri, path) => {
    return !uri && !isReload() && !path.includes('ref');
  });

  /**
   * Represents cases where users are referred to getlabs from our partners (doctor's offices,
   * clinics, labcorp, etc.)
   */
  public static [ReferrerType.Partner] = new ReferrerTypeDesc(ReferrerType.Partner, (config, uri, currentPath) => {
    const referrerUri = uri && new URL(uri);

    /* For partner referrals, we have to inspect the current URL's query string as well. */
    return currentPath.indexOf(`${ IdKeys.GL_PARTNER }=`) > -1 ||
      !!ReferrerTypeDesc.getPathPartnerCompany(currentPath) ||

      /* Fallback case - it seems that the 'ref' query param is being excluded by LabCorp in some cases.  In that event,
       * we will need to inspect the hostname of the referrerUri to determine if LC (or perhaps someone else) referred us. */
      !!(referrerUri && ReferrerTypeDesc.getPartnerCompany(referrerUri.hostname));

  }, (uri, currentPath) => {
    const queryVal = ReferrerTypeDesc.getUriQueryVal(currentPath, IdKeys.GL_PARTNER);
    const metadata = queryVal && PartnerMetadataHelper.getPartnerMetadata(queryVal);

    const referrer = (metadata && metadata.key) || ReferrerTypeDesc.getPathPartnerCompany(currentPath) ||
      ReferrerTypeDesc.getPartnerCompany(uri);

    const data: ReferralData = {
      referrer,
    };

    return data;
  }, 1001);

  public static [ReferrerType.InterAppTraversal] = new ReferrerTypeDesc(ReferrerType.InterAppTraversal, (config, uri, currentPath) => {
    /* Evaluate the inbound referrer URI to determine if it came from a getlabs subdomain */
    try {
      return new URL(uri).hostname.endsWith(config.getDomain());
    } catch (err) {
      /* Catch block will execute if the uri is not defined / is an empty string... */
      return false;
    }
  }, null);

  /**
   * Represents cases where users are referred to getlabs from marketing campaigns (either email or
   * web).
   */
  public static [ReferrerType.MarketingCampaign] = new ReferrerTypeDesc(ReferrerType.MarketingCampaign, (config, uri, currentPath) => {
    /* For marketing campaigns, we have to inspect the current url's query string. */
    // const query = window.location.search;
    return currentPath.indexOf(IdKeys.GL_CAMPAIGN) > -1;
  }, (uri, currentPath) => {
    return {
      campaignType: ReferrerTypeDesc.getUriQueryVal(currentPath, IdKeys.GL_CAMPAIGN_TYPE),
      campaign: ReferrerTypeDesc.getUriQueryVal(currentPath, IdKeys.GL_CAMPAIGN),
      adGroup: ReferrerTypeDesc.getUriQueryVal(currentPath, IdKeys.GL_AD_GROUP),
      keyword: ReferrerTypeDesc.getUriQueryVal(currentPath, IdKeys.GL_KEYWORD),
    };
  }, 999);

  /**
   * Represents cases where users simply refresh a browser window already on getlabs - useful for identifying
   * weaknesses, usability issues, and infrastructure problems.
   */
  public static [ReferrerType.Refresh] = new ReferrerTypeDesc(ReferrerType.Refresh, isReload);

  public static [ReferrerType.Peer] = new ReferrerTypeDesc(ReferrerType.Peer, (config, uri, currentPath) => {
    /* In order for a given referral to be recognized as a peer referral, the path must conform to the /r/[referralId] pattern */
    // const regex = new RegExp(`^\\/${ IdKeys.GL_PEER }\\/[^\\/]*$`, 'i');
    // return regex.test(currentPath);
    return !!getPeerReferrerCode(currentPath);
  }, (uri, currentPath) => {
    /* Extract the content to the right of the referral indicator... */
    const data: PeerReferralData = {
      referralLink: getPeerReferrerCode(currentPath),
    };

    return data;
  }, 1000);

  /**
   * Represents fallback cases where users reach getlabs through other means.
   */
  public static [ReferrerType.Other] = new ReferrerTypeDesc(ReferrerType.Other, () => false);

  /**
   * An array of strings / RegExp objects that define URL patterns used to identify a given referrer type.
   */
  private readonly matcher: Array<String | RegExp>;

  /**
   * A custom matcher function that returns a boolean indicating whether or not the type matches the supplied uri.
   */
  private readonly matcherFn: ((config: ConfigurationService, uri: string, currentPath?: string) => boolean);

  private static getPartnerCompany(text: string, getRegex?: (companyRegexStr: string) => RegExp) {
    /* Retrieve the metadata object for which the key/an alias is found in the supplied text parameter */
    const metadata = PartnerMetadataHelper.getPartnerMetadata(text, false);

    /* If getRegex is supplied, ensure that this metadata or one of its aliases passes the supplied regex expression as well. */
    return metadata &&
      (!getRegex || [metadata.key].concat(metadata.aliases || []).some(moniker => getRegex(moniker).test(text))) &&
      metadata.key;
  }

  private static getPathPartnerCompany(path: string) {
    return ReferrerTypeDesc.getPartnerCompany(path, companyRegexStr => new RegExp(`^\\/${ companyRegexStr }$`, 'i'));
  }

  constructor(
    public referrerType: ReferrerType,
    matcher: RegExp | String | Array<String | RegExp> | ((config: ConfigurationService, uri: string, currentPath?: string) => boolean),
    private _getReferralData?: ((uri: string, currentPath?: string) => { [key: string]: any }),
    public priority?: number,
  ) {
    /* Identify the type of matcher. If it's a function, identify it as such in this instance. */
    if (matcher instanceof Function) {
      this.matcherFn = matcher;
    } else {
      /* If it's not a function, coerce the input value into an array if it's not already so. */
      this.matcher = Array.isArray(matcher) ? matcher : [matcher];
    }
  }

  static* [Symbol.iterator]() {
    for (const key of Object.keys(ReferrerTypeDesc)) {
      if (ReferrerTypeDesc[key] instanceof ReferrerTypeDesc) {
        yield ReferrerTypeDesc[key];
      }
    }
  }

  // TODO the introduction of Configuration here means that this class now requires an injectable... which means it should be moved into an Angular context
  //  in some respect.
  /**
   * Retrieves the referrer type that best suits the supplied uri.
   */
  public static getReferrerType(config: ConfigurationService, uri: string, currentPath?: string): ReferrerTypeDesc {
    /* Attempt to find a positive match from the indexed referrer types. */
    const referrerResults: Array<ReferrerTypeDesc> = [];

    for (const referrerType of ReferrerTypeDesc) {
      if (referrerType.isOfType(config, uri, currentPath)) {
        referrerResults.push(referrerType);
      }
    }

    /* If the referrerResults set has one element, we can return that element immediately.  Otherwise, we must
     * evaluate based on priority, as some may overlap. */
    return referrerResults.length === 1 ? referrerResults[0] :
      (referrerResults.length && referrerResults.reduce((highestMatch, referrer) => {
        return !highestMatch || ((highestMatch.priority || 0) < (referrer.priority || 0)) ?
          referrer : highestMatch;
      })) || ReferrerTypeDesc[ReferrerType.Other];
  }

  /**
   * Retrieves the static referrer data that can be gleaned from the referrer/current URI.
   */
  public static getStaticReferrerData(config: ConfigurationService, uri: string, currentPath?: string): ReferrerDescriptor {
    /* Return a descriptor object that contains the referrer type and data together. */
    const typeDesc = ReferrerTypeDesc.getReferrerType(config, uri, currentPath);

    return {
      type: typeDesc.referrerType,
      data: typeDesc.getReferralData(uri, currentPath),
    };
  }

  /**
   * Retrieves the value of specified query parameter from the specified uri.
   */
  private static getUriQueryVal(uri: string, key: string): string {
    /* Extract the query string */
    const mg = /\?.+/.exec(uri);

    /* Return null if the above query did not turn up a query string. */
    if (!mg || !mg.length) {
      return null;
    }

    const queryValues = qsParse(mg[0].slice(1));

    return Array.isArray(queryValues[key]) ? (queryValues[key] as Array<string>).join(',') :
      queryValues[key] as string;
  }

  /**
   * Determines if the supplied URI is the referrer type described by this instance through the means of matcher/
   * matcherFn.
   */
  public isOfType(config: ConfigurationService, uri: string, currentPath?: string) {
    return this.matcherFn ? this.matcherFn(config, uri, currentPath) : !!this.matcher.find(matcher => {
      /* Test the given matcher val against the uri */
      return matcher instanceof RegExp ? matcher.test(uri) : uri.indexOf(String(matcher)) > -1;
    });
  }

  /**
   * Retrieves custom WebEntryAnalyticsData that applies to this particular referrer.
   */
  public getReferralData(uri: string, currentPath?: string): object {
    return this._getReferralData ? this._getReferralData(uri, currentPath) : {};
  }
}

/**
 * Determines if the page load is a refresh.
 */
function isReload(): boolean {
  try {
    const [entry] = window.performance.getEntriesByType('navigation');

    // Navigation Timing Level 2
    if (entry && entry.entryType === 'reload') {
      return true;
    }

    // Navigation Timing Level 1 (deprecated, but not supported by Safari as of Feb 2020)
    const navigation = window.performance.navigation;
    return navigation && navigation.type === navigation.TYPE_RELOAD;
  } catch (err) {
    /* Catch block will execute on SSR, as the window global won't be present. */
    return false;
  }
}
