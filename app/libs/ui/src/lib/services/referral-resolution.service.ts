import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isAfter } from 'date-fns';
import { AnalyticsService } from './analytics.service';
import { PatientUser, ReferralEmbed } from '../models/user';
import { combineLatest, Observable, of } from 'rxjs';
import { filter, share, tap } from 'rxjs/operators';
import { isEqual } from 'lodash-es';
import { cloneDeep } from 'lodash-es';
import { AuthService } from './auth.service';
import { ReferrerService } from './referrer.service';

/* Serves more as a deferred operation guard than a resolver. */
@Injectable({
  providedIn: 'root'
})
export class ReferralResolutionService {
  constructor(
    @Inject(DOCUMENT) private readonly document: Document,
    @Inject(PLATFORM_ID) private readonly platformId: Object,
    private readonly authService: AuthService,
    private readonly analyticsService: AnalyticsService,
    private readonly referrerService: ReferrerService,
  ) {}

  resolve(): Observable<ReferralEmbed> {
    const user$ = this.authService.user$.asObservable().pipe(
      filter(user => {
        const patientUser = user as PatientUser;

        /* Filter out all user object changes that do not result in a change in referrer. */
        return !!patientUser && patientUser instanceof PatientUser &&
          !this.referrerService.referralsAreEqual(patientUser.partnerReferral && patientUser.partnerReferral.length && patientUser.partnerReferral[0],
            this.referrerService.getReferrerSnapshot());
      }),
      tap(user => {
        const patientUser = user as PatientUser;

        /* Upon completion of the user resolution, attempt to update the locally-stored referrer.  At this point, we do not care if it's
         * successful or not - we'll check that below with WebEntry. */
        if (patientUser.partnerReferral && patientUser.partnerReferral.length) {
          this.referrerService.setReferrer(patientUser.partnerReferral[0], PatientUser);
        }
      }),
      share()
    );

    /* We always invoke the web entry operation with the uri referrer. */
    const webEntryReferrer = isPlatformBrowser(this.platformId) ?
      this.analyticsService.webEntry(this.referrerService.generateReferral()).pipe(share()) : of(null);
    webEntryReferrer.subscribe();

    /* Configure the locally known referrer via the cookie/uri vectors - we'll use that value to resolve this resolver, while we want for
     * the asynchronous resolution of referrals performed via the WebEntry and PatientUser resolution vectors */
    const localReferral = this.referrerService.configReferrer();

    /* We'll also query the results of the web-entry API endpoint.  This call is very asynchronous to the retrieval of the patient
     * user object, and neither call can delay the status of the other.  Thus, we will create a forkJoin observable to trigger when
     * both API calls independently complete, and the handler for that fork join will check to see if the user's referrer method needs
     * to be updated.  These operations should be NON-BLOCKING, thus the consumer of this resolver will only wait on the resolution
     * of the user object. */
    combineLatest([
      user$,
      webEntryReferrer,
    ]).subscribe(result => {
      // TODO once things stabilize a bit, we need to refactor the observable chain in combineLatest so that only one of these updates
      //  takes place at once.  In cases where the user has a new analytics token, this subscription is called 3 (!) times because of
      //  the various user$ emissions during the app loading procedure (those are all GET calls that complete before the PATCH call
      //  initiated below has time to fully execute.)  To replicate:
      //  Open the getlabs app (not website) as an unauthenticated user, routing to /labcorp (this page should not exist on the app,
      //  but it's useful in reproducing this).
      //  Go to getlabs.com.
      //  Route back to the app sign in (root path) and sign in as a user who has a referrer object.
      const user = result[0] as PatientUser;

      /* Here, now that we know our local referrer reflects whatever is most current through the WebEntry / UserProfile / Cookie channels, we can
       * determine if the referrer object currently persisted is valid.  If it's not, we will need to update it.  We will also need to issue an
       * update if the user is coming in under a new analytics token that we have not previously tracked. */
      const snapshot = this.referrerService.getReferrerSnapshot();
      const updatedReferral = cloneDeep(snapshot);

      /* If there is no referral to update, return now as we are not able to update referrer data. */
      if (!updatedReferral) {
        return;
      }

      /* Retrieve the most recently-known referrer object from the user data model. */
      const lastKnownReferral = user.partnerReferral && user.partnerReferral.length && user.partnerReferral[0];
      const updates = cloneDeep(user.partnerReferral);

      /* What happens to updates now depends on the status of the last known referral object vs the snapshot referral object.
       * If the referrer snapshot constitutes a new referral (i.e. referral date is more recent), we will need to push a new referrer object
       * accordingly, as the user has refreshed their referral status / engaged upon a new referral. */
      if (!lastKnownReferral || isAfter(updatedReferral.referralDate, lastKnownReferral.referralDate)) {
        updates.unshift(null);
      }

      /* Otherwise, If the last-tracked partner referral data does not contain the current known analytics token for this particular user (which may
       * change if the user loads getlabs with the analytics cookie removed in any respect), we will need to update it accordingly.
       * We must reunite this with whatever data presently exists in the user object's version of the referrer data, as in the
       * above case, the snapshot would only contain the new analytics token, not the user's old analytics token. */
      else if (!lastKnownReferral.analyticsTokens ||
        !lastKnownReferral.analyticsTokens.includes(this.analyticsService.getAnalyticsUserToken())) {
        updatedReferral.analyticsTokens = (lastKnownReferral.analyticsTokens || [])
          .concat(this.analyticsService.getAnalyticsUserToken());
      }

      updates[0] = updatedReferral;

      /* If any updates have been staged, invoke the update endpoint here. */
      if (updates && updates.length && (!lastKnownReferral || !isEqual(user.partnerReferral, updates))) {
        this.authService.update({ partnerReferral: updates }).subscribe();
      }
    });

    return of(localReferral);
  }
}
