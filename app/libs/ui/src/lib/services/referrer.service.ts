import { DOCUMENT, isPlatformBrowser, Location } from '@angular/common';
import { Inject, Injectable, Injector, PLATFORM_ID, Type } from '@angular/core';
import { plainToClass } from 'class-transformer';
import { addYears, isAfter, isBefore } from 'date-fns';
import { castArray, isEqual, sortBy } from 'lodash-es';
import { CookieService } from 'ngx-cookie';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { PartnerMetadataHelper, PartnerOperator } from '../decorators/partner.decorator';
import { ReferrerTypeDesc } from '../events/router-analytics.event';
import { ReferrerType } from '../models/analytics.dto';
import { LabCompany, ReferralData, ReferralEmbed } from '../models/user';
import { ReferralResolve, ReferrerResolutionMethod } from '../services/analytics.service';
import { ConfigurationService } from './configuration.service';
import { ErrorService } from './error.service';
import { IPartnerService, PartnerService } from './partner.service';

const glRefCookieKey = `GlPartner`;
const ReferrerOperatorKey = 'ReferrerOperator';

/**
 * Referral-specific service for managing Referrer definitions (which is an adherent type of Partner)
 */
@Injectable({
  providedIn: 'root',
})
export class ReferrerService implements IPartnerService {

  private referrerVectors: { [key: string]: ReferrerOperator } = {};

  private referrer$: BehaviorSubject<ReferralResolve> = new BehaviorSubject<ReferralResolve>(null);

  constructor(
    private readonly injector: Injector,
    private readonly location: Location,
    private readonly cookieService: CookieService,
    private readonly partnerService: PartnerService,
    private readonly errorService: ErrorService,
    @Inject(PLATFORM_ID) private readonly platformId: string,
    @Inject(DOCUMENT) private readonly document: Document,
    private readonly config: ConfigurationService,
  ) {
  }

  public acknowledge(referral: ReferralEmbed): Observable<boolean> {
    /* If the referral is active, we will evaluate the result by interrogating its corresponding referral service.  If the
     * referral is not active, and fallback is set to true, we will attempt ot interrogate the base partner acknowledgement
     * method for non-referred cases, if available.  */
    const referralService = referral.referralMethod === ReferrerType.Partner &&
      this.isReferralActive(referral) &&
      this.hasReferrerOperator(referral.data.referrer) &&
      this.getService(referral.data.referrer);

    return referralService ? referralService.acknowledge({ referral }) : of(null);
  }

  public isReferralActive(referral: ReferralEmbed, options: {
    company?: string | string[],
    type?: ReferrerType,
    isRevenuePartner?: boolean,
    queryDate?: Date,
  } = {}) {
    /* If referral is not defined, or there is a referral type mismatch, then the referral it cannot ever be regarded as active. */
    if (!referral || (options.type && options.type !== referral.referralMethod)) {
      return false;
    }

    /* Non-partner referrals are always regarded as active (but only if target type is not defined /
     * referral type matches the target type). */
    if (referral.referralMethod !== ReferrerType.Partner) {
      return !options.type || options.type === referral.referralMethod;
    }

    const queriedCompany = options.company ? castArray(options.company) : [];

    /* If the partner company is somehow undefined, or if a queried company is defined, and that company does not
     * match the current referral company, return false. */
    if (!referral.data || !referral.data.referrer || (queriedCompany.length && !queriedCompany.includes(referral.data.referrer))) {
      return false;
    }

    /* Resolve the service corresponding to the active referral, and determine whether the referral is active */
    return options.isRevenuePartner ?
      this.hasReferrerOperator(referral.data.referrer) && this.getService(referral.data.referrer).isActive(referral.referralDate, options.queryDate) :
      this.partnerService.getPartnerDescriptor(referral.data.referrer).isActive(referral.referralDate, options.queryDate);
  }

  public generateReferral(): ReferralEmbed {
    /* Determine the referrer type */
    const referrerUri = (isPlatformBrowser(this.platformId) && this.document.referrer) || '';

    const referrerDesc = ReferrerTypeDesc.getStaticReferrerData(this.config, referrerUri, this.location.path());

    /* Generate the freeform referrer data from the referrer type.  If we are dealing with a partner referral, we will also
     * need to retrieve partner-specific data. */
    // const data = ;

    return plainToClass(ReferralEmbed, {
      partner: referrerDesc.data && referrerDesc.data.referrer,
      analyticsToken: null,
      referralDate: new Date(),
      referralMethod: referrerDesc.type,
      data: {
        ...referrerDesc.data,
        ...(referrerDesc.type === ReferrerType.Partner && this.hasReferrerOperator(referrerDesc.data.referrer) ?
          this.getService(referrerDesc.data.referrer).getReferrerVectorData(referrerUri, this.location.path()) : null),
      },
    });
  }

  /**
   * Async access for referrer data...
   */
  public getReferrer$() {
    return this.referrer$.asObservable();
  }

