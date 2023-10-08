import { UrlSegment } from '@angular/router';
import { PartnerMetadataHelper } from '../decorators/partner.decorator';
import { IRouteMatcher, RouteMatcher } from '../utils/routing.utils';

@RouteMatcher('root')
export class PartnerRouteMatcher implements IRouteMatcher {
  match(segments: UrlSegment[]): { consumed: UrlSegment[] } {
    return {
      consumed: segments.length === 1 && !!PartnerMetadataHelper.getPartnerMetadata(segments[0].path) ? segments : []
    };
  }
}
