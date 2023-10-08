import { UrlSegment } from '@angular/router';
import { IRouteMatcher, RouteMatcher } from '../utils/routing.utils';
import { getPeerReferrerCode } from '../utils/referrer.utils';

@RouteMatcher('root')
export class PeerReferralRouteMatcher implements IRouteMatcher {
  match(segments: UrlSegment[]): { consumed: UrlSegment[] } {
    return {
      consumed: !!getPeerReferrerCode(segments) ? segments : [],
    };
  }
}
