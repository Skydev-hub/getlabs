import { UrlSegment } from '@angular/router';
import { getPathParameters } from '../utils/routing.utils';

export const getPeerReferrerCode = (path: string | UrlSegment[]) => {
  /* Delegate to getPathParameters, and read the resulting object */
  return getPathParameters<{ referrerCode: string }>('/r/:referrerCode', path).referrerCode;
};