  /**
   * Sync access for referrer data...
   */
  public getReferrerSnapshot() {
    const resolvedReferralData = this.referrer$.getValue();
    return resolvedReferralData && resolvedReferralData.referral;
  }

  public setReferrer(data: ReferralEmbed, source?: ReferrerResolutionMethod): boolean {
    const referrerSnapshot = this.getReferrerSnapshot();

    /* Due to the asynchronous nature of how this data is updated, retrieved, and handled, we will need to perform evaluations here to
     * ensure that the inbound referrer data should indeed be set.
     * We always prioritize partner referrals; otherwise, we'll need to go forward with the referral that is indicated as newer.
     * However, there still may be a need to update the analytics token, so we can't make a call straight away as to whether or not this
     * update is ignorable... */
    const updates = this.isDisqualifiedUpdate(data) ? (referrerSnapshot && {
      ...referrerSnapshot,
      /* If the inbound referral object is older than the current object, we should discard the analytics tokens, as the inbound referrer's details
       * are indicative of a previous referral.  In this case, we only want to track all new tokens that are generated on or after the current
       * referral; referrer tokens on older referral objects will already be tracked in their respective object in the user's set of referrals. */
      analyticsTokens: isAfter(data.referralDate, referrerSnapshot.referralDate) ?
        this.mergeTokens(referrerSnapshot.analyticsTokens, data && data.analyticsTokens) : referrerSnapshot.analyticsTokens,
    }) : data;

    /* Return val indicates that no referral update was necessary. */
    if (this.referralsAreEqual(updates, referrerSnapshot)) {
      return false;
    }

    /* Update the referral cookie data with the inbound referral descriptor. */
    /* Set a cookie for this referrer, so it may be read when the client requests this webpage without accessing it through a
     * referral URL... */
    this.cookieService.putObject(glRefCookieKey, updates, {
      expires: addYears(new Date(), 2),
      domain: this.config.getCookieDomain(),
    });

    this.referrer$.next({ referral: updates, method: source });

    /* Val indicates that referral was updated successfully. */
    return true;
  }

  configReferrer(): ReferralEmbed {
    /* If we detect a partner referrer, we will have to set the referrer object with the associated
     * partner details immediately (SSR-friendliness). */
    /* First, detect the referral method from solely the referred and current uris. */
    let localReferral = this.generateReferral();

    /* If the uriReferrer is not defined, or it is not a partner referral, we will need to examine what referrer object is present in
     * the local cache (i.e. cookies). */
    if (!localReferral || localReferral.referralMethod !== ReferrerType.Partner) {
      const rawCookie = this.cookieService.getObject(glRefCookieKey);
      const cookieRef: ReferralEmbed = rawCookie && plainToClass(ReferralEmbed, rawCookie);

      /* If the cookie referral is that of a partner, it will need to take precedence.  Otherwise, whatever is defined in the
       * uriReferrer will take precedence. */
      localReferral = cookieRef && cookieRef.referralMethod === ReferrerType.Partner ? cookieRef :
        localReferral || cookieRef;
    }

    /* If either of the above resolution methods resulted in retrieving a referrer object, set that now, and return an
     * observable wrapping that referrer. */
    if (localReferral) {
      this.setReferrer(localReferral, 'Local');
    }

    /* Otherwise, return the observable returned from the web entry call (if available) */
    return localReferral;
  }

  /**
   * Determines if the supplied partner company has a defined referrer operator (as defined through the @Referrer annotation)
   */
  private hasReferrerOperator(partner: string) {
    /* Query the metadata for the supplied partner - if it has a referrer operator, the partner has a referrer operator that can
     * perform referral-related operations. */
    const partnerDescriptor = this.partnerService.getPartnerDescriptor(partner);
    return partnerDescriptor && !!partnerDescriptor.getOperator(ReferrerOperatorKey);
  }

  private isDisqualifiedUpdate(data: ReferralEmbed) {
    const currentReferral = this.getReferrerSnapshot();

    /* First step, part a -- we currently only support partner referrals.  We have intentions of tracking all referrals on the app DB layer
     * and on the front end, but this will require us to transform the referral embed into its own entity, which will have a many-to-one
     * relationship with the patient user entity.  Thus, for now, we will return true on all non-partner referrals. */
    if (data && data.referralMethod !== ReferrerType.Partner) {
      return true;
    }

    /* First step, part b - if the current referral is not defined, or the inbound referral is not defined, there is no way an update could be
     * logically disqualified. */
    if (!currentReferral || !data) {
      return false;
    }

    /* Second step, if the current referral and the inbound referral are either both active partner referrals, or are both NOT active
     * partner referrals, perform adjudication based on date. */
    if ((this.isReferralActive(data, { type: ReferrerType.Partner }) ===
      this.isReferralActive(currentReferral, { type: ReferrerType.Partner }))) {
      return isBefore(data.referralDate, currentReferral.referralDate);
    }

    /* Third step, if the current referral is an active partner referral, then the inbound referral is ALWAYS disqualified.
     * We have already determined above that the inbound referrer and the current referrer cannot be of the same status,
     * thus we know that if this below expression returns true, then the inbound referrer cannot possibly describe a
     * partner referral. */
    return this.isReferralActive(currentReferral, { type: ReferrerType.Partner });
  }

  private getService(referrer: LabCompany) {
    /* If a given referrer vector does not exist, instantiate it now. */
    if (!this.referrerVectors[referrer]) {
      /* Retrieve the partner descriptor for the supplied company, and extract the referral service */
      const descriptor = this.partnerService.getPartnerDescriptor(referrer);

      /* Type safety - ensures that the service registered against this referrer is an instance of ReferrerOperator. */
      this.referrerVectors[referrer] = descriptor && descriptor.getOperator(ReferrerOperatorKey);
    }

    /* If a referrer service for this particular referrer does not exist, log a message in the console. */
    if (!this.referrerVectors[referrer]) {
      console.warn(`Cannot perform referral action for ${ referrer }; no vector class for this referrer has been defined.`);
    }

    return this.referrerVectors[referrer];
  }

  private mergeTokens(analyticsTokensA: string[], analyticsTokensB: string[]) {
    /* If both arrays are equal, or one array is not an array, return a copy of one of the arrays. */
    if (analyticsTokensA === analyticsTokensB || isEqual(analyticsTokensB, analyticsTokensA) ||
      (!Array.isArray(analyticsTokensA) || !Array.isArray(analyticsTokensB))) {
      return (analyticsTokensA || analyticsTokensB).slice();
    }

    /* Otherwise, create a combined array from all unique values. */
    return analyticsTokensA.concat(analyticsTokensB.reduce((reduced, analyticsToken) => {
      /* If the current token is not found in analyticsTokensA, track it. */
      if (analyticsTokensA.indexOf(analyticsToken) === -1) {
        reduced.push(analyticsToken);
      }

      return reduced;
    }, []));
  }

  public referralsAreEqual(r1: ReferralEmbed, r2: ReferralEmbed) {
    /* Short circuit - if the referrals pass equality tests, or both are falsy, we can return a result now... */
    if (r1 === r2 || (!r1 && !r2)) {
      return true;
    }

    /* Next step - if only one object is falsy, we know that we are dealing with different referrer objects. If both are truthy,
     * before we do a deep comparison, we will check the length of the tokens arrays.  If they are of different lengths, then we
     * know the objects are not equal. */
    if ((!r1 || !r2) ||
      (r1.analyticsTokens && r1.analyticsTokens.length) !== (r2.analyticsTokens && r2.analyticsTokens.length)) {
      return false;
    }

    /* Next step - check with deep equality while taking array order into consideration */
    return isEqual({
      ...r1,
      analyticsTokens: sortBy(r1.analyticsTokens),
    }, {
      ...r2,
      analyticsTokens: sortBy(r2.analyticsTokens),
    });
  }
}

// TODO - we are going to remove the referrer decorator in favour of an expanded partner decorator.  The lines between "Partner" and
//  referrer are starting to become blurred and admittedly confusing, so it's likely in our best interest to add referrer-tier
//  functionality to the partner level, and stub in no-op cases for partners that do not have a bearing on actual app functionality.
//  The bulk of the confusion comes from conflating the concept of a "Referrer" as it's defined by this service (i.e. any particular
//  external resource that refers someone to Getlabs in any shape, including search engines, marketing campaigns, etc.), and the
//  concept of a referrer as it's defined by the Referrer decorator (i.e. a special type of partner that has functional impacts
//  on gl components).
/**
 * Identifies a ReferrerOperator the supplied lab company.  Referrers are recognized as a constituent component
 * of Partners.  Marking a ReferrerOperator indicates that a given class manages the specific referrer-based logic
 * for a given lab company.  Referrers will be set in the Partner system as a separate type of operator (ReferrerOperator),
 * and will thus not replace Partner-level operators (PartnerOperator).
 */
export function Referrer(labCompany: LabCompany) {
  return (referrerOperator: Type<ReferrerOperator>) => {
    /* Add the decorated class as an operator */
    PartnerMetadataHelper.addOperator(referrerOperator, labCompany, ReferrerOperatorKey);
  };
}

/**
 * Interface that describes the object shape of acknowledgement data objects passed through the acknowledge
 * operation.  Contains referrer information.
 */
export interface ReferrerVectorAcknowledgementData<T = ReferralData> {
  referral: ReferralEmbed<T>;
}

/**
 * Interface that describes the object shape of classes that manage the logic specific to a given lab company.
 */
export interface ReferrerOperator<T extends ReferralData = ReferralData> extends PartnerOperator {
  acknowledge(data: ReferrerVectorAcknowledgementData<T>): Observable<boolean>;

  getReferrerVectorData(referralUri: string, currentPath: string): T;
}
